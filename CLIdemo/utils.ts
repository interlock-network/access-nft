//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - UTILITIES
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const WeightV2 = require('@polkadot/types/interfaces');

// environment constants
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
  let outputerror;
  if (result.isOk) {
      
    // check if OK result is reverted contract that returned error
    if (RESULT.ok.flags == 'Revert') {

      // is this error a custom error?  
      if (OUTPUT.ok.err.hasOwnProperty('custom')) {

        // logging custom error
        outputerror = hexToString(OUTPUT.ok.err.custom.toString().replace(/0x/, ''));
        console.log(red(`ACCESSNFT:`) +
          ` ${outputerror}`);
      } else {
          
        // if not custom then print Error enum type
        outputerror = OUTPUT.ok.err
        console.log(red(`ACCESSNFT:`) +
          ` ${outputerror}`);
      }

      // send message and signature values to servers
      socket.emit(`${origin}-${method}-contract-error`, [...args, outputerror]);
      return [ false, false, false, false ]
    }
  } else {

    // send calling error message
    outputerror = result.asErr.toHuman();
    console.log(red(`ACCESSNFT:`) +
      ` ${outputerror}`);
    socket.emit(`${origin}-${method}-calling-error`, [...args, outputerror]);
    return [ false, false, false, false ]
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
  refTimeLimit: any,
  proofSizeLimit: any,
  origin: string,
  method: string,
  ...args: any[]
) {

  // create key pair for owner
  const keyring = new Keyring({type: 'sr25519'});
  const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    // get attribute isauthenticated state
  var [ gasRequired, storageDeposit, RESULT, OUTPUT ] =
    await contractGetter(
      api,
      socket,
      contract,
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
    console.log(red(`ACCESSNFT:`) +
      ' tx aborted, gas required is greater than the acceptable gas limit.');
    socket.emit(`${origin}-${method}-gaslimit`, [...args], gasRequired);
    discoSocket(socket, origin);
    process.send('gas-limit');
    process.exit();
  }

  // too much storage required?
  if (storageDeposit > storageMax) {
  
    // emit error message with signature values to server
    console.log(red(`ACCESSNFT:`) +
      ' tx aborted, storage required is greater than the acceptable storage limit.');
    socket.emit(`${origin}-${method}-storagelimit`, [...args], storageDeposit);
    discoSocket(socket, origin);
    process.send('gas-limit');
    process.exit();
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

      // emit success message with signature values to server
      socket.emit(`${method}-complete`, [...args]);
      discoSocket(socket, origin);
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

  return hash.toHex()
}

//
// emit message, disconnect socket, and exit process
//
export function terminateProcess(
  socket: any,
  origin: string,
  message: string,
  values: any[],
) {
     
  // emit message to parent process and relay then exit after printing to log
  process.send(message);
  socket.emit(message, values);
  console.log(blue(`ACCESSNFT:`) +
    ` ${origin} socket disconnecting, ID ` + cyan(`${socket.id}`));
  socket.disconnect();
  process.exit();
}

//
// calculate SHA256 hash
//
export function getHash(input) {

  const digest = crypto
    .createHash('sha256')
    .update(input)
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
    choices: [{ title: message, value: 'return' }]
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
  const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

  // define special type for gas weights
  type WeightV2 = InstanceType<typeof WeightV2>;
  const gasLimit = api.registry.createType('WeightV2', {
    refTime: 2**53 - 1,
    proofSize: 2**53 - 1,
  }) as WeightV2;

  // get getter output
  var { gasRequired, storageDeposit, result, output } =
    await contract.query['getCollection'](
      OWNER_PAIR.address, {gasLimit}, wallet);

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
// disconnect socket
//
export function discoSocket(socket, origin) {

      console.log(blue(`ACCESSNFT:`) +
        ` ${origin} socket disconnecting, ID ` + cyan(`${socket.id}`));
      socket.disconnect();
}

// 
// check if valid mnemonic
//
export function isValidMnemonic(mnemonic) {

	var wordCount = mnemonic.trim().split(' ').length;

	if (wordCount != 12) return false;

	return true
}
