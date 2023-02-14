//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - RESTRICTED CREDENTIAL CHECK
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { io } from 'socket.io-client';

// utility functions
import {
  contractGetter,
  setupSession,
  hexToString
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// constants
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const FALSE = '0x66616c7365';

const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;

async function credentialCheck(message) {

  try {
  
  // establish connection with blockchain
  const [ api, contract ] = await setupSession('restrictedArea');

  // create keypair for owner
  const keyring = new Keyring({type: 'sr25519'});
  const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

  // define special type for gas weights
  type WeightV2 = InstanceType<typeof WeightV2>;
  const gasLimit = api.registry.createType('WeightV2', {
    refTime: 2**53 - 1,
    proofSize: 2**53 - 1,
  }) as WeightV2;

  // get getter output
  var { gasRequired, storageDeposit, result, output } =
    await contract.query['checkCredential'](
      OWNER_PAIR.address, {gasLimit}, '0x' + message.userhash);

  // convert to JSON format for convenience
  var OUTPUT = JSON.parse(JSON.stringify(output));
  var RESULT = JSON.parse(JSON.stringify(result));

  // check if the call was successful
  if (result.isOk) {
      
    // check if OK result is reverted contract that returned error
    if (RESULT.ok.flags == 'Revert') {

      // is this error a custom error?      
      if (OUTPUT.ok.err.hasOwnProperty('custom')) {

        // logging custom error
        let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
        console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
          `${hexToString(error)}`);
        process.send('bad-username');
        process.exit();

      } else {
          
        // if not custom then print Error enum type
        console.log(red(`UA-NFT:`) +
          ` ${OUTPUT.ok.err}`);
      }
    }
  } else {

    // loggin calling error and terminate
    console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
      `${result.asErr.toHuman()}`);
  }

  const onchainPasshash = OUTPUT.ok.ok[0];
  const nftId = OUTPUT.ok.ok[1];

  if (onchainPasshash != '0x' + message.passhash) {

    process.send('bad-password');
    process.exit();
  }

  // get getter output
  var { gasRequired, storageDeposit, result, output } =
    await contract.query['psp34Metadata::getAttribute'](
      OWNER_PAIR.address, {gasLimit}, {u64: nftId}, ISAUTHENTICATED);

  // convert to JSON format for convenience
  var OUTPUT = JSON.parse(JSON.stringify(output));
  var RESULT = JSON.parse(JSON.stringify(result));

  // check if the call was successful
  if (result.isOk) {
      
    // check if OK result is reverted contract that returned error
    if (RESULT.ok.flags == 'Revert') {

      // is this error a custom error?      
      if (OUTPUT.ok.err.hasOwnProperty('custom')) {

        // logging custom error
        let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
        console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
          `${hexToString(error)}`);
        process.send('bad-username');
        process.exit();

      } else {
          
        // if not custom then print Error enum type
        console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
          `${OUTPUT.ok.err}`);
      }
    }
  } else {

    // loggin calling error and terminate
    console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
      `${result.asErr.toHuman()}`);
  }

  const authStatus = OUTPUT.ok;

  if (authStatus == FALSE) {

    process.send('not-authenticated');
    process.exit();
  }

  process.send('access-granted');
  process.exit();

      
  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) + error);
  }
}

process.on('message', message => {

  credentialCheck(message).catch((error) => {

    console.error(error);
    process.exit(-1);
  });
});


