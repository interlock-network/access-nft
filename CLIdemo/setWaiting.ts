//
// INTERLOCK NETWORK - SET WAITING
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
var io = require('socket.io-client');
const colors = require('colors');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
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
const ACCESS_METADATA = require(process.env.ACCESS_METADATA);
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const WEB_SOCKET = process.env.WEB_SOCKET;

// constants
const MEG = 1000000;
const gasLimit = 100000 * MEG;
const storageDepositLimit = null;

async function setWaiting(message, socket) {

  try {

    // setup session
    console.log('');
    console.log(blue(`ACCESSNFT:`) +
      ` establishing setWaiting websocket connection with Aleph Zero blockchain...`);
    const wsProvider = new WsProvider(WEB_SOCKET);
    const keyring = new Keyring({type: 'sr25519'});
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log(blue(`ACCESSNFT:`) +
      ` established setWaiting websocket connection with Aleph Zero blockchain ` +
      cyan(`${WEB_SOCKET}`));
    console.log('');

    const contract = new ContractPromise(api, ACCESS_METADATA, ACCESS_CONTRACT);
    const OWNER_pair = keyring.addFromUri(OWNER_MNEMONIC);

    // perform dry run to check for errors
    const { gasRequired, storageDeposit, result, output } =
      await contract.query['setWaiting']
        (OWNER_pair.address, {}, {u64: message.id});

    // too much gas required?
    if (gasRequired > gasLimit) {
      console.log(red(`ACCESSNFT:`) +
        ' tx aborted, gas required is greater than the acceptable gas limit.');
      socket.emit('setwaiting-failure', message.id, message.wallet);
      socket.disconnect();
      console.log(blue(`ACCESSNFT:`) +
        ` setWaiting socket disconnecting, ID ` + cyan(`${socket.id}`));
      process.exit();
    }

    // did the contract revert due to any errors?
    if (result.toHuman().Ok.flags == 'Revert') {
      let error = output.toHuman().Err;
      console.log(red(`ACCESSNFT:`) +
        ` setWaiting TX reverted due to: ${error}`);
      socket.emit('setwaiting-failure', message.id, message.wallet);
      socket.disconnect();
      console.log(blue(`ACCESSNFT:`) +
        ` setWaiting socket disconnecting, ID ` + cyan(`${socket.id}`));
      process.exit();
    }

    // submit doer tx
    let extrinsic = await contract.tx['setWaiting']
      ({ storageDepositLimit, gasLimit }, {u64: message.id})
        .signAndSend(OWNER_pair, result => {
      if (result.status.isInBlock) {
        console.log('in a block');
      } else if (result.status.isFinalized) {
        console.log(green(`ACCESSNFT:`) +
          ` setWaiting successful`);
        socket.emit('awaiting-transfer', message.id, message.wallet);
        socket.disconnect();
        console.log(blue(`ACCESSNFT:`) +
          ` setWaiting socket disconnecting, ID ` + cyan(`${socket.id}`));
        process.exit();
      }
    });

  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);
    console.log(blue(`ACCESSNFT:`) +
      ` setAuthenticated socket disconnecting, ID ` + cyan(`${socket.id}`));
    socket.disconnect();
    process.exit();
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
