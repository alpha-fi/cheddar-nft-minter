use crate::*;

#[near_bindgen]
impl Contract {
    /// Current contract owner
    pub fn owner(&self) -> AccountId {
        self.tokens.owner_id.clone()
    }

    /// Current set of admins
    pub fn admins(&self) -> Vec<AccountId> {
        self.admins.to_vec()
    }

    /// Check whether an account is allowed to mint during the presale
    pub fn whitelisted(&self, account_id: &AccountId) -> bool {
        self.whitelist.contains_key(account_id)
    }

    /*
        /// Cost of NFT + fees for linkdrop
        pub fn cost_of_linkdrop(&self, minter: &AccountId) -> U128 {
            (self.full_link_price(minter)
                + self.total_cost(1, minter, false).0
                + self.token_storage_cost().0)
                .into()
        }
    */
    pub fn total_cost(&self, num: u32, minter: &AccountId, token_id: &Option<AccountId>) -> U128 {
        let mut cost = self.minting_cost(minter, num).0;
        if token_id.is_some() {
            let token_parameters = self.get_token_parameters(token_id);
            cost = cost / 1000 * token_parameters.token_near / 100 * token_parameters.token_boost as u128;
        }
        cost.into()
    }

    /// Flat cost in NEAR for minting given amount of tokens
    pub fn minting_cost(&self, minter: &AccountId, num: u32) -> U128 {
        if self.is_owner(minter) {
            0
        } else {
            self.price(num)
        }
        .into()
    }

    /// Current cost in NEAR to store one NFT
    pub fn token_storage_cost(&self) -> U128 {
        (env::storage_byte_cost() * self.tokens.extra_storage_in_bytes_per_token as Balance).into()
    }

    /// Tokens left to be minted.  This includes those left to be raffled minus any pending linkdrops
    pub fn tokens_left(&self) -> u32 {
        self.raffle.len() as u32 - self.pending_tokens
    }

    /// Part of the NFT metadata standard. Returns the contract's metadata
    pub fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }

    /// How many tokens an account is still allowed to mint. None, means unlimited
    pub fn remaining_allowance(&self, account_id: &AccountId) -> Option<u32> {
        self.whitelist.get(account_id)
    }

    /// Max number of mints in one transaction. None, means unlimited
    pub fn mint_rate_limit(&self) -> Option<u32> {
        self.sale.mint_rate_limit
    }

    /// Information about the current sale. When in starts, status, price, and how many could be minted.
    pub fn get_sale_info(&self) -> SaleInfo {
        SaleInfo {
            presale_start: self.sale.presale_start.unwrap_or(MAX_DATE),
            sale_start: self.sale.public_sale_start.unwrap_or(MAX_DATE),
            status: self.get_status(),
            price: self.price(1).into(),
            token_final_supply: self.initial(),
        }
    }

    /// Information about a current user. Whether they are VIP and how many tokens left in their allowance.
    pub fn get_user_sale_info(&self, account_id: &AccountId) -> UserSaleInfo {
        let sale_info = self.get_sale_info();
        let remaining_allowance = if self.is_presale() || self.sale.allowance.is_some() {
            self.remaining_allowance(account_id)
        } else {
            None
        };
        UserSaleInfo {
            sale_info,
            remaining_allowance,
            is_vip: self.whitelisted(account_id),
        }
    }

    /// Initial size of collection. Number left to raffle + current total supply
    pub fn initial(&self) -> u64 {
        self.raffle.len() + self.nft_total_supply().0 as u64
    }
    /// Fungible token
    pub fn get_whitelisted_tokens(&self) -> Vec<(AccountId, TokenParametersOutput)> {
        let tokens = &self.fungible_tokens;
        let mut result:Vec<(AccountId, TokenParametersOutput)> = vec![];
        for token in tokens.keys() {
            let parameters = tokens.get(&token).unwrap();
            let parameters_output = TokenParametersOutput::from(parameters);
            result.push((token, parameters_output));
        };
        result
    }
    pub fn is_token_whitelisted(&self, token_id: &AccountId) -> bool {
        let tokens = &self.fungible_tokens;
        let mut result:Vec<AccountId> = vec![];
        for token in tokens.keys() {
            result.push(token);
        };
        result.contains(token_id)
    }
    pub fn get_token_decimals(&self, token: &AccountId) -> u8 {
        let token_parameters = self.get_token_parameters(&Some(token.clone()));
        token_parameters.decimals
    }
    pub fn get_one_token_in_yocto(&self, token: &AccountId) -> u128 {
        let decimals = self.get_token_decimals(token);
        let one_token:u128 = 10u128.pow(decimals.into());
        one_token
    }
}
#[test]
fn test_get_one_token() {
    let decimals_24:u8 = 24;
    let decimals_18:u8 = 18;
    let decimals_8:u8 = 8;

    let one_token_24:u128 = 10u128.pow(decimals_24.into());
    let one_token_18:u128 = 10u128.pow(decimals_18.into());
    let one_token_8:u128 = 10u128.pow(decimals_8.into());

    assert_eq!(one_token_24, 1_000_000_000_000_000_000_000_000);
    assert_eq!(one_token_18, 1_000_000_000_000_000_000);
    assert_eq!(one_token_8, 100_000_000);
}