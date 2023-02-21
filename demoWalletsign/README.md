# Interlock Access NFT - CLI Demo

<img style="top: -10px" align="right" width="150" height="150" src="https://user-images.githubusercontent.com/69293813/211382026-cf3fc80c-4489-4017-b10e-c1cb27c89ae0.png">
<img align="right" width="100" height="100" src="https://user-images.githubusercontent.com/69293813/211380333-f29cd213-f1f5-46c6-8c02-5ba0e15588f0.png">

<br>
<br>
<br>

# Setup

## cargo

As this is an ink!4 smart contract, we must do a couple things to get set up properly.

If you haven't already, instally `cargo-dylint`:
```
cargo install cargo-dylint dylint-link
```
Then, even if you have the cargo nightly tool chain installed for ink!3, you will need to install the `cargo-contracts --version 2.0.0-beta` instead:
```
cargo install cargo-contract --version 2.0.0-beta
```

## database

#### For Ubuntu-style OS:
```
sudo apt update
sudo apt install sqlite3
```

#### Verify install:
```
sqlite --version
```

#### Create database in memory:
```
sqlite3 access.db
```

When the `sqlite>` prompt appears create new table and initialize with empty query:
```
CREATE TABLE access(NFTid integer, Wallet text, AuthAmount integer, Waiting integer)
;
```

## node.js

#### Database:
```
npm install sqlite3
```
#### Polkadot:
```
npm install @polkadot/api
npm install @polkadot/api-contract
```
#### Other:
```
npm install node-ipc
npm install path
npm install child_process
```
.

.

.

.

WIP
