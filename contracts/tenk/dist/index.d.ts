import { Account, transactions, providers, u8, u16, u32, u64, ChangeMethodOptions, ViewFunctionOptions } from './helper';
/**
* milliseconds elapsed since the UNIX epoch
*/
export declare type TimestampMs = u64;
/**
* Copied from https://github.com/near/NEPs/blob/6170aba1c6f4cd4804e9ad442caeae9dc47e7d44/specs/Standards/NonFungibleToken/Payout.md#reference-level-explanation
* A mapping of NEAR accounts to the amount each should be paid out, in
* the event of a token-sale. The payout mapping MUST be shorter than the
* maximum length specified by the financial contract obtaining this
* payout data. Any mapping of length 10 or less MUST be accepted by
* financial contracts, so 10 is a safe upper limit.
* This currently deviates from the standard but is in the process of updating to use this type
*/
export interface Payout {
    payout: Record<AccountId, U128>;
}
export declare type BasisPoint = u16;
export interface Royalties {
    accounts: Record<AccountId, BasisPoint>;
    percent: BasisPoint;
}
/**
* String of yocto NEAR; 1N = 1000000000000000000000000 yN
*/
export declare type YoctoNear = U128;
export interface InitialMetadata {
    name: string;
    symbol: string;
    uri: string;
    icon?: string;
    spec?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
}
export interface Sale {
    royalties?: Royalties;
    initial_royalties?: Royalties;
    presale_start?: TimestampMs;
    public_sale_start?: TimestampMs;
    allowance?: u32;
    presale_price?: U128;
    price: U128;
    mint_rate_limit?: u32;
}
/**
* Current state of contract
*/
export declare enum Status {
    /**
    * Not open for any sales
    */
    Closed = "Closed",
    /**
    * VIP accounts can mint
    */
    Presale = "Presale",
    /**
    * Any account can mint
    */
    Open = "Open",
    /**
    * No more tokens to be minted
    */
    SoldOut = "SoldOut"
}
/**
* Information about the current sale from user perspective
*/
export interface UserSaleInfo {
    sale_info: SaleInfo;
    is_vip: boolean;
    remaining_allowance?: u32;
}
/**
* Information about the current sale
*/
export interface SaleInfo {
    /**
    * Current state of contract
    */
    status: Status;
    /**
    * Start of the VIP sale
    */
    presale_start: TimestampMs;
    /**
    * Start of public sale
    */
    sale_start: TimestampMs;
    /**
    * Total tokens that could be minted
    */
    token_final_supply: u64;
    /**
    * Current price for one token
    */
    price: U128;
}
/**
* StorageUsage is used to count the amount of storage used by a contract.
*/
export declare type StorageUsage = u64;
/**
* Balance is a type for storing amounts of tokens, specified in yoctoNEAR.
*/
export declare type Balance = U128;
/**
* Represents the amount of NEAR tokens in "gas units" which are used to fund transactions.
*/
export declare type Gas = u64;
/**
* base64 string.
*/
export declare type Base64VecU8 = string;
/**
* Raw type for duration in nanoseconds
*/
export declare type Duration = u64;
/**
* @minLength 2
* @maxLength 64
* @pattern ^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$
*/
export declare type AccountId = string;
/**
* String representation of a u128-bit integer
* @pattern ^[0-9]+$
*/
export declare type U128 = string;
/**
* Public key in a binary format with base58 string serialization with human-readable curve.
* The key types currently supported are `secp256k1` and `ed25519`.
*
* Ed25519 public keys accepted are 32 bytes and secp256k1 keys are the uncompressed 64 format.
*/
export declare type PublicKey = string;
/**
* Raw type for timestamp in nanoseconds
*/
export declare type Timestamp = u64;
/**
* In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs.
*/
export interface Token {
    token_id: TokenId;
    owner_id: AccountId;
    metadata?: TokenMetadata;
    approved_account_ids?: Record<AccountId, u64>;
}
export interface FungibleTokenMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
    decimals: u8;
}
/**
* Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc.
*/
export declare type TokenId = string;
/**
* Metadata for the NFT contract itself.
*/
export interface NftContractMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon?: string;
    base_uri?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
}
export interface StorageBalanceBounds {
    min: U128;
    max?: U128;
}
/**
* Metadata on the individual token level.
*/
export interface TokenMetadata {
    title?: string;
    description?: string;
    media?: string;
    media_hash?: Base64VecU8;
    copies?: u64;
    issued_at?: string;
    expires_at?: string;
    starts_at?: string;
    updated_at?: string;
    extra?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
}
export interface StorageBalance {
    total: U128;
    available: U128;
}
export declare type WrappedDuration = string;
export declare class Contract {
    account: Account;
    readonly contractId: string;
    constructor(account: Account, contractId: string);
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    create_linkdrop(args: {
        public_key: PublicKey;
    }, options?: ChangeMethodOptions): Promise<void>;
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    create_linkdropRaw(args: {
        public_key: PublicKey;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    create_linkdropTx(args: {
        public_key: PublicKey;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Returns the balance associated with given key.
    */
    get_key_balance(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
    check_key(args: {
        public_key: PublicKey;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    get_linkdrop_contract(args?: {}, options?: ViewFunctionOptions): Promise<AccountId>;
    /**
    * @allow ["::admins", "::owner"]
    */
    transfer_ownership(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * @allow ["::admins", "::owner"]
    */
    transfer_ownershipRaw(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * @allow ["::admins", "::owner"]
    */
    transfer_ownershipTx(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_initial_royalties(args: {
        initial_royalties: Royalties;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_initial_royaltiesRaw(args: {
        initial_royalties: Royalties;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_initial_royaltiesTx(args: {
        initial_royalties: Royalties;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_royalties(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_royaltiesRaw(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_royaltiesTx(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_allowance(args: {
        allowance: u32;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_allowanceRaw(args: {
        allowance: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_allowanceTx(args: {
        allowance: u32;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_uri(args: {
        uri: string;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_uriRaw(args: {
        uri: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_uriTx(args: {
        uri: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * @allow ["::admins", "::owner"]
    */
    add_whitelist_accounts(args: {
        accounts: AccountId[];
        allowance?: u32;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * @allow ["::admins", "::owner"]
    */
    add_whitelist_accountsRaw(args: {
        accounts: AccountId[];
        allowance?: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * @allow ["::admins", "::owner"]
    */
    add_whitelist_accountsTx(args: {
        accounts: AccountId[];
        allowance?: u32;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_whitelist_accounts(args: {
        accounts: AccountId[];
        allowance_increase: u32;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_whitelist_accountsRaw(args: {
        accounts: AccountId[];
        allowance_increase: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * @allow ["::admins", "::owner"]
    */
    update_whitelist_accountsTx(args: {
        accounts: AccountId[];
        allowance_increase: u32;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * End public sale/minting, going back to the pre-presale state in which no one can mint.
    * @allow ["::admins", "::owner"]
    */
    close_sale(args?: {}, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * End public sale/minting, going back to the pre-presale state in which no one can mint.
    * @allow ["::admins", "::owner"]
    */
    close_saleRaw(args?: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * End public sale/minting, going back to the pre-presale state in which no one can mint.
    * @allow ["::admins", "::owner"]
    */
    close_saleTx(args?: {}, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Override the current presale start time to start presale now.
    * Most provide when public sale starts. None, means never.
    * Can provide new presale price.
    * Note: you most likely won't need to call this since the presale
    * starts automatically based on time.
    * @allow ["::admins", "::owner"]
    */
    start_presale(args: {
        public_sale_start?: TimestampMs;
        presale_price?: U128;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * Override the current presale start time to start presale now.
    * Most provide when public sale starts. None, means never.
    * Can provide new presale price.
    * Note: you most likely won't need to call this since the presale
    * starts automatically based on time.
    * @allow ["::admins", "::owner"]
    */
    start_presaleRaw(args: {
        public_sale_start?: TimestampMs;
        presale_price?: U128;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Override the current presale start time to start presale now.
    * Most provide when public sale starts. None, means never.
    * Can provide new presale price.
    * Note: you most likely won't need to call this since the presale
    * starts automatically based on time.
    * @allow ["::admins", "::owner"]
    */
    start_presaleTx(args: {
        public_sale_start?: TimestampMs;
        presale_price?: U128;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * @allow ["::admins", "::owner"]
    */
    start_sale(args: {
        price?: YoctoNear;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * @allow ["::admins", "::owner"]
    */
    start_saleRaw(args: {
        price?: YoctoNear;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * @allow ["::admins", "::owner"]
    */
    start_saleTx(args: {
        price?: YoctoNear;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Add a new admin. Careful who you add!
    * @allow ["::admins", "::owner"]
    */
    add_admin(args: {
        account_id: AccountId;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * Add a new admin. Careful who you add!
    * @allow ["::admins", "::owner"]
    */
    add_adminRaw(args: {
        account_id: AccountId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Add a new admin. Careful who you add!
    * @allow ["::admins", "::owner"]
    */
    add_adminTx(args: {
        account_id: AccountId;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Update public sale price.
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
    */
    update_price(args: {
        price: U128;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * Update public sale price.
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
    */
    update_priceRaw(args: {
        price: U128;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Update public sale price.
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
    */
    update_priceTx(args: {
        price: U128;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Update the presale price
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
    */
    update_presale_price(args: {
        presale_price?: U128;
    }, options?: ChangeMethodOptions): Promise<boolean>;
    /**
    * Update the presale price
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
    */
    update_presale_priceRaw(args: {
        presale_price?: U128;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Update the presale price
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
    */
    update_presale_priceTx(args: {
        presale_price?: U128;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_payout(args: {
        token_id: string;
        balance: U128;
        max_len_payout?: u32;
    }, options?: ViewFunctionOptions): Promise<Payout>;
    nft_transfer_payout(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: u32;
    }, options?: ChangeMethodOptions): Promise<Payout>;
    nft_transfer_payoutRaw(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_transfer_payoutTx(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: u32;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Current contract owner
    */
    owner(args?: {}, options?: ViewFunctionOptions): Promise<AccountId>;
    /**
    * Current set of admins
    */
    admins(args?: {}, options?: ViewFunctionOptions): Promise<AccountId[]>;
    /**
    * Check whether an account is allowed to mint during the presale
    */
    whitelisted(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    /**
    * Cost of NFT + fees for linkdrop
    */
    cost_of_linkdrop(args: {
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    total_cost(args: {
        num: u32;
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    /**
    * Flat cost of one token
    */
    cost_per_token(args: {
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    /**
    * Current cost in NEAR to store one NFT
    */
    token_storage_cost(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
    /**
    * Tokens left to be minted.  This includes those left to be raffled minus any pending linkdrops
    */
    tokens_left(args?: {}, options?: ViewFunctionOptions): Promise<u32>;
    /**
    * Part of the NFT metadata standard. Returns the contract's metadata
    */
    nft_metadata(args?: {}, options?: ViewFunctionOptions): Promise<NftContractMetadata>;
    /**
    * How many tokens an account is still allowed to mint. None, means unlimited
    */
    remaining_allowance(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<u32 | null>;
    /**
    * Max number of mints in one transaction. None, means unlimited
    */
    mint_rate_limit(args?: {}, options?: ViewFunctionOptions): Promise<u32 | null>;
    /**
    * Information about the current sale. When in starts, status, price, and how many could be minted.
    */
    get_sale_info(args?: {}, options?: ViewFunctionOptions): Promise<SaleInfo>;
    /**
    * Information about a current user. Whether they are VIP and how many tokens left in their allowance.
    */
    get_user_sale_info(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<UserSaleInfo>;
    /**
    * Initial size of collection. Number left to raffle + current total supply
    */
    initial(args?: {}, options?: ViewFunctionOptions): Promise<u64>;
    /**
    * Simple transfer. Transfer a given `token_id` from current owner to
    * `receiver_id`.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
    * * Contract MUST panic if called by someone other than token owner or,
    * if using Approval Management, one of the approved accounts
    * * `approval_id` is for use with Approval Management,
    * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
    * * If using Approval Management, contract MUST nullify approved accounts on
    * successful transfer.
    * * TODO: needed? Both accounts must be registered with the contract for transfer to
    * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
    *
    * Arguments:
    * * `receiver_id`: the valid NEAR account receiving the token
    * * `token_id`: the token to transfer
    * * `approval_id`: expected approval ID. A number smaller than
    * 2^53, and therefore representable as JSON. See Approval Management
    * standard for full explanation.
    * * `memo` (optional): for use cases that may benefit from indexing or
    * providing information for a transfer
    */
    nft_transfer(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    /**
    * Simple transfer. Transfer a given `token_id` from current owner to
    * `receiver_id`.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
    * * Contract MUST panic if called by someone other than token owner or,
    * if using Approval Management, one of the approved accounts
    * * `approval_id` is for use with Approval Management,
    * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
    * * If using Approval Management, contract MUST nullify approved accounts on
    * successful transfer.
    * * TODO: needed? Both accounts must be registered with the contract for transfer to
    * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
    *
    * Arguments:
    * * `receiver_id`: the valid NEAR account receiving the token
    * * `token_id`: the token to transfer
    * * `approval_id`: expected approval ID. A number smaller than
    * 2^53, and therefore representable as JSON. See Approval Management
    * standard for full explanation.
    * * `memo` (optional): for use cases that may benefit from indexing or
    * providing information for a transfer
    */
    nft_transferRaw(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Simple transfer. Transfer a given `token_id` from current owner to
    * `receiver_id`.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
    * * Contract MUST panic if called by someone other than token owner or,
    * if using Approval Management, one of the approved accounts
    * * `approval_id` is for use with Approval Management,
    * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
    * * If using Approval Management, contract MUST nullify approved accounts on
    * successful transfer.
    * * TODO: needed? Both accounts must be registered with the contract for transfer to
    * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
    *
    * Arguments:
    * * `receiver_id`: the valid NEAR account receiving the token
    * * `token_id`: the token to transfer
    * * `approval_id`: expected approval ID. A number smaller than
    * 2^53, and therefore representable as JSON. See Approval Management
    * standard for full explanation.
    * * `memo` (optional): for use cases that may benefit from indexing or
    * providing information for a transfer
    */
    nft_transferTx(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Transfer token and call a method on a receiver contract. A successful
    * workflow will end in a success execution outcome to the callback on the NFT
    * contract at the method `nft_resolve_transfer`.
    *
    * You can think of this as being similar to attaching native NEAR tokens to a
    * function call. It allows you to attach any Non-Fungible Token in a call to a
    * receiver contract.
    *
    * Requirements:
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * Contract MUST panic if called by someone other than token owner or,
    * if using Approval Management, one of the approved accounts
    * * The receiving contract must implement `ft_on_transfer` according to the
    * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
    * with the resulting failed cross-contract call and roll back the transfer.
    * * Contract MUST implement the behavior described in `ft_resolve_transfer`
    * * `approval_id` is for use with Approval Management extension, see
    * that document for full explanation.
    * * If using Approval Management, contract MUST nullify approved accounts on
    * successful transfer.
    *
    * Arguments:
    * * `receiver_id`: the valid NEAR account receiving the token.
    * * `token_id`: the token to send.
    * * `approval_id`: expected approval ID. A number smaller than
    * 2^53, and therefore representable as JSON. See Approval Management
    * standard for full explanation.
    * * `memo` (optional): for use cases that may benefit from indexing or
    * providing information for a transfer.
    * * `msg`: specifies information needed by the receiving contract in
    * order to properly handle the transfer. Can indicate both a function to
    * call and the parameters to pass to that function.
    */
    nft_transfer_call(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    /**
    * Transfer token and call a method on a receiver contract. A successful
    * workflow will end in a success execution outcome to the callback on the NFT
    * contract at the method `nft_resolve_transfer`.
    *
    * You can think of this as being similar to attaching native NEAR tokens to a
    * function call. It allows you to attach any Non-Fungible Token in a call to a
    * receiver contract.
    *
    * Requirements:
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * Contract MUST panic if called by someone other than token owner or,
    * if using Approval Management, one of the approved accounts
    * * The receiving contract must implement `ft_on_transfer` according to the
    * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
    * with the resulting failed cross-contract call and roll back the transfer.
    * * Contract MUST implement the behavior described in `ft_resolve_transfer`
    * * `approval_id` is for use with Approval Management extension, see
    * that document for full explanation.
    * * If using Approval Management, contract MUST nullify approved accounts on
    * successful transfer.
    *
    * Arguments:
    * * `receiver_id`: the valid NEAR account receiving the token.
    * * `token_id`: the token to send.
    * * `approval_id`: expected approval ID. A number smaller than
    * 2^53, and therefore representable as JSON. See Approval Management
    * standard for full explanation.
    * * `memo` (optional): for use cases that may benefit from indexing or
    * providing information for a transfer.
    * * `msg`: specifies information needed by the receiving contract in
    * order to properly handle the transfer. Can indicate both a function to
    * call and the parameters to pass to that function.
    */
    nft_transfer_callRaw(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Transfer token and call a method on a receiver contract. A successful
    * workflow will end in a success execution outcome to the callback on the NFT
    * contract at the method `nft_resolve_transfer`.
    *
    * You can think of this as being similar to attaching native NEAR tokens to a
    * function call. It allows you to attach any Non-Fungible Token in a call to a
    * receiver contract.
    *
    * Requirements:
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * Contract MUST panic if called by someone other than token owner or,
    * if using Approval Management, one of the approved accounts
    * * The receiving contract must implement `ft_on_transfer` according to the
    * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
    * with the resulting failed cross-contract call and roll back the transfer.
    * * Contract MUST implement the behavior described in `ft_resolve_transfer`
    * * `approval_id` is for use with Approval Management extension, see
    * that document for full explanation.
    * * If using Approval Management, contract MUST nullify approved accounts on
    * successful transfer.
    *
    * Arguments:
    * * `receiver_id`: the valid NEAR account receiving the token.
    * * `token_id`: the token to send.
    * * `approval_id`: expected approval ID. A number smaller than
    * 2^53, and therefore representable as JSON. See Approval Management
    * standard for full explanation.
    * * `memo` (optional): for use cases that may benefit from indexing or
    * providing information for a transfer.
    * * `msg`: specifies information needed by the receiving contract in
    * order to properly handle the transfer. Can indicate both a function to
    * call and the parameters to pass to that function.
    */
    nft_transfer_callTx(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Returns the token with the given `token_id` or `null` if no such token.
    */
    nft_token(args: {
        token_id: TokenId;
    }, options?: ViewFunctionOptions): Promise<Token | null>;
    /**
    * Add an approved account for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
    * security purposes
    * * Contract MAY require caller to attach larger deposit, to cover cost of
    * storing approver data
    * * Contract MUST panic if called by someone other than token owner
    * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
    * single-block gas limit
    * * Contract MUST increment approval ID even if re-approving an account
    * * If successfully approved or if had already been approved, and if `msg` is
    * present, contract MUST call `nft_on_approve` on `account_id`. See
    * `nft_on_approve` description below for details.
    *
    * Arguments:
    * * `token_id`: the token for which to add an approval
    * * `account_id`: the account to add to `approvals`
    * * `msg`: optional string to be passed to `nft_on_approve`
    *
    * Returns void, if no `msg` given. Otherwise, returns promise call to
    * `nft_on_approve`, which can resolve with whatever it wants.
    */
    nft_approve(args: {
        token_id: TokenId;
        account_id: AccountId;
        msg?: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    /**
    * Add an approved account for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
    * security purposes
    * * Contract MAY require caller to attach larger deposit, to cover cost of
    * storing approver data
    * * Contract MUST panic if called by someone other than token owner
    * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
    * single-block gas limit
    * * Contract MUST increment approval ID even if re-approving an account
    * * If successfully approved or if had already been approved, and if `msg` is
    * present, contract MUST call `nft_on_approve` on `account_id`. See
    * `nft_on_approve` description below for details.
    *
    * Arguments:
    * * `token_id`: the token for which to add an approval
    * * `account_id`: the account to add to `approvals`
    * * `msg`: optional string to be passed to `nft_on_approve`
    *
    * Returns void, if no `msg` given. Otherwise, returns promise call to
    * `nft_on_approve`, which can resolve with whatever it wants.
    */
    nft_approveRaw(args: {
        token_id: TokenId;
        account_id: AccountId;
        msg?: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Add an approved account for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
    * security purposes
    * * Contract MAY require caller to attach larger deposit, to cover cost of
    * storing approver data
    * * Contract MUST panic if called by someone other than token owner
    * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
    * single-block gas limit
    * * Contract MUST increment approval ID even if re-approving an account
    * * If successfully approved or if had already been approved, and if `msg` is
    * present, contract MUST call `nft_on_approve` on `account_id`. See
    * `nft_on_approve` description below for details.
    *
    * Arguments:
    * * `token_id`: the token for which to add an approval
    * * `account_id`: the account to add to `approvals`
    * * `msg`: optional string to be passed to `nft_on_approve`
    *
    * Returns void, if no `msg` given. Otherwise, returns promise call to
    * `nft_on_approve`, which can resolve with whatever it wants.
    */
    nft_approveTx(args: {
        token_id: TokenId;
        account_id: AccountId;
        msg?: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Revoke an approved account for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * If contract requires >1yN deposit on `nft_approve`, contract
    * MUST refund associated storage deposit when owner revokes approval
    * * Contract MUST panic if called by someone other than token owner
    *
    * Arguments:
    * * `token_id`: the token for which to revoke an approval
    * * `account_id`: the account to remove from `approvals`
    */
    nft_revoke(args: {
        token_id: TokenId;
        account_id: AccountId;
    }, options?: ChangeMethodOptions): Promise<void>;
    /**
    * Revoke an approved account for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * If contract requires >1yN deposit on `nft_approve`, contract
    * MUST refund associated storage deposit when owner revokes approval
    * * Contract MUST panic if called by someone other than token owner
    *
    * Arguments:
    * * `token_id`: the token for which to revoke an approval
    * * `account_id`: the account to remove from `approvals`
    */
    nft_revokeRaw(args: {
        token_id: TokenId;
        account_id: AccountId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Revoke an approved account for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * If contract requires >1yN deposit on `nft_approve`, contract
    * MUST refund associated storage deposit when owner revokes approval
    * * Contract MUST panic if called by someone other than token owner
    *
    * Arguments:
    * * `token_id`: the token for which to revoke an approval
    * * `account_id`: the account to remove from `approvals`
    */
    nft_revokeTx(args: {
        token_id: TokenId;
        account_id: AccountId;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Revoke all approved accounts for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * If contract requires >1yN deposit on `nft_approve`, contract
    * MUST refund all associated storage deposit when owner revokes approvals
    * * Contract MUST panic if called by someone other than token owner
    *
    * Arguments:
    * * `token_id`: the token with approvals to revoke
    */
    nft_revoke_all(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): Promise<void>;
    /**
    * Revoke all approved accounts for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * If contract requires >1yN deposit on `nft_approve`, contract
    * MUST refund all associated storage deposit when owner revokes approvals
    * * Contract MUST panic if called by someone other than token owner
    *
    * Arguments:
    * * `token_id`: the token with approvals to revoke
    */
    nft_revoke_allRaw(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Revoke all approved accounts for a specific token.
    *
    * Requirements
    * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    * purposes
    * * If contract requires >1yN deposit on `nft_approve`, contract
    * MUST refund all associated storage deposit when owner revokes approvals
    * * Contract MUST panic if called by someone other than token owner
    *
    * Arguments:
    * * `token_id`: the token with approvals to revoke
    */
    nft_revoke_allTx(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Check if a token is approved for transfer by a given account, optionally
    * checking an approval_id
    *
    * Arguments:
    * * `token_id`: the token for which to revoke an approval
    * * `approved_account_id`: the account to check the existence of in `approvals`
    * * `approval_id`: an optional approval ID to check against current approval ID for given account
    *
    * Returns:
    * if `approval_id` given, `true` if `approved_account_id` is approved with given `approval_id`
    * otherwise, `true` if `approved_account_id` is in list of approved accounts
    */
    nft_is_approved(args: {
        token_id: TokenId;
        approved_account_id: AccountId;
        approval_id?: u64;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    /**
    * Returns the total supply of non-fungible tokens as a string representing an
    * unsigned 128-bit integer to avoid JSON number limit of 2^53.
    */
    nft_total_supply(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
    /**
    * Get a list of all tokens
    *
    * Arguments:
    * * `from_index`: a string representing an unsigned 128-bit integer,
    * representing the starting index of tokens to return. (default 0)
    * * `limit`: the maximum number of tokens to return (default total supply)
    * Could fail on gas
    *
    * Returns an array of Token objects, as described in Core standard
    */
    nft_tokens(args: {
        from_index?: U128;
        limit?: u64;
    }, options?: ViewFunctionOptions): Promise<Token[]>;
    /**
    * Get number of tokens owned by a given account
    *
    * Arguments:
    * * `account_id`: a valid NEAR account
    *
    * Returns the number of non-fungible tokens owned by given `account_id` as
    * a string representing the value as an unsigned 128-bit integer to avoid JSON
    * number limit of 2^53.
    */
    nft_supply_for_owner(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    /**
    * Get list of all tokens owned by a given account
    *
    * Arguments:
    * * `account_id`: a valid NEAR account
    * * `from_index`: a string representing an unsigned 128-bit integer,
    * representing the starting index of tokens to return. (default 0)
    * * `limit`: the maximum number of tokens to return. (default unlimited)
    * Could fail on gas
    *
    * Returns a paginated list of all tokens owned by this account
    */
    nft_tokens_for_owner(args: {
        account_id: AccountId;
        from_index?: U128;
        limit?: u64;
    }, options?: ViewFunctionOptions): Promise<Token[]>;
    new_default_meta(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: u32;
        sale?: Sale;
    }, options?: ChangeMethodOptions): Promise<void>;
    new_default_metaRaw(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: u32;
        sale?: Sale;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    new_default_metaTx(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: u32;
        sale?: Sale;
    }, options?: ChangeMethodOptions): transactions.Action;
    new(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: u32;
        sale: Sale;
    }, options?: ChangeMethodOptions): Promise<void>;
    newRaw(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: u32;
        sale: Sale;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    newTx(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: u32;
        sale: Sale;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_mint(args: {
        token_id: TokenId;
        token_owner_id: AccountId;
        token_metadata: TokenMetadata;
    }, options?: ChangeMethodOptions): Promise<Token>;
    nft_mintRaw(args: {
        token_id: TokenId;
        token_owner_id: AccountId;
        token_metadata: TokenMetadata;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mintTx(args: {
        token_id: TokenId;
        token_owner_id: AccountId;
        token_metadata: TokenMetadata;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_mint_one(args?: {}, options?: ChangeMethodOptions): Promise<Token>;
    nft_mint_oneRaw(args?: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mint_oneTx(args?: {}, options?: ChangeMethodOptions): transactions.Action;
    nft_mint_many(args: {
        num: u32;
    }, options?: ChangeMethodOptions): Promise<Token[]>;
    nft_mint_manyRaw(args: {
        num: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mint_manyTx(args: {
        num: u32;
    }, options?: ChangeMethodOptions): transactions.Action;
}
/**
* Create a pending token that can be claimed with corresponding private key
*
* @contractMethod change
*/
export interface CreateLinkdrop {
    args: {
        public_key: PublicKey;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type CreateLinkdrop__Result = void;
/**
* Returns the balance associated with given key.
*
* @contractMethod view
*/
export interface GetKeyBalance {
    args: {};
}
export declare type GetKeyBalance__Result = U128;
/**
*
* @contractMethod view
*/
export interface CheckKey {
    args: {
        public_key: PublicKey;
    };
}
export declare type CheckKey__Result = boolean;
/**
*
* @contractMethod view
*/
export interface GetLinkdropContract {
    args: {};
}
export declare type GetLinkdropContract__Result = AccountId;
/**
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface TransferOwnership {
    args: {
        new_owner: AccountId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type TransferOwnership__Result = boolean;
/**
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface UpdateInitialRoyalties {
    args: {
        initial_royalties: Royalties;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdateInitialRoyalties__Result = boolean;
/**
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface UpdateRoyalties {
    args: {
        royalties: Royalties;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdateRoyalties__Result = boolean;
/**
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface UpdateAllowance {
    args: {
        allowance: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdateAllowance__Result = boolean;
/**
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface UpdateUri {
    args: {
        uri: string;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdateUri__Result = boolean;
/**
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface AddWhitelistAccounts {
    args: {
        accounts: AccountId[];
        allowance?: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type AddWhitelistAccounts__Result = boolean;
/**
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface UpdateWhitelistAccounts {
    args: {
        accounts: AccountId[];
        allowance_increase: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdateWhitelistAccounts__Result = boolean;
/**
* End public sale/minting, going back to the pre-presale state in which no one can mint.
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface CloseSale {
    args: {};
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type CloseSale__Result = boolean;
/**
* Override the current presale start time to start presale now.
* Most provide when public sale starts. None, means never.
* Can provide new presale price.
* Note: you most likely won't need to call this since the presale
* starts automatically based on time.
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface StartPresale {
    args: {
        public_sale_start?: TimestampMs;
        presale_price?: U128;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type StartPresale__Result = boolean;
/**
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface StartSale {
    args: {
        price?: YoctoNear;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type StartSale__Result = boolean;
/**
* Add a new admin. Careful who you add!
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface AddAdmin {
    args: {
        account_id: AccountId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type AddAdmin__Result = boolean;
/**
* Update public sale price.
* Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface UpdatePrice {
    args: {
        price: U128;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdatePrice__Result = boolean;
/**
* Update the presale price
* Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
* @allow ["::admins", "::owner"]
*
* @contractMethod change
*/
export interface UpdatePresalePrice {
    args: {
        presale_price?: U128;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdatePresalePrice__Result = boolean;
/**
*
* @contractMethod view
*/
export interface NftPayout {
    args: {
        token_id: string;
        balance: U128;
        max_len_payout?: u32;
    };
}
export declare type NftPayout__Result = Payout;
/**
*
* @contractMethod change
*/
export interface NftTransferPayout {
    args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftTransferPayout__Result = Payout;
/**
* Current contract owner
*
* @contractMethod view
*/
export interface Owner {
    args: {};
}
export declare type Owner__Result = AccountId;
/**
* Current set of admins
*
* @contractMethod view
*/
export interface Admins {
    args: {};
}
export declare type Admins__Result = AccountId[];
/**
* Check whether an account is allowed to mint during the presale
*
* @contractMethod view
*/
export interface Whitelisted {
    args: {
        account_id: AccountId;
    };
}
export declare type Whitelisted__Result = boolean;
/**
* Cost of NFT + fees for linkdrop
*
* @contractMethod view
*/
export interface CostOfLinkdrop {
    args: {
        minter: AccountId;
    };
}
export declare type CostOfLinkdrop__Result = U128;
/**
*
* @contractMethod view
*/
export interface TotalCost {
    args: {
        num: u32;
        minter: AccountId;
    };
}
export declare type TotalCost__Result = U128;
/**
* Flat cost of one token
*
* @contractMethod view
*/
export interface CostPerToken {
    args: {
        minter: AccountId;
    };
}
export declare type CostPerToken__Result = U128;
/**
* Current cost in NEAR to store one NFT
*
* @contractMethod view
*/
export interface TokenStorageCost {
    args: {};
}
export declare type TokenStorageCost__Result = U128;
/**
* Tokens left to be minted.  This includes those left to be raffled minus any pending linkdrops
*
* @contractMethod view
*/
export interface TokensLeft {
    args: {};
}
export declare type TokensLeft__Result = u32;
/**
* Part of the NFT metadata standard. Returns the contract's metadata
*
* @contractMethod view
*/
export interface NftMetadata {
    args: {};
}
export declare type NftMetadata__Result = NftContractMetadata;
/**
* How many tokens an account is still allowed to mint. None, means unlimited
*
* @contractMethod view
*/
export interface RemainingAllowance {
    args: {
        account_id: AccountId;
    };
}
export declare type RemainingAllowance__Result = u32 | null;
/**
* Max number of mints in one transaction. None, means unlimited
*
* @contractMethod view
*/
export interface MintRateLimit {
    args: {};
}
export declare type MintRateLimit__Result = u32 | null;
/**
* Information about the current sale. When in starts, status, price, and how many could be minted.
*
* @contractMethod view
*/
export interface GetSaleInfo {
    args: {};
}
export declare type GetSaleInfo__Result = SaleInfo;
/**
* Information about a current user. Whether they are VIP and how many tokens left in their allowance.
*
* @contractMethod view
*/
export interface GetUserSaleInfo {
    args: {
        account_id: AccountId;
    };
}
export declare type GetUserSaleInfo__Result = UserSaleInfo;
/**
* Initial size of collection. Number left to raffle + current total supply
*
* @contractMethod view
*/
export interface Initial {
    args: {};
}
export declare type Initial__Result = u64;
/**
* Simple transfer. Transfer a given `token_id` from current owner to
* `receiver_id`.
*
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
* * Contract MUST panic if called by someone other than token owner or,
* if using Approval Management, one of the approved accounts
* * `approval_id` is for use with Approval Management,
* see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
* * If using Approval Management, contract MUST nullify approved accounts on
* successful transfer.
* * TODO: needed? Both accounts must be registered with the contract for transfer to
* succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
*
* Arguments:
* * `receiver_id`: the valid NEAR account receiving the token
* * `token_id`: the token to transfer
* * `approval_id`: expected approval ID. A number smaller than
* 2^53, and therefore representable as JSON. See Approval Management
* standard for full explanation.
* * `memo` (optional): for use cases that may benefit from indexing or
* providing information for a transfer
*
* @contractMethod change
*/
export interface NftTransfer {
    args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftTransfer__Result = void;
/**
* Transfer token and call a method on a receiver contract. A successful
* workflow will end in a success execution outcome to the callback on the NFT
* contract at the method `nft_resolve_transfer`.
*
* You can think of this as being similar to attaching native NEAR tokens to a
* function call. It allows you to attach any Non-Fungible Token in a call to a
* receiver contract.
*
* Requirements:
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * Contract MUST panic if called by someone other than token owner or,
* if using Approval Management, one of the approved accounts
* * The receiving contract must implement `ft_on_transfer` according to the
* standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
* with the resulting failed cross-contract call and roll back the transfer.
* * Contract MUST implement the behavior described in `ft_resolve_transfer`
* * `approval_id` is for use with Approval Management extension, see
* that document for full explanation.
* * If using Approval Management, contract MUST nullify approved accounts on
* successful transfer.
*
* Arguments:
* * `receiver_id`: the valid NEAR account receiving the token.
* * `token_id`: the token to send.
* * `approval_id`: expected approval ID. A number smaller than
* 2^53, and therefore representable as JSON. See Approval Management
* standard for full explanation.
* * `memo` (optional): for use cases that may benefit from indexing or
* providing information for a transfer.
* * `msg`: specifies information needed by the receiving contract in
* order to properly handle the transfer. Can indicate both a function to
* call and the parameters to pass to that function.
*
* @contractMethod change
*/
export interface NftTransferCall {
    args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
        msg: string;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftTransferCall__Result = void;
/**
* Returns the token with the given `token_id` or `null` if no such token.
*
* @contractMethod view
*/
export interface NftToken {
    args: {
        token_id: TokenId;
    };
}
export declare type NftToken__Result = Token | null;
/**
* Add an approved account for a specific token.
*
* Requirements
* * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
* security purposes
* * Contract MAY require caller to attach larger deposit, to cover cost of
* storing approver data
* * Contract MUST panic if called by someone other than token owner
* * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
* single-block gas limit
* * Contract MUST increment approval ID even if re-approving an account
* * If successfully approved or if had already been approved, and if `msg` is
* present, contract MUST call `nft_on_approve` on `account_id`. See
* `nft_on_approve` description below for details.
*
* Arguments:
* * `token_id`: the token for which to add an approval
* * `account_id`: the account to add to `approvals`
* * `msg`: optional string to be passed to `nft_on_approve`
*
* Returns void, if no `msg` given. Otherwise, returns promise call to
* `nft_on_approve`, which can resolve with whatever it wants.
*
* @contractMethod change
*/
export interface NftApprove {
    args: {
        token_id: TokenId;
        account_id: AccountId;
        msg?: string;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftApprove__Result = void;
/**
* Revoke an approved account for a specific token.
*
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * If contract requires >1yN deposit on `nft_approve`, contract
* MUST refund associated storage deposit when owner revokes approval
* * Contract MUST panic if called by someone other than token owner
*
* Arguments:
* * `token_id`: the token for which to revoke an approval
* * `account_id`: the account to remove from `approvals`
*
* @contractMethod change
*/
export interface NftRevoke {
    args: {
        token_id: TokenId;
        account_id: AccountId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftRevoke__Result = void;
/**
* Revoke all approved accounts for a specific token.
*
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * If contract requires >1yN deposit on `nft_approve`, contract
* MUST refund all associated storage deposit when owner revokes approvals
* * Contract MUST panic if called by someone other than token owner
*
* Arguments:
* * `token_id`: the token with approvals to revoke
*
* @contractMethod change
*/
export interface NftRevokeAll {
    args: {
        token_id: TokenId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftRevokeAll__Result = void;
/**
* Check if a token is approved for transfer by a given account, optionally
* checking an approval_id
*
* Arguments:
* * `token_id`: the token for which to revoke an approval
* * `approved_account_id`: the account to check the existence of in `approvals`
* * `approval_id`: an optional approval ID to check against current approval ID for given account
*
* Returns:
* if `approval_id` given, `true` if `approved_account_id` is approved with given `approval_id`
* otherwise, `true` if `approved_account_id` is in list of approved accounts
*
* @contractMethod view
*/
export interface NftIsApproved {
    args: {
        token_id: TokenId;
        approved_account_id: AccountId;
        approval_id?: u64;
    };
}
export declare type NftIsApproved__Result = boolean;
/**
* Returns the total supply of non-fungible tokens as a string representing an
* unsigned 128-bit integer to avoid JSON number limit of 2^53.
*
* @contractMethod view
*/
export interface NftTotalSupply {
    args: {};
}
export declare type NftTotalSupply__Result = U128;
/**
* Get a list of all tokens
*
* Arguments:
* * `from_index`: a string representing an unsigned 128-bit integer,
* representing the starting index of tokens to return. (default 0)
* * `limit`: the maximum number of tokens to return (default total supply)
* Could fail on gas
*
* Returns an array of Token objects, as described in Core standard
*
* @contractMethod view
*/
export interface NftTokens {
    args: {
        from_index?: U128;
        limit?: u64;
    };
}
export declare type NftTokens__Result = Token[];
/**
* Get number of tokens owned by a given account
*
* Arguments:
* * `account_id`: a valid NEAR account
*
* Returns the number of non-fungible tokens owned by given `account_id` as
* a string representing the value as an unsigned 128-bit integer to avoid JSON
* number limit of 2^53.
*
* @contractMethod view
*/
export interface NftSupplyForOwner {
    args: {
        account_id: AccountId;
    };
}
export declare type NftSupplyForOwner__Result = U128;
/**
* Get list of all tokens owned by a given account
*
* Arguments:
* * `account_id`: a valid NEAR account
* * `from_index`: a string representing an unsigned 128-bit integer,
* representing the starting index of tokens to return. (default 0)
* * `limit`: the maximum number of tokens to return. (default unlimited)
* Could fail on gas
*
* Returns a paginated list of all tokens owned by this account
*
* @contractMethod view
*/
export interface NftTokensForOwner {
    args: {
        account_id: AccountId;
        from_index?: U128;
        limit?: u64;
    };
}
export declare type NftTokensForOwner__Result = Token[];
/**
*
* @contractMethod change
*/
export interface NewDefaultMeta {
    args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: u32;
        sale?: Sale;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NewDefaultMeta__Result = void;
/**
*
* @contractMethod change
*/
export interface New {
    args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: u32;
        sale: Sale;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type New__Result = void;
/**
*
* @contractMethod change
*/
export interface NftMint {
    args: {
        token_id: TokenId;
        token_owner_id: AccountId;
        token_metadata: TokenMetadata;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftMint__Result = Token;
/**
*
* @contractMethod change
*/
export interface NftMintOne {
    args: {};
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftMintOne__Result = Token;
/**
*
* @contractMethod change
*/
export interface NftMintMany {
    args: {
        num: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default "0"
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftMintMany__Result = Token[];
