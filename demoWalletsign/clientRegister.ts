//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT REGISTER
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

// imports
import { readFileSync } from "fs";

// utility functions
import {
  setupSession,
  contractDoer,
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 8000000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC

async function register(message) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('register');

    // create keypair for owner
    const keyring = new Keyring({type: 'sr25519'});
    const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`registering credentials for NFT `) + red(`ID ${message.id}`));

    // call register tx
    await contractDoer(
      api,
      contract,
      CLIENT_PAIR,
      storageDepositLimit,
      refTimeLimit,
      proofSizeLimit,
      'register',
      'register',
      {u64: message.id},
      '0x' + message.userhash,
      '0x' + message.passhash,
    );

  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);

    process.send('register-process-error');
    process.exit();
  }
}

process.on('message', message => {

  register(message).catch((error) => {

    console.error(error);
    process.exit(-1);
  });
});
