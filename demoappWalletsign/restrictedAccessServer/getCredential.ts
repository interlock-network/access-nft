//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - RESTRICTED ACCESS AREA GET CREDENTIAL
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const WeightV2 = require('@polkadot/types/interfaces');

// imports
import { readFileSync } from "fs";
import * as dotenv from 'dotenv';
dotenv.config();

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const magenta = color.magenta.bold;

// constants
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const WEB_SOCKET = process.env.WEB_SOCKET;
const ACCESS_METADATA = JSON.parse(readFileSync(process.env.ACCESS_METADATA).toString());
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;

async function credentialCheck(message) {

  try {
  
  // establish connection with blockchain
  const [ api, contract ] = await setupSession('getCredential');

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
    await contract.query['getCredential'](
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
        console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
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
    console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
      `${result.asErr.toHuman()}`);
  }

  const onchainPasshash = OUTPUT.ok.ok[0];
  const nftId = OUTPUT.ok.ok[1];

  if (onchainPasshash != '0x' + message.passhash) {

    process.send('bad-password');
    process.exit();
  }

  process.send('access-granted');
  process.exit();
      
  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) + error);
  }
}

process.on('message', message => {

  credentialCheck(message).catch((error) => {

    console.error(error);
    process.exit(-1);
  });
});

//
// convert hex string to ASCII string
//
function hexToString(hex: String) {

  // iterate through hex string taking byte chunks and converting to ASCII characters
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return str;
}

//
// setup blockchain connection session
//
async function setupSession(
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
