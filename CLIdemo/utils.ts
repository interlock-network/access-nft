//
// INTERLOCK NETWORK - UTILITIES
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
var io = require('socket.io-client');
const colors = require('colors');
const path = require('path');
const fork = require('child_process').fork;
const setWaiting = path.resolve('setWaiting.js');
const { BN } = require('@polkadot/util');
const WeightV2 = require('@polkadot/types/interfaces');
require('dotenv').config();

// specify color formatting
const color = require('cli-color');
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan.bold;
const yellow = color.yellow.bold;
const magenta = color.magenta.bold;

// constants
const ACCESS_METADATA = require('./access/target/ink/metadata.json');
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const APP_PROCESS = process.env.APP_PROCESS;
const WEB_SOCKET = process.env.WEB_SOCKET;
const TRUE = '0x74727565';
const FALSE = '0x66616c7365';
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const ISWAITING = '0x697377616974696e67';
const AMOUNT = 1;


//
// call smart contract getter
//
export async function contractGetter(
	api: any,
	socket: any,
	contract: any,
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


    const keyring = new Keyring({type: 'sr25519'});
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    // get getter OUTPUT
    var { gasRequired, storageDeposit, result, output } =
      await contract.query[method](
        OWNER_PAIR.address, {gasLimit}, ...args);

    const OUTPUT = JSON.parse(JSON.stringify(output));
    const RESULT = JSON.parse(JSON.stringify(result));

    // check if the call was successful
    if (result.isOk) {
      
      // check if OK result is reverted contract that returned error
      if (RESULT.ok.flags == 'Revert') {
        if (OUTPUT.ok.err.hasOwnProperty('custom')) {

          // print custom error
          let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
          console.log(red(`ACCESSNFT:`) +
            ` ${hexToString(error)}`);
        } else {
          
          // print Error enum type
          console.log(red(`ACCESSNFT:`) +
            ` ${OUTPUT.ok.err}`);
        }

        // send message to App relay, and terminated process
	terminateProcess(socket, origin, '', ...args);
      }
    } else {

      // error calling or executing contract, no reversion
      console.log(red(`ACCESSNFT:`) +
        ` ${result.asErr.toHuman()}`);
      terminateProcess(socket, origin, 'calling-error', result.asErr.toHuman());
    }

  return [ RESULT, OUTPUT ]
}

//
// setup blockchain connection session
//
export async function setupSession(): Promise< [any, any] > {
  
    // setup session
    console.log('');
    console.log(blue(`ACCESSNFT:`) +
      ` establishing verifyWallet websocket connection with Aleph Zero blockchain...`);
    const wsProvider = new WsProvider(WEB_SOCKET);
    const keyring = new Keyring({type: 'sr25519'});
    const API = await ApiPromise.create({ provider: wsProvider });
    console.log(blue(`ACCESSNFT:`) +
      ` established verifyWallet websocket connection with Aleph Zero blockchain ` +
      cyan(`${WEB_SOCKET}`));
    console.log('');

    const CONTRACT = new ContractPromise(API, ACCESS_METADATA, ACCESS_CONTRACT);

    return [ API, CONTRACT ]
}

//
// convert hex string to ASCII string
//
export async function sendMicropayment(
  api: any,
  wallet: string,
  id: number
) {
  
    const keyring = new Keyring({type: 'sr25519'});
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    console.log(green(`ACCESSNFT:`) +
    color.bold(` wallet contains valid unauthenticated nft: `) + magenta(`ID ${id}`));
    console.log(green(`ACCESSNFT:`) +
      ` sending micro payment to wallet ` + magenta(`${wallet}`));

    // create transfer object
    const transfer = api.tx.balances.transfer(wallet, AMOUNT);

    // Sign and send the transaction using our account
    const hash = await transfer.signAndSend(OWNER_PAIR);

    console.log(green(`ACCESSNFT:`) +
      color.bold(` authentication transfer sent`));
    console.log(green(`ACCESSNFT:`) +
      ` for record, transfer hash is ` + magenta(`${hash.toHex()}`));
}

//
// convert hex string to ASCII string
//
export function terminateProcess(
  socket: any,
  origin: string,
  message: string,
  ...values: any
) {
      socket.emit(message, ...values);
      console.log(blue(`ACCESSNFT:`) +
        ` ${origin} socket disconnecting, ID ` + cyan(`${socket.id}`));
      socket.disconnect();
      process.exit();
  }

//
// convert hex string to ASCII string
//
function hexToString(hex: String) {

  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

