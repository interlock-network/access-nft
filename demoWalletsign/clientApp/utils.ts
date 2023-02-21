//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - UTILITIES
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const WeightV2 = require('@polkadot/types/interfaces');

import { readFileSync } from "fs";
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import * as prompts from 'prompts';
dotenv.config();

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// constants
const ACCESS_METADATA = JSON.parse(readFileSync(process.env.ACCESS_METADATA).toString());
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const WEB_SOCKET = process.env.WEB_SOCKET;

const WALLET = JSON.parse(readFileSync('.wallet.json').toString());
const CLIENT_MNEMONIC = WALLET.CLIENT_MNEMONIC

//
// call smart contract getter
//
export async function contractGetter(
  api: any,
  contract: any,
  pair: any,
  origin: string,
  method: string,
  ...args: any[]
) {

  // define special type for gas weights
  type WeightV2 = InstanceType<typeof WeightV2>;
  const gasLimit = api.registry.createType('WeightV2', {
    refTime: 2**53 - 1,
    proofSize: 2**53 - 1,
  }) as WeightV2;

  // get getter output
  var { gasRequired, storageDeposit, result, output } =
    await contract.query[method](
      pair.address, {gasLimit}, ...args);

  // convert to JSON format for convenience
  const OUTPUT = JSON.parse(JSON.stringify(output));
  const RESULT = JSON.parse(JSON.stringify(result));

  // check if the call was successful
  let outputerror;
  if (result.isOk) {
      
    // check if OK result is reverted contract that returned error
    if (RESULT.ok.flags == 'Revert') {

      // is this error a custom error?  
      if (OUTPUT.ok.err.hasOwnProperty('custom')) {

        // logging custom error
        outputerror = hexToString(OUTPUT.ok.err.custom.toString().replace(/0x/, ''));
        console.log(red(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
          color.bold(`${outputerror}`));
      } else {
          
        // if not custom then print Error enum type
        outputerror = OUTPUT.ok.err
        console.log(red(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
          color.bold(`${outputerror}`));
      }

      // send message and signature values to servers
      return [ false, false, false, false ]
    }
  } else {

    // send calling error message
    outputerror = result.asErr.toHuman();
    console.log(red(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
      color.bold(`${outputerror}`));

    return [ false, false, false, false ]
  }

  return [ gasRequired, storageDeposit, RESULT, OUTPUT ]
}


//
// call smart contract doer
//
export async function contractDoer(
  api: any,
  contract: any,
  pair: any,
  storageMax: any,
  refTimeLimit: any,
  proofSizeLimit: any,
  origin: string,
  method: string,
  ...args: any[]
) {

    // get attribute isauthenticated state
  var [ gasRequired, storageDeposit, RESULT, OUTPUT ] =
    await contractGetter(
      api,
      contract,
      pair,
      origin,
      method,
      ...args
    ); 

  // define special type for gas weights
  type WeightV2 = InstanceType<typeof WeightV2>;
  const gasLimit = api.registry.createType('WeightV2', {
    refTime: refTimeLimit,
    proofSize: proofSizeLimit,
  }) as WeightV2;

  // too much gas required?
  if (gasRequired > gasLimit) {
  
    // emit error message with signature values to server
    console.log(red(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
      color.bold('tx needs too much gas'));
    process.send('gas-limit');
    process.exit();
  }

  // too much storage required?
  if (storageDeposit > storageMax) {
  
    // emit error message with signature values to server
    console.log(red(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
      color.bold('tx needs too much storage'));
    process.send('storage-limit');
    process.exit();
  }

  // submit doer tx
  let extrinsic = await contract.tx[method](
    { storageMax, gasLimit }, ...args)
      .signAndSend(pair, result => {

    // when tx hits block
    if (result.status.isInBlock) {

      // logging
      console.log(yellow(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
				color.bold(`${method} in a block`));

    // when tx is finalized in block, tx is successful
    } else if (result.status.isFinalized) {

      // logging and terminate
      console.log(green(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
        color.bold(`${method} successful`));

      // emit success message with signature values to server
      process.send(`${method}-complete`);
      process.exit();
    }
  });
}

//
// setup blockchain connection session
//
export async function setupSession(
  origin: string
) {
  
  // setup session
  //
  // logging
  console.log(blue(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
    color.bold(`${origin} connecting to ` + magenta(`Aleph Zero blockchain`)));

  // create api object
  const wsProvider = new WsProvider(WEB_SOCKET);
  const API = await ApiPromise.create({ provider: wsProvider });

  // logging
  console.log(blue(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
    color.bold(`secured websocket with ` + magenta(`Aleph Zero blockchain `)));
  console.log(blue(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
    color.bold(`at ` + cyan(`${WEB_SOCKET}\n`)));

  // create contract object
  const CONTRACT = new ContractPromise(API, ACCESS_METADATA, ACCESS_CONTRACT);

  return [ API, CONTRACT ]
}

//
// calculate SHA256 hash
//
export function getHash(input) {

  const digest = crypto
    .createHash('sha256')
    .update(input ?? '')
    .digest('hex');

  return digest
}

//
// convert hex string to ASCII string
//
export function hexToString(hex: String) {

  // iterate through hex string taking byte chunks and converting to ASCII characters
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return str;
}

//
// prompt to return to main menu
//
export async function returnToMain(message: String) {

  const choice = await prompts({
    type: 'select',
    name: 'return',
    message: 'Options:',
    choices: [{ title: color.bold(message), value: 'return' }]
  });

  process.send('done');
  process.exit();
}

//
// checks address to make sure valid substrate address
//
export function isValidSubstrateAddress(wallet: string) {
  try {

    encodeAddress(decodeAddress(wallet))

    // address encodes/decodes wo error => valid address
    return true

  } catch (error) {

    // encode/decode failure => invalid address
    return false
  }
}

//
// Check if wallet has collection
//
export async function hasCollection(api, contract, wallet) {
  try {

  // create keypair for owner
  const keyring = new Keyring({type: 'sr25519'});
  const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

  // define special type for gas weights
  type WeightV2 = InstanceType<typeof WeightV2>;
  const gasLimit = api.registry.createType('WeightV2', {
    refTime: 2**53 - 1,
    proofSize: 2**53 - 1,
  }) as WeightV2;

  // get getter output
  var { gasRequired, storageDeposit, result, output } =
    await contract.query['getCollection'](
      CLIENT_PAIR.address, {gasLimit}, wallet);

  // convert to JSON format for convenience
  const RESULT = JSON.parse(JSON.stringify(result));

    // if this call reverts, then only possible error is 'credential nonexistent'
    if (RESULT.ok.flags == 'Revert') {

      // the only possible error is the custom 'no collection' type
      //
      // :. wallet has no collection
      return false
    }

    // wallet has collection
    return true

  } catch (error) {
    console.log(error)
  }
}

// 
// check if valid mnemonic
//
export function isValidMnemonic(mnemonic) {

  var wordCount = mnemonic.trim().split(' ').length;

  if (wordCount != 12) return false;

  return true
}

//
// prompt cancel action
//
export const onCancel = prompt => {

  setTimeout( () => {

    console.clear();
    console.log(red(`\n YOU ABORTED PROMPT ... RETURNING TO MAIN MENU`));

    setTimeout( () => {

      process.send('abort');
      process.exit();

    }, 2000);
  }, 250);
}

//
// Check if valid username.
//
export function isValidUsername(username) {
  
  try {

    // search for any whitespace
    if (/\s/.test(username)) {

      // username not valid
      return false

    // make sure not too short
    } else if (username.length < 5) {

      // username not valid
      return false
    }

    // username valid
    return true

  } catch (error) {

    return false
  }
}

//
// Check if username is available
//
export async function isAvailableUsername(
	
	api,
	contract,
	usernameHash
) 
{
  try {

  // create keypair for owner
  const keyring = new Keyring({type: 'sr25519'});
  const CLIENT_PAIR = keyring.addFromUri(CLIENT_MNEMONIC);

  // define special type for gas weights
  type WeightV2 = InstanceType<typeof WeightV2>;
  const gasLimit = api.registry.createType('WeightV2', {
    refTime: 2**53 - 1,
    proofSize: 2**53 - 1,
  }) as WeightV2;

  // get getter output
  var { gasRequired, storageDeposit, result, output } =
    await contract.query['getCredential'](
      CLIENT_PAIR.address, {gasLimit}, '0x' + usernameHash);

  // convert to JSON format for convenience
  const RESULT = JSON.parse(JSON.stringify(result));
  const OUTPUT = JSON.parse(JSON.stringify(output));

    // if this call reverts, then only possible error is 'credential nonexistent'
    if (RESULT.ok.flags == 'Revert') {

      // logging custom error
      let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
      console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
        color.bold(`username available!\n`));

      // username is available
      return true
    }

    // username is not available
    return false

  } catch (error) {
    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);
  }
}
