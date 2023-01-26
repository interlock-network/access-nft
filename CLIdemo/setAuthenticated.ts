//
// INTERLOCK NETWORK - SET AUTHENTICATED
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
const colors = require('colors');
var io = require('socket.io-client');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
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
const ACCESS_METADATA = require(process.env.ACCESS_METADATA);
const ACCESS_CONTRACT = process.env.ACCESS_CONTRACT;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const WEB_SOCKET = process.env.WEB_SOCKET;
const ISWAITING = '0x697377616974696e67';
const TRUE = '0x74727565';
const FALSE = '0x66616c7365';

// these are derived from contracts-ui, plus extra factor for buffer
const refTime = 8000000000;
const proofSize = 180000;
const storageDepositLimit = null;

async function setAuthenticated(message, socket) {

  try {

    // setup session
    console.log('');
    console.log(blue(`ACCESSNFT:`) +
      ` establishing setAuthenticated websocket connection with Aleph Zero blockchain...`);
    const wsProvider = new WsProvider(WEB_SOCKET);
    const keyring = new Keyring({type: 'sr25519'});
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log(blue(`ACCESSNFT:`) +
      ` established setAuthenticated websocket connection with Aleph Zero blockchain ` +
      cyan(`${WEB_SOCKET}`));
    console.log('');

    const contract = new ContractPromise(api, ACCESS_METADATA, ACCESS_CONTRACT);
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

    // define special type for gas weights
    type WeightV2 = InstanceType<typeof WeightV2>;
    const gasLimit = api.registry.createType('WeightV2', {
      refTime: refTime,
      proofSize: proofSize,
    }) as WeightV2;

    // get NFT collection for wallet
    let { gasRequired, storageDeposit, result, output } =
      await contract.query['ilockerCollection']
        (OWNER_PAIR.address, {gasLimit}, message.wallet);

     let notAuthenticatedId;

    // check if the call was successful
    if (result.isOk) {

      // find nft to authenticated
      const collection = JSON.parse(JSON.stringify(output));
      const array = Array.from(collection.ok.ok);
      let nft: any;
      for (nft of array) {

        // get attribute iswaiting state
        let { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute']
            (OWNER_PAIR.address, {gasLimit}, {u64: nft.u64}, ISWAITING);
        let waiting = JSON.parse(JSON.stringify(output));

        // record nft id of one that is waiting and ready to authenticate
        if (waiting.ok == TRUE) {

          notAuthenticatedId = nft.u64;

          // perform dry run to check for errors
          const { gasRequired, storageDeposit, result, output } =
            await contract.query['setAuthenticated']
              (OWNER_PAIR.address, {gasLimit}, {u64: notAuthenticatedId});

          // too much gas required?
          if (gasRequired > gasLimit) {
            console.log(red(`ACCESSNFT:`) +
              ' tx aborted, gas required is greater than the acceptable gas limit.');
            socket.emit('setauthenticated-failure', notAuthenticatedId, message.wallet);
            socket.disconnect();
            console.log(blue(`ACCESSNFT:`) +
              ` setAuthenticated socket disconnecting, ID ` + cyan(`${socket.id}`));
            process.exit();
          }

          // did the contract revert due to any errors?
          if (result.toHuman().Ok.flags == 'Revert') {
            let error = output.toHuman().Err;
            console.log(red(`ACCESSNFT:`) +
              ` setAuthenticated TX reverted due to: ${error}`);
            socket.emit('setauthenticated-failure', notAuthenticatedId, message.wallet);
            console.log(blue(`ACCESSNFT:`) +
              ` setAuthenticated socket disconnecting, ID ` + cyan(`${socket.id}`));
            socket.disconnect();
            process.exit();
          }

          // submit doer tx
          let extrinsic = await contract.tx['setAuthenticated']
            ({storageDepositLimit, gasLimit}, {u64: notAuthenticatedId})
              .signAndSend(OWNER_PAIR, result => {
            if (result.status.isInBlock) {
              console.log(green(`ACCESSNFT:`) + ' setAuthenticated in a block');
            } else if (result.status.isFinalized) {
              console.log(green(`ACCESSNFT:`) +
                color.bold(` NFT `) + magenta(`ID ${notAuthenticatedId}`) +
		color.bold(` successfully authenticated for wallet `) + magenta(`${message.wallet}`));
              socket.emit('nft-authenticated', notAuthenticatedId, message.wallet);
              socket.disconnect();
              console.log(blue(`ACCESSNFT:`) +
                ` setAuthenticated socket disconnecting, ID ` + cyan(`${socket.id}`));
              process.exit();
            }
          });
        }
      }
    } else {

      // no nfts present
      console.log(red(`ACCESSNFT:`) +
        ` no nfts present for wallet ` + magenta(`${message.wallet}`));
      socket.emit('no-nfts', message.wallet);
      console.log(blue(`ACCESSNFT:`) +
        ` setAuthenticated socket disconnecting, ID ` + cyan(`${socket.id}`));
      socket.disconnect();
      process.exit();
    }

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
      ` setAuthenticated socket connected, ID ` + cyan(`${socket.id}`));
    
    setAuthenticated(message, socket).catch((error) => {
      console.error(error);
      process.exit(-1);
    });
  });
});
