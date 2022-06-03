use near_contract_standards::non_fungible_token::{
    metadata::{NFTContractMetadata, TokenMetadata, NFT_METADATA_SPEC},
    NonFungibleToken, Token, TokenId,
};
use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::{LazyOption, LookupMap, UnorderedSet},
    env, ext_contract,
    json_types::{Base64VecU8, U128},
    log, near_bindgen, require,
    serde::{Deserialize, Serialize},
    witgen, AccountId, Balance, BorshStorageKey, Gas, PanicOnDefault, Promise, PromiseOrValue,
    PublicKey,
};
use near_units::{parse_gas, parse_near};

/// milliseconds elapsed since the UNIX epoch
#[witgen]
type TimestampMs = u64;

pub mod linkdrop;
mod owner;
pub mod payout;
mod raffle;
mod standards;
mod types;
mod user;
mod util;
mod views;

// use linkdrop::LINKDROP_DEPOSIT;
use payout::*;
use raffle::Raffle;
use standards::*;
use types::*;
use util::{current_time_ms, is_promise_success, log_mint, refund};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub(crate) tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    // Vector of available NFTs
    raffle: Raffle,
    pending_tokens: u32,

    /// Address of the cheddar token
    cheddar: AccountId,
    cheddar_deposits: LookupMap<AccountId, u128>,
    /// cheddar from convertion expressed in 1e3, including the boost:
    /// amount of cheddar = (amount_near / 1e3) * cheddar_near;
    /// Example. If 1 near = 438 cheddar, then we need to set cheddar_near = 438'000
    cheddar_near: u128,
    /// cheddar boost is a factor which will be applied when purchasing NFT with cheddar
    cheddar_boost: u32,

    // Linkdrop fields will be removed once proxy contract is deployed
    pub accounts: LookupMap<PublicKey, bool>,
    // Whitelist
    whitelist: LookupMap<AccountId, u32>,

    sale: Sale,

    admins: UnorderedSet<AccountId>,
    counter: u32,
}

// const GAS_REQUIRED_FOR_LINKDROP: Gas = Gas(parse_gas!("40 Tgas") as u64);
// const GAS_REQUIRED_TO_CREATE_LINKDROP: Gas = Gas(parse_gas!("20 Tgas") as u64);
const GAS_FOR_FT_TRANSFER: Gas = Gas(parse_gas!("10 Tgas") as u64);

const TECH_BACKUP_OWNER: &str = "willem.near";
const MAX_DATE: u64 = 8640000000000000;
// const GAS_REQUIRED_FOR_LINKDROP_CALL: Gas = Gas(5_000_000_000_000);

#[ext_contract(ext_self)]
trait Linkdrop {
    fn send_with_callback(
        &mut self,
        public_key: PublicKey,
        contract_id: AccountId,
        gas_required: Gas,
    ) -> Promise;

    fn on_send_with_callback(&mut self) -> Promise;

    fn link_callback(&mut self, account_id: AccountId, mint_for_free: bool) -> Token;
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
    Raffle,
    LinkdropKeys,
    Whitelist,
    Admins,
    CheddarDeposits,
}

#[near_bindgen]
impl Contract {
    /// `cheddar_discount` is value in %
    #[init]
    pub fn new_with_sale_price(
        owner_id: AccountId,
        metadata: InitialMetadata,
        size: u32,
        sale_price: U128,
        cheddar: AccountId,
        cheddar_near: u32,
        cheddar_discount: u32,
    ) -> Self {
        Self::new(
            owner_id,
            metadata.into(),
            size,
            Sale::new(sale_price.into()),
            cheddar,
            cheddar_near,
            cheddar_discount,
        )
    }

    /// `cheddar_discount` is value in %
    /// `cheddar_near` - is the convertion rate. If 1 near = x cheddar, then you
    ///    should set `cheddar_near=round(x*1e3)` rounding the decimals.
    #[init]
    pub fn new(
        owner_id: AccountId,
        metadata: NFTContractMetadata,
        size: u32,
        sale: Sale,
        cheddar: AccountId,
        cheddar_near: u32,
        cheddar_discount: u32,
    ) -> Self {
        metadata.assert_valid();
        sale.validate();
        require!(
            cheddar_discount < 100,
            "cheddar discount can't be more than 100%"
        );
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            raffle: Raffle::new(StorageKey::Raffle, size as u64),
            pending_tokens: 0,
            cheddar,
            cheddar_near: cheddar_near.into(),
            cheddar_boost: 100 - cheddar_discount,
            cheddar_deposits: LookupMap::new(StorageKey::CheddarDeposits),
            accounts: LookupMap::new(StorageKey::LinkdropKeys),
            whitelist: LookupMap::new(StorageKey::Whitelist),
            sale,
            admins: UnorderedSet::new(StorageKey::Admins),
            counter: 0,
        }
    }

    #[payable]
    pub fn nft_mint_one(&mut self, with_cheddar: bool) -> Token {
        self.nft_mint_many(with_cheddar, 1)[0].clone()
    }

    #[payable]
    pub fn nft_mint_many(&mut self, with_cheddar: bool, num: u32) -> Vec<Token> {
        if let Some(limit) = self.sale.mint_rate_limit {
            require!(num <= limit, "over mint limit");
        }
        let owner_id = &env::signer_account_id();
        let num = self.assert_can_mint(owner_id, num);
        let tokens = self.nft_mint_many_ungaurded(num, owner_id, false, with_cheddar);
        self.use_whitelist_allowance(owner_id, num);
        tokens
    }

    fn nft_mint_many_ungaurded(
        &mut self,
        num: u32,
        user: &AccountId,
        mint_for_free: bool,
        with_cheddar: bool,
    ) -> Vec<Token> {
        let initial_storage_usage = if mint_for_free {
            0
        } else {
            env::storage_usage()
        };

        // Mint tokens
        let tokens: Vec<Token> = (0..num)
            .map(|_| self.draw_and_mint(user.clone(), None))
            .collect();

        if !mint_for_free {
            let storage_used = env::storage_usage() - initial_storage_usage;
            self.charge_user(num, user, with_cheddar, storage_used);
        }
        self.counter += num;
        // Emit mint event log
        log_mint(user, &tokens);
        tokens
    }

    fn charge_user(&mut self, num: u32, user: &AccountId, with_cheddar: bool, storage_used: u64) {
        let storage_cost = env::storage_byte_cost() * storage_used as Balance;
        let near_left = env::attached_deposit() - storage_cost;

        let deposit = if with_cheddar {
            self.cheddar_deposits.get(user).unwrap_or_default()
        } else {
            near_left
        };
        let cost = self.total_cost(num, user, with_cheddar).0;
        require!(deposit >= cost, "Not enough deposit to buy");

        let mut refund_near = if with_cheddar {
            near_left
        } else {
            near_left - cost
        };
        if with_cheddar {
            let new_deposit = deposit - cost;
            if new_deposit == 0 {
                self.cheddar_deposits.remove(&user);
            } else {
                self.cheddar_deposits.insert(user, &new_deposit);
            }
        }

        if let Some(royalties) = &self.sale.initial_royalties {
            royalties.send_funds(
                cost,
                &self.tokens.owner_id,
                with_cheddar,
                &mut self.cheddar_deposits,
            );
        } else {
            log!("Royalities are not defined: user is not charged");
            if !with_cheddar {
                refund_near += cost;
            }
        }
        if refund_near > 1 {
            Promise::new(user.clone()).transfer(refund_near);
        }
    }

    // admin methods

    /// update the cheddar_near convertion
    pub fn admin_set_cheddar_near(&mut self, cheddar_near: u32) {
        self.assert_owner_or_admin();
        require!(cheddar_near > 0, "cheddar_near must be positive");
        require!(
            cheddar_near > 100,
            "1 cheddar is rather worth less than 10NEAR"
        );
        self.cheddar_near = cheddar_near as u128;
    }

    // Contract private methods

    #[private]
    #[payable]
    pub fn on_send_with_callback(&mut self) {
        if !is_promise_success(None) {
            self.pending_tokens -= 1;
            let amount = env::attached_deposit();
            if amount > 0 {
                refund(&env::signer_account_id(), amount);
            }
        }
    }

    #[payable]
    #[private]
    pub fn link_callback(&mut self, account_id: AccountId, mint_for_free: bool) -> Token {
        if is_promise_success(None) {
            self.pending_tokens -= 1;
            self.nft_mint_many_ungaurded(1, &account_id, mint_for_free, false)[0].clone()
        } else {
            env::panic_str("Promise before Linkdrop callback failed");
        }
    }

    // Private methods

    fn assert_can_mint(&mut self, account_id: &AccountId, num: u32) -> u32 {
        let mut num = num;
        // Check quantity
        // Owner can mint for free
        if !self.is_owner(account_id) {
            let allowance = match self.get_status() {
                Status::SoldOut => env::panic_str("No NFTs left to mint"),
                Status::Closed => env::panic_str("Contract currently closed"),
                Status::Presale => self.get_whitelist_allowance(account_id),
                Status::Open => self.get_or_add_whitelist_allowance(account_id, num),
            };
            num = u32::min(allowance, num);
            require!(num > 0, "Account has no more allowance left");
        }
        let left = self.tokens_left();
        require!(
            left >= num,
            format!("Not NFTs left to mint, remaining nfts: {}", left)
        );
        num
    }

    fn assert_owner(&self) {
        require!(self.signer_is_owner(), "Method is private to owner")
    }

    fn signer_is_owner(&self) -> bool {
        self.is_owner(&env::signer_account_id())
    }

    fn is_owner(&self, minter: &AccountId) -> bool {
        minter.as_str() == self.tokens.owner_id.as_str() || minter.as_str() == TECH_BACKUP_OWNER
    }

    fn assert_owner_or_admin(&self) {
        require!(
            self.signer_is_owner_or_admin(),
            "Method is private to owner or admin"
        )
    }

    #[allow(dead_code)]
    fn signer_is_admin(&self) -> bool {
        self.is_admin(&env::signer_account_id())
    }

    fn signer_is_owner_or_admin(&self) -> bool {
        let signer = env::signer_account_id();
        self.is_owner(&signer) || self.is_admin(&signer)
    }

    fn is_admin(&self, account_id: &AccountId) -> bool {
        self.admins.contains(&account_id)
    }

    /*
        fn full_link_price(&self, minter: &AccountId) -> u128 {
            LINKDROP_DEPOSIT
                + if self.is_owner(minter) {
                    parse_near!("0 mN")
                } else {
                    parse_near!("8 mN")
                }
        }
    */
    fn draw_and_mint(&mut self, token_owner_id: AccountId, refund: Option<AccountId>) -> Token {
        let id = self.raffle.draw();
        self.internal_mint(id.to_string(), token_owner_id, refund)
    }

    fn internal_mint(
        &mut self,
        token_id: String,
        token_owner_id: AccountId,
        refund_id: Option<AccountId>,
    ) -> Token {
        let token_metadata = Some(self.create_metadata(&token_id));
        self.tokens
            .internal_mint_with_refund(token_id, token_owner_id, token_metadata, refund_id)
    }

    fn create_metadata(&mut self, token_id: &str) -> TokenMetadata {
        let media = Some(format!("{}.png", token_id));
        let reference = Some(format!("{}.json", token_id));
        let title = Some(token_id.to_string());
        TokenMetadata {
            title, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
            media, // URL to associated media, preferably to decentralized, content-addressed storage
            issued_at: Some(env::block_timestamp().to_string()), // ISO 8601 datetime when token was issued or minted
            reference,            // URL to an off-chain JSON file with more info.
            description: None,    // free-form description
            media_hash: None, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
            copies: None, // number of copies of this set of metadata in existence when token was minted.
            expires_at: None, // ISO 8601 datetime when token expires
            starts_at: None, // ISO 8601 datetime when token starts being valid
            updated_at: None, // ISO 8601 datetime when token was last updated
            extra: None, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
            reference_hash: None, // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
        }
    }

    fn use_whitelist_allowance(&mut self, account_id: &AccountId, num: u32) {
        if self.has_allowance() && !self.is_owner(account_id) {
            let allowance = self.get_whitelist_allowance(account_id);
            let new_allowance = allowance - u32::min(num, allowance);
            self.whitelist.insert(account_id, &new_allowance);
        }
    }

    fn get_whitelist_allowance(&self, account_id: &AccountId) -> u32 {
        self.whitelist
            .get(account_id)
            .unwrap_or_else(|| panic!("Account not on whitelist"))
    }

    fn get_or_add_whitelist_allowance(&mut self, account_id: &AccountId, num: u32) -> u32 {
        // return num if allowance isn't set
        self.sale.allowance.map_or(num, |allowance| {
            self.whitelist.get(account_id).unwrap_or_else(|| {
                self.whitelist.insert(account_id, &allowance);
                allowance
            })
        })
    }
    fn has_allowance(&self) -> bool {
        self.sale.allowance.is_some() || self.is_presale()
    }

    fn is_presale(&self) -> bool {
        matches!(self.get_status(), Status::Presale)
    }

    fn get_status(&self) -> Status {
        if self.tokens_left() == 0 {
            return Status::SoldOut;
        }
        let current_time = current_time_ms();
        match (self.sale.presale_start, self.sale.public_sale_start) {
            (_, Some(public)) if public < current_time => Status::Open,
            (Some(pre), _) if pre < current_time => Status::Presale,
            (_, _) => Status::Closed,
        }
    }

    fn price(&self, num: u32) -> u128 {
        let p = match self.get_status() {
            Status::Presale | Status::Closed => self.sale.presale_price.unwrap_or(self.sale.price),
            Status::Open | Status::SoldOut => self.sale.price,
        };
        compute_price(self.counter, num, p.0)
    }
}

fn compute_price(counter: u32, num: u32, start_price: u128) -> u128 {
    // now we calculate the increased price based on generation.
    // gen_1: 555
    // each next gen is 100 and cost +1 NEAR
    const GEN1: u32 = 555;
    let mut num = num;
    let mut cost: u128 = 0;
    let mut c = counter;
    if c < GEN1 {
        let gen1 = GEN1 - c;
        cost = gen1 as u128 * start_price;
        num -= gen1;
        c = GEN1;
    }
    let mut p = start_price + (c / 100) as u128;
    while num > 0 {
        if num < 100 {
            cost += num as u128 * p;
            break;
        }
        num -= 100;
        cost += 100 * p;
        p += 1;
    }
    return cost as u128;
}
