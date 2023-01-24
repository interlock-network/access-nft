//
// INTERLOCK NETWORK - SET AUTHENTICATED
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
const colors = require('colors');
var io = require('socket.io-client');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
require('dotenv').config();

// constants
const ACCESS_METADATA = require(process.env.ACCESS_METADATA);
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const WEB_SOCKET = process.env.WEB_SOCKET;

// constants
const MEG = 1000000;
const gasLimit = 100000 * MEG;
const storageDepositLimit = null;

async function setAuthenticated(message, socket) {

  try {

    // setup session
    console.log('');
    console.log(`ACCESSNFT:`.blue.bold +
      ` establishing setAuthenticated websocket connection with Aleph Zero blockchain...`);
    const wsProvider = new WsProvider(WEB_SOCKET);
    const keyring = new Keyring({type: 'sr25519'});
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log(`ACCESSNFT:`.blue.bold +
      ` established setAuthenticated websocket connection with Aleph Zero blockchain ` +
      `${WEB_SOCKET}`.cyan.bold);
    console.log('');

    const contract = new ContractPromise(api, ACCESS_METADATA, ACCESS_CONTRACT);
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);


    // get NFT collection for wallet
    let { gasRequired, storageDeposit, result, output } =
      await contract.query['ilockerCollection']
        (OWNER_PAIR.address, {}, message.wallet);
console.log(result);
    // check if the call was successful
    if (result.isOk) {

      // find the waiting nft to authenticate
      const collection = JSON.parse(JSON.stringify(output));
      for (nft in collection.ok) {

        // get attribute iswaiting state
        let { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute']
            (OWNER_PAIR.address, {}, {u64: collection.ok[nft].u64}, ISWAITING);
        let waiting = JSON.parse(JSON.stringify(output));

        // record nft id of one that is waiting and ready to authenticate
        if (waiting == TRUE) {

          notAuthenticatedId = collection.ok[nft].u64;

          // perform dry run to check for errors
          const { gasRequired, storageDeposit, result, output } =
            await contract.query['setAuthenticated']
              (OWNER_PAIR.address, {}, {u64: notAuthenticatedId});

          // too much gas required?
          if (gasRequired > gasLimit) {
            console.log(`ACCESSNFT:`.red.bold +
              ' tx aborted, gas required is greater than the acceptable gas limit.');
            socket.emit('setauthenticated-failure', notAuthenticatedId, message.wallet);
            socket.disconnect();
            console.log(`ACCESSNFT:`.blue.bold +
              ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
            process.exit();
          }

          // did the contract revert due to any errors?
          if (result.toHuman().Ok.flags == 'Revert') {
            let error = output.toHuman().Err;
            console.log(`ACCESSNFT:`.red.bold +
              ` setAuthenticated TX reverted due to: ${error}`);
            socket.emit('setauthenticated-failure', notAuthenticatedId, message.wallet);
            console.log(`ACCESSNFT:`.blue.bold +
              ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
            socket.disconnect();
            process.exit();
          }

          // submit doer tx
          let extrinsic = await contract.tx['setAuthenticated']
            ({ storageDepositLimit, gasLimit }, {u64: notAuthenticatedId})
              .signAndSend(OWNER_PAIR, result => {
            if (result.status.isInBlock) {
              console.log('in a block');
            } else if (result.status.isFinalized) {
              console.log(`ACCESSNFT:`.green.bold +
                ` NFT ID ` + `${id}`.magenta.bold +
		` successfully authenticated for wallet ` + `${message.wallet}`.magenta.bold);
              socket.emit('nft-authenticated', notAuthenticatedId, messsage.wallet);
              socket.disconnect();
              console.log(`ACCESSNFT:`.blue.bold +
                ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
              process.exit();
            }
          });
        }
      }
    } else {

      // no nfts present
      console.log(`ACCESSNFT:`.red.bold +
        ` no nfts present for wallet ` + `${message.wallet}`.magenta.bold);
      socket.emit('no-nfts', message.wallet);
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

process.on('message', message => {

  // setup socket connection with autheticateWallet script
  var socket = io.connect('http://localhost:3000', {reconnect: true});
  socket.on('connect', () => {
    console.log(`ACCESSNFT:`.blue.bold +
      ` setAuthenticated socket connected, ID ` + `${socket.id}`.cyan.bold);
    
    setAuthenticated(message, socket).catch((error) => {
      console.error(error);
      process.exit(-1);
    });
  });
});
