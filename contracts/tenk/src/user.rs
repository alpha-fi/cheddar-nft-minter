//! User deposits

// use std::intrinsics::atomic_load_unordered;

use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
use near_sdk::json_types::U128;
use near_sdk::{env, ext_contract, log, AccountId, PromiseOrValue};

use crate::*;

// token deposits are done through NEP-141 ft_transfer_call to the NEARswap contract.
#[near_bindgen]
impl FungibleTokenReceiver for Contract {
    /**
    FungibleTokenReceiver implementation Callback on receiving tokens by this contract.
    Handles both farm deposits and stake deposits. For farm deposit (sending tokens
    to setup the farm) you must set "setup reward deposit" msg.
    Otherwise tokens will be staken.
    Returns zero.
    Panics when:
    - account is not registered
    - or receiving a wrong token
    - or making a farm deposit after farm is finalized
    - or staking before farm is finalized. */
    #[allow(unused_variables)]
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let token = env::predecessor_account_id();
        let mut token_parameters = self.get_token_parameters(&Some(token.clone()));
        
        if let Some(deposit) = token_parameters.token_deposits.get(&sender_id) {
            token_parameters.token_deposits
                .insert(&sender_id, &(deposit + amount.0));
            self.fungible_tokens.insert(&token, &token_parameters);
        } else {
            assert!(
                amount.0 >= self.get_one_token_in_yocto(&token),
                "deposit amount must be at least 0.1 of {}", &token
            );
            token_parameters.token_deposits
                .insert(&sender_id, &amount.0);
            self.fungible_tokens.insert(&token, &token_parameters);
            log!("Registering account {}", sender_id);
        }

        return PromiseOrValue::Value(U128(0));
    }
}

#[near_bindgen]
impl Contract {
    /// if amount == None, then we withdraw all tokens and unregister the user
    pub fn withdraw_token(&mut self, amount: Option<U128>, token_id: AccountId) {
        let user = env::predecessor_account_id();
        let token = &Some(token_id.clone());

        let mut deposit = self.get_token_parameters(token)
            .token_deposits
            .get(&user)
            .expect("account deposit is empty");

        if amount.is_none() {
            log!("Unregistering account {}", user);
            self.get_token_parameters(token)
                .token_deposits
                .remove(&user);
        } else {
            let amount = amount.unwrap().0;
            assert!(deposit >= amount, "not enough deposit");
            if deposit == amount {
                log!("Unregistering account {}", user);
                self.get_token_parameters(token)
                    .token_deposits
                    .remove(&user);
            } else {
                deposit -= amount;
                assert!(deposit > self.get_one_token_in_yocto(&token_id), "When withdrawing, either withdraw everyting to unregister or keep at least 1 Token");
                self.get_token_parameters(token)
                    .token_deposits
                    .insert(&user, &(deposit));
            }
        }
        ext_ft::ft_transfer(
            user,
            deposit.into(),
            Some("Token withdraw".to_string()),
            token_id,
            ONE_YOCTO,
            GAS_FOR_FT_TRANSFER,
        );
        
    }

    /// returns user Token balance
    pub fn balance_of(&self, account_id: &AccountId, token_id: &Option<AccountId>) -> U128 {
        self.get_token_parameters(token_id)
            .token_deposits
            .get(account_id)
            .unwrap_or_default()
            .into()
    }
}

#[ext_contract(ext_ft)]
pub trait FungibleToken {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
    fn ft_mint(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
}
