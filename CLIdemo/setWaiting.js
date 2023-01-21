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

// constants
const ACCESS_METADATA = require('./access_metadata.json');
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;

// constants
const MEG = 1000000;
const gasLimit = 100000 * MEG;
const storageDepositLimit = null;

async function setWaiting(message) {

  try {

    // setup session
    const wsProvider = new WsProvider('wss://ws.test.azero.dev');
    const keyring = new Keyring({type: 'sr25519'});
    const api = await ApiPromise.create({ provider: wsProvider });
    const contract = new ContractPromise(api, ACCESS_METADATA, ACCESS_CONTRACT);
    const OWNER_pair = keyring.addFromUri(OWNER_MNEMONIC);

    // perform dry run to check for errors
    const { gasRequired, storageDeposit, result, output } =
      await contract.query['setWaiting']
        (OWNER_pair.address, {}, {u64: message.id});

    // too much gas required?
    if (gasRequired > gasLimit) {
      console.log('tx aborted, gas required is greater than the acceptable gas limit.');
      socket.emit('setwaiting-failure', message.id, message.wallet);
      socket.disconnect();
      console.log(`ACCESSNFT:`.blue.bold + ` setWaiting socket disconnected`);
      process.exit();
    }

    // did the contract revert due to any errors?
    if (result.toHuman().Ok.flags == 'Revert') {
      let error = output.toHuman().Err;
      console.log(`ACCESSNFT:`.red.bold + ` setWaiting TX reverted due to: ${error}`);
      socket.emit('setwaiting-failure', message.id, message.wallet);
      socket.disconnect();
      console.log(`ACCESSNFT:`.blue.bold + ` setWaiting socket disconnected`);
      process.exit();
    }

    // submit doer tx
    let extrinsic = await contract.tx['setWaiting']
      ({ storageDepositLimit, gasLimit }, {u64: message.id})
        .signAndSend(OWNER_pair, result => {
      if (result.status.isInBlock) {
        console.log('in a block');
      } else if (result.status.isFinalized) {
        socket.emit('awaiting-transfer', message.id, message.wallet);
        socket.disconnect();
        console.log(`ACCESSNFT:`.blue.bold + ` setWaiting socket disconnected`);
        process.exit();
      }
    });

  } catch(error) {

    console.log(error);
    process.exit();
  }
}

process.on('message', message => {

  // setup socket connection with autheticateWallet script
  var socket = io.connect('http://localhost:3000', {reconnect: true});
  socket.on('connect', () => {
    console.log(`ACCESSNFT:`.blue.bold +
      ` setWaiting socket connected, ID ` + `${socket.id}`.cyan.bold);
    
    setWaiting(message, socket).catch((error) => {
      console.error(error);
      process.exit(-1);
    });
  });
});
