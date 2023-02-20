//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MINT TX
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const WeightV2 = require('@polkadot/types/interfaces');

// utility functions
import {
  setupSession,
  contractDoer,
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// environment constants
import * as dotenv from 'dotenv';
dotenv.config();

const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 8000000000;
const proofSizeLimit = 180000;
const storageDepositLimit = null;

async function mint(recipient) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('mintTx');

    // create key pair for owner
    const keyring = new Keyring({type: 'sr25519'});
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      color.bold(`minting UA-NFT for`));
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${recipient}\n`));

    // call mint tx
    await contractDoer(
      api,
      contract,
      OWNER_PAIR,
      storageDepositLimit,
      refTimeLimit,
      proofSizeLimit,
      'mintTx',
      'mint',
      recipient,
    );
  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);

    process.send('program-error');
    process.exit();
  }
}

process.on('message', recipient => {

  mint(recipient).catch((error) => {

    console.error(error);
    process.exit(-1);
  });
});

