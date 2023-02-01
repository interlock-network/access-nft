//
// INTERLOCK NETWORK - UTILITIES
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const WeightV2 = require('@polkadot/types/interfaces');

// environment constants
import * as dotenv from 'dotenv';
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
    await contract.query[method](
      OWNER_PAIR.address, {gasLimit}, ...args);

  // convert to JSON format for convenience
  const OUTPUT = JSON.parse(JSON.stringify(output));
  const RESULT = JSON.parse(JSON.stringify(result));

  // check if the call was successful
  if (result.isOk) {
      
    // check if OK result is reverted contract that returned error
    if (RESULT.ok.flags == 'Revert') {

      // is this error a custom error?      
      if (OUTPUT.ok.err.hasOwnProperty('custom')) {

        // logging custom error
        let error = OUTPUT.ok.err.custom.toString().replace(/0x/, '')
        console.log(red(`ACCESSNFT:`) +
          ` ${hexToString(error)}`);
      } else {
          
        // if not custom then print Error enum type
        console.log(red(`ACCESSNFT:`) +
          ` ${OUTPUT.ok.err}`);
      }

      // send message to App relay, and terminated process
      terminateProcess(socket, origin, 'contract-error', ...args);
    }
  } else {

    // loggin calling error and terminate
    console.log(red(`ACCESSNFT:`) +
      ` ${result.asErr.toHuman()}`);
    terminateProcess(socket, origin, 'calling-error', result.asErr.toHuman());
  }

  return [ gasRequired, storageDeposit, RESULT, OUTPUT ]
}


//
// call smart contract doer
//
export async function contractDoer(
  api: any,
  socket: any,
  contract: any,
  storageMax: any,
  storageMin: any,
  refTimeLimit: any,
  proofSizeLimit: any,
  gasMin: any,
  origin: string,
  method: string,
  ...args: any[]
) {

  // create key pair for owner
  const keyring = new Keyring({type: 'sr25519'});
  const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    // define special type for gas weights
    type WeightV2 = InstanceType<typeof WeightV2>;
    const gasLimit = api.registry.createType('WeightV2', {
      refTime: refTimeLimit,
      proofSize: proofSizeLimit,
    }) as WeightV2;

  // too much gas required?
  if (gasMin > gasLimit) {
	
    // logging and terminate
    console.log(red(`ACCESSNFT:`) +
      ' tx aborted, gas required is greater than the acceptable gas limit.');
    terminateProcess(socket, origin, `${origin}-failure`, ...args);
  }

  // submit doer tx
  let extrinsic = await contract.tx[method](
    { storageMax, gasLimit }, ...args)
      .signAndSend(OWNER_PAIR, result => {

    // when tx hits block
    if (result.status.isInBlock) {

      // logging
      console.log(yellow(`ACCESSNFT:`) + ` ${method} in a block`);

    // when tx is finalized in block, tx is successful
    } else if (result.status.isFinalized) {

      // logging and terminate
      console.log(green(`ACCESSNFT:`) +
        color.bold(` ${method} successful`));
      terminateProcess(socket, origin, `${method}-complete`, ...args);
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
  console.log('');
  console.log(blue(`ACCESSNFT:`) +
    ` establishing ${origin} websocket connection with Aleph Zero blockchain...`);

  // create api object
  const wsProvider = new WsProvider(WEB_SOCKET);
  const API = await ApiPromise.create({ provider: wsProvider });

  // logging
  console.log(blue(`ACCESSNFT:`) +
    ` established ${origin} websocket connection with Aleph Zero blockchain ` +
    cyan(`${WEB_SOCKET}`));
  console.log('');

  // create contract object
  const CONTRACT = new ContractPromise(API, ACCESS_METADATA, ACCESS_CONTRACT);

  return [ API, CONTRACT ]
}

//
// send micropayment to verify wallet owner is true 
//
export async function sendMicropayment(
  api: any,
  wallet: string,
  id: number
) {

  // create keypair for owner
  const keyring = new Keyring({type: 'sr25519'});
  const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

  // logging transfer intention
  console.log(green(`ACCESSNFT:`) +
    color.bold(` wallet contains valid unauthenticated nft: `) + red(`ID ${id}`));
  console.log(yellow(`ACCESSNFT:`) +
    ` sending micro payment to wallet ` + magenta(`${wallet}`));

  // create transfer object
  const transfer = api.tx.balances.transfer(wallet, AMOUNT);

  // Sign and send the transaction using our account
  const hash = await transfer.signAndSend(OWNER_PAIR);

  // loggin transfer success
  console.log(green(`ACCESSNFT:`) +
    color.bold(` authentication transfer sent`));
  console.log(green(`ACCESSNFT:`) +
    ` for record, transfer hash is ` + magenta(`${hash.toHex()}`));
}

//
// emit message, disconnect socket, and exit process
//
export function terminateProcess(
  socket: any,
  origin: string,
  message: string,
  ...values: any
) {
     
  // emit message to relay then exit after printing to log
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

  // iterate through hex string taking byte chunks and converting to ASCII characters
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return str;
}

