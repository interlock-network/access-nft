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

async function verifyWallet(wallet, socket) {

  try {

    console.log(green(`ACCESSNFT:`) +
      ` initiating authentication process for wallet ` + magenta(`${wallet}`));

    // setup session
    console.log('');
    console.log(blue(`ACCESSNFT:`) +
      ` establishing verifyWallet websocket connection with Aleph Zero blockchain...`);
    const wsProvider = new WsProvider(WEB_SOCKET);
    const keyring = new Keyring({type: 'sr25519'});
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log(blue(`ACCESSNFT:`) +
      ` established verifyWallet websocket connection with Aleph Zero blockchain ` +
      cyan(`${WEB_SOCKET}`));
    console.log('');

    const contract = new ContractPromise(api, ACCESS_METADATA, ACCESS_CONTRACT);
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    let notAuthenticated = false;
    let notAuthenticatedId;

    console.log(yellow(`ACCESSNFT:`) +
      ` checking if waiting for micropayment from wallet ` + magenta(`${wallet}`));
    console.log(yellow(`ACCESSNFT:`) +
      ` and checking that wallet contains unauthenticated nfts`);

    // define special type for gas weights
    type WeightV2 = InstanceType<typeof WeightV2>;
    const gasLimit = api.registry.createType('WeightV2', {
      refTime: 2**53 - 1,
      proofSize: 2**53 - 1,
    }) as WeightV2;

    // get NFT collection for wallet
    var { gasRequired, storageDeposit, result, output } =
      await contract.query['ilockerCollection'](
        OWNER_PAIR.address, {gasLimit}, wallet);

    const collection = JSON.parse(JSON.stringify(output));

    // check if the call was successful
    if (result.isOk) {
      
      // check if OK result is reverted contract that returned error
      const RESULT = JSON.parse(JSON.stringify(result));
      if (RESULT.ok.flags == 'Revert') {
        if (collection.ok.err.hasOwnProperty('custom')) {

          // print custom error
          let error = collection.ok.err.custom.toString().replace(/0x/, '')
          console.log(red(`ACCESSNFT:`) +
            ` ${hexToString(error)}`);
        } else {
          
          // print Error enum type
          console.log(red(`ACCESSNFT:`) +
            ` ${collection.ok.err}`);
        }

        // send message to App relay, and terminated process
        socket.emit('contract-error', notAuthenticatedId, wallet);
        console.log(blue(`ACCESSNFT:`) +
          ` verifyWallet socket disconnecting, ID ` + cyan(`${socket.id}`));
        socket.disconnect();
        process.exit();
      }

      // find nft to authenticate
      //const collection = JSON.parse(JSON.stringify(output));
      const array = Array.from(collection.ok.ok);
      let nft: any;
      for (nft of array) {

        // get attribute isathenticated state
        var { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute']
            (OWNER_PAIR.address, {gasLimit}, {u64: nft.u64}, ISAUTHENTICATED);
        let authenticated = JSON.parse(JSON.stringify(output));

        // record nft id of one that has not yet been authenticated
        if (authenticated.ok == FALSE) {
          notAuthenticated = true;
          notAuthenticatedId = nft.u64;
        }

        // get attribute iswaiting state
        var { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute']
            (OWNER_PAIR.address, {gasLimit}, {u64: nft.u64}, ISWAITING);
        let waiting = JSON.parse(JSON.stringify(output));
        
        // if any one of wallet's nfts are waiting, they must resolve this first
        if (waiting.ok == TRUE) {
          console.log(red(`ACCESSNFT:`) +
            ` need wallet ` + magenta(`${wallet}`) + ` to return validation transfer`);
          socket.emit('still-waiting', notAuthenticatedId, wallet);
          console.log(blue(`ACCESSNFT:`) +
            ` verifyWallet socket disconnecting, ID ` + cyan(`${socket.id}`));
          socket.disconnect();
          process.exit();
        }
      }
    } else {

      // error calling or executing contract, no reversion
      console.log(red(`ACCESSNFT:`) +
        ` ${result.asErr.toHuman()}`);
      socket.emit('calling-error', result.asErr.toHuman());
      console.log(blue(`ACCESSNFT:`) +
        ` verifyWallet socket disconnecting, ID ` + magenta(`${socket.id}`));
      socket.disconnect();
      process.exit();
    }

    // if after checking collection there are no nfts to authenticate
    if (notAuthenticated == false) {

      console.log(red(`ACCESSNFT:`) +
        ` all nfts in wallet ` + magenta(`${wallet}`) + ` already authenticated`);
      socket.emit('all-nfts-authenticated', wallet);
      console.log(blue(`ACCESSNFT:`) +
        ` verifyWallet socket disconnecting, ID ` + cyan(`${socket.id}`));
      socket.disconnect();
      process.exit();

    // or send micropayment to unauthenticated nft
    } else if (notAuthenticated == true) {

      console.log(green(`ACCESSNFT:`) +
        color.bold(` wallet contains valid unauthenticated nft: `) + magenta(`ID ${notAuthenticatedId}`));
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
        
      // change contract state to indicate waiting for return micropayment transaction
      const setWaitingChild = fork(setWaiting);
      setWaitingChild.send({id: notAuthenticatedId, wallet: wallet});

      console.log(blue(`ACCESSNFT:`) +
        ` verifyWallet socket disconnecting, ID ` + cyan(`${socket.id}`));
      socket.disconnect();
      process.exit();
    }

  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);
    socket.emit('process-error', error)
    console.log(blue(`ACCESSNFT:`) +
      ` verifyWallet socket disconnecting, ID ` + cyan(`${socket.id}`));
    socket.disconnect();
    process.exit();
  }
}

process.on('message', wallet => {

  // setup socket connection with autheticateWallet script
  var socket = io.connect('http://localhost:3000', {reconnect: true});
  socket.on('connect', () => {
    console.log(blue(`ACCESSNFT:`) +
      ` verifyWallet socket connected, ID ` + cyan(`${socket.id}`));
    
    verifyWallet(wallet, socket).catch((error) => {
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



