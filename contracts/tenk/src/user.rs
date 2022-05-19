//! User deposits

// use std::intrinsics::atomic_load_unordered;

use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
use near_sdk::json_types::U128;
use near_sdk::{env, ext_contract, log, AccountId, Balance, PromiseOrValue};

use crate::*;

const E21: Balance = 1000_000000_000000_000000; // 1e21
pub const MIN_BAL: Balance = E21 * 500; // 0.5

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
        assert!(token == self.cheddar, "only CHEDDAR deposits are allowed()");
        if let Some(deposit) = self.cheddar_deposits.get(&sender_id) {
            self.cheddar_deposits
                .insert(&sender_id, &(deposit + amount.0));
        } else {
            assert!(
                amount.0 >= MIN_BAL,
                "deposit amount must be at least 0.1 CHEDDAR"
            );
            self.cheddar_deposits.insert(&sender_id, &amount.0);
            log!("Registering account {}", sender_id);
        }

        return PromiseOrValue::Value(U128(0));
    }
}

#[near_bindgen]
impl Contract {
    /// if amount == None, then we withdraw all Cheddar and unregister the user
    pub fn withdraw_cheddar(&mut self, amount: Option<U128>) {
        let user = env::predecessor_account_id();
        let mut deposit = self
            .cheddar_deposits
            .get(&user)
            .expect("account deposit is empty");

        if amount.is_none() {
            log!("Unregistering account {}", user);
            self.cheddar_deposits.remove(&user);
        } else {
            let amount = amount.unwrap().0;
            assert!(deposit >= amount, "not enough deposit");
            if deposit == amount {
                log!("Unregistering account {}", user);
                self.cheddar_deposits.remove(&user);
            } else {
                deposit -= amount;
                assert!(deposit > MIN_BAL, "When withdrawing, either withdraw everyting to unregister or keep at least 1Cheddar");
                self.cheddar_deposits.insert(&user, &(deposit));
            }
        }
        ext_ft::ft_transfer(
            user,
            deposit.into(),
            Some("Cheddar TENK withdraw".to_string()),
            self.cheddar.clone(),
            1,
            GAS_FOR_FT_TRANSFER,
        );
    }

    /// returns user Cheddar balance
    pub fn balance_of(&self, account_id: &AccountId) -> U128 {
        self.cheddar_deposits
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
