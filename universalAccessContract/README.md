# WIP README


### About the smart contract: 

The universal access NFT (UANFT) is a standard PSP34 NFT smart contract with provisions for Art Zero marketplace and is repurposed in the following manner:

State additions:
1) `nft_price_token: Balance`
2) `collections: Mapping<AccountId, Vec<Id>>`
3) `credentials: Mapping<Hash, (Hash, Id)>`
4) `userhashes: Mapping<Id, Hash>`
5) `token_instance: ILOCKmvpRef`
6) `operator: AccountId`

Function additions/reimplementations:
1) `transfer(to: AccountId, id: Id, data: Vec<u8>)`
2) `mint(recipient: AccountId)`
3) `self_mint(price: Balance)`
4) `create_socket()`
5) `call_socket(address: AccountId, amount: Balance, data: Vec<u8>)`
6) `register(id: Id, userhash: Hash, passhash: Hash)`
7) `set_credential(id: Id, userhash: Hash, passhash: Hash)`
8) `revoke_access(userhash: Hash)`
9) `get_token_price()`
10) `get_collection(address: AccountId)`
11) `get_credential(userhash: Hash)`
12) `is_authenticated(id: Id)`

