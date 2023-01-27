//
// INTERLOCK NETWORK - SET WAITING
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
var io = require('socket.io-client');
const colors = require('colors');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const { BN } = require('@polkadot/util');
const WeightV2 = require('@polkadot/types/interfaces');
require('dotenv').config();


// utility functions
import {
  contractGetter,
  setupSession,
  sendMicropayment,
  terminateProcess,
  contractDoer
} from "./utils";

// specify color formatting
const color = require('cli-color');
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan.bold;
const yellow = color.yellow.bold;
const magenta = color.magenta.bold;

// constants
const ACCESS_METADATA = require(process.env.ACCESS_METADATA);
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const WEB_SOCKET = process.env.WEB_SOCKET;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 6050000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

async function setWaiting(message, socket) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession();

    // check setWaiting contract call via dryrun
    const [ gasRequired, storageDepositRequired, RESULT_dryrun, OUTPUT_dryrun ] =
    await contractGetter(
      api,
      socket,
      contract,
      'setWaiting',
      'setWaiting',
      {u64: message.id}
    );

    // call doer transaction
    await contractDoer(
      api,
      socket,
      contract,
      storageDepositLimit,
      storageDepositRequired,
      refTimeLimit,
      proofSizeLimit,
      gasRequired,
      'setWaiting',
      'setWaiting',
      {u64: message.id}
    );

  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);
    terminateProcess(socket, 'verifyWallet', 'process-error', [ message.id, message.wallet ]);
  }
}

process.on('message', message => {

  // setup socket connection with autheticateWallet script
  var socket = io.connect('http://localhost:3000', {reconnect: true});
  socket.on('connect', () => {
    console.log(blue(`ACCESSNFT:`) +
      ` setWaiting socket connected, ID ` + cyan(`${socket.id}`));
    
    setWaiting(message, socket).catch((error) => {
      console.error(error);
      process.exit(-1);
    });
  });
});




function hexToString(hex: String) {

  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}
