//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MINT
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { io } from 'socket.io-client';
import { fork } from 'child_process';
import { readFileSync } from "fs";
import * as prompts from 'prompts';

// child process paths
import * as path from 'path';
const mintTx = path.resolve('clientMintTx.js');

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// utility functions
import {
  setupSession,
  returnToMain,
  onCancel
} from "./utils";

// constants
const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_ADDRESS = WALLET.CLIENT_ADDRESS;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

// setup socket connection with autheticateWallet script
var socket = io('http://localhost:3000');
socket.on('connect', async () => {

  console.log(blue(`\nUA-NFT`) + color.bold(`|CLIENT-APP: `) +
    `demoApp connect, SID ` + cyan(`${socket.id}\n`));
   
  // confirm mint process begining
  await (async () => {

    // get response
    var responseChoice = await prompts({
      type: 'confirm',
      name: 'choice',
      message: `Proceed minting a universal access NFT to your account\n` +
        color.bold.magenta(`${CLIENT_ADDRESS}`) +` ?`,
    }, { onCancel });
    const choice = responseChoice.choice
    console.log('');

    // if cancel, exit
    if (choice == false) {

      process.send('done');
      process.exit();
    }
      
    // fork process to mint UANFT to client address
    const mintTxChild = fork(mintTx);
    mintTxChild.send(CLIENT_ADDRESS.toHuman());
  })();
});
