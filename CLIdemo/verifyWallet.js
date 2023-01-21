//
// INTERLOCK NETWORK - VERIFY WALLET
// PSP34 ACCESS NFT AUTHENTICATION
//

//
// database table:
// access(NFTid integer, Wallet text, Waiting integer, )
//

// imports
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
var io = require('socket.io-client');
const colors = require('colors');
const path = require('path');
const fork = require('child_process').fork;
const setWaiting = path.resolve('setWaiting.js');
require('dotenv').config();

// constants
const ACCESS_METADATA = require('./ACCESS_METADATA.json');
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const APP_PROCESS = process.env.APP_PROCESS;
const WEB_SOCKET = process.env.WEB_SOCKET;
const TRUE = '0x74727565';
const FALSE = '0x66616c7365';
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const ISWAITING = '0x697377616974696e67';
const AMOUNT = 1;

async function verifyWallet(wallet, socket) {

  try {

    console.log(`ACCESSNFT:`.green.bold +
      ` initiating authentication process for wallet ` + `${wallet}`.magenta.bold);

    // setup session
    console.log('');
    console.log(`ACCESSNFT:`.blue.bold +
      ` establishing connection with Aleph Zero blockchain...`);
    const wsProvider = new WsProvider(WEB_SOCKET);
    const keyring = new Keyring({type: 'sr25519'});
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log(`ACCESSNFT:`.blue.bold +
      ` established websocket connection with Aleph Zero blockchain ` + `${WEB_SOCKET}`.cyan.bold);
    console.log('');

    const contract = new ContractPromise(api, ACCESS_METADATA, ACCESS_CONTRACT);
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    let notAuthenticated = false;
    let notAuthenticatedId;

    console.log(`ACCESSNFT:`.yellow.bold +
      ` checking if waiting for micropayment from wallet ` + `${wallet}`.magenta.bold);
    console.log(`ACCESSNFT:`.yellow.bold +
      ` and checking that wallet contains unauthenticated nfts`);

    // get NFT collection for wallet
    var { gasRequired, storageDeposit, result, output } =
      await contract.query['ilockerCollection']
        (OWNER_PAIR.address, {}, wallet);

    // check if the call was successful
    if (result.isOk) {

      // find nft to authenticate
      const collection = JSON.parse(JSON.stringify(output));
      for (nft in collection.ok) {

        // get attribute isathenticated state
        var { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute']
	    (OWNER_PAIR.address, {}, {u64: collection.ok[nft].u64}, ISAUTHENTICATED);
        let authenticated = JSON.parse(JSON.stringify(output));

        // record nft id of one that has not yet been authenticated
        if (authenticated == FALSE) {
          notAuthenticated = true;
          notAuthenticatedId = collection.ok[nft].u64;
        }

        // get attribute iswaiting state
        var { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute']
	    (OWNER_PAIR.address, {}, {u64: collection.ok[nft].u64}, ISWAITING);
        let waiting = JSON.parse(JSON.stringify(output));
        
        // if any one of wallet's nfts are waiting, they must resolve this first
        if (waiting == TRUE) {
          console.log(`ACCESSNFT:`.red.bold +
            ` need wallet ` + `${wallet}`.magenta.bold + ` to return validation transfer`);
          socket.emit('still-waiting', notAuthenticatedId, wallet);
          console.log(`ACCESSNFT:`.blue.bold +
            ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
          socket.disconnect();
          process.exit();
        }
      }
    } else {

      // no nfts present
      console.log(`ACCESSNFT:`.red.bold +
        ` no nfts present for wallet ` + `${wallet}`.magenta.bold);
      socket.emit('no-nfts', wallet);
      console.log(`ACCESSNFT:`.blue.bold +
        ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
      socket.disconnect();
      process.exit();
    }

    // if after checking collection there are no nfts to authenticate
    if (notAuthenticated == false) {

      console.log(`ACCESSNFT:`.red.bold +
        ` all nfts in wallet ` + `${wallet}`.magenta.bold + ` already authenticated`);
      socket.emit('all-nfts-authenticated', wallet);
      console.log(`ACCESSNFT:`.blue.bold +
        ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
      socket.disconnect();
      process.exit();

    // or send micropayment to unauthenticated nft
    } else if (notAuthenticated == true) {

      console.log(`ACCESSNFT:`.green.bold +
        ` wallet contains valid unauthenticated nft: ID ` + `${notAuthenticatedId}`.magenta.bold);
      console.log(`ACCESSNFT:`.green.bold +
        ` sending micro payment to wallet ` + `${wallet}`.magenta.bold);

      // create transfer object
      const transfer = api.tx.balances.transfer(wallet, AMOUNT);

      // Sign and send the transaction using our account
      const hash = await transfer.signAndSend(OWNER_PAIR);

      console.log(`ACCESSNFT:`.yellow.bold +
        ` authentication transfer sent`);
      console.log(`ACCESSNFT:`.yellow.bold +
        ` for record, transfer hash is ` + `${hash.toHex()}`.magenta.bold);
        
      // change contract state to indicate waiting for return micropayment transaction
      const setWaitingChild = fork(setWaiting);
      setWaitingChild.send({id: notAuthenticatedId, wallet: wallet});

      console.log(`ACCESSNFT:`.green.bold +
        ` setWaiting successful`);
      console.log(`ACCESSNFT:`.blue.bold +
        ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
      socket.disconnect();
      process.exit();
    }

  } catch(error) {

    console.log(`ACCESSNFT: `.red.bold + error);
    console.log(`ACCESSNFT:`.blue.bold +
      ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
    socket.disconnect();
    process.exit();
  }
}

process.on('message', wallet => {

  // setup socket connection with autheticateWallet script
  var socket = io.connect('http://localhost:3000', {reconnect: true});
  socket.on('connect', () => {
    console.log(`ACCESSNFT:`.blue.bold +
      ` verifyWallet socket connected, ID ` + `${socket.id}`.cyan.bold);
    
    verifyWallet(wallet, socket).catch((error) => {
      console.error(error);
      process.exit(-1);
    });
  });
});
