//
// INTERLOCK NETWORK - SET AUTHENTICATED
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
import { io } from 'socket.io-client';

// utility functions
import {
  contractGetter,
  setupSession,
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
const ISWAITING = '0x697377616974696e67';
const TRUE = '0x74727565';

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 6050000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

async function setAuthenticated(wallet, socket) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('setAuthenticated');

    var notAuthenticatedId;
    var isWaiting = false;

    // get nft collection for wallet
    var [ gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection ] =
      await contractGetter(
        api,
        socket,
        contract,
        'setAuthenticated',
        'getCollection',
        wallet,
      );
    const collection = JSON.parse(JSON.stringify(OUTPUT_collection));

    // find nft to authenticated
    const array = Array.from(collection.ok.ok);
    let nft: any;
    for (nft of array) {

      // get attribute iswaiting state
      var [ gasRequired, storageDeposit, RESULT_waiting, OUTPUT_waiting ] =
        await contractGetter(
          api,
          socket,
          contract,
          'setAuthenticated',
          'psp34Metadata::getAttribute',
          {u64: nft.u64},
          ISWAITING,
        ); 
      let waiting = JSON.parse(JSON.stringify(OUTPUT_waiting));

      // record nft id of one that is waiting and ready to authenticate
      if (waiting.ok == TRUE) {

        isWaiting = true;

        // call doer transaction
        await contractDoer(
          api,
          socket,
          contract,
          storageDepositLimit,
          storageDeposit,
          refTimeLimit,
          proofSizeLimit,
          gasRequired,
          'setAuthenticated',
          'setAuthenticated',
          {u64: nft.u64}
        );
      }
    }

    // if no nfts are waiting, then we need to send authentication transfer first
    if (!isWaiting) {
      console.log(red(`ACCESSNFT: `) +
        ` wallet ${wallet} has no waiting nfts`);
    }
  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);
    terminateProcess(socket, 'setAuthenticated', 'process-error', [ notAuthenticatedId, wallet ]);
  }
}

process.on('message', wallet => {

  // setup socket connection with autheticateWallet script
  var socket = io('http://localhost:3000');
  socket.on('connect', () => {

    console.log(blue(`ACCESSNFT:`) +
      ` setAuthenticated socket connected, ID ` + cyan(`${socket.id}`));
    
    setAuthenticated(wallet, socket).catch((error) => {

      console.error(error);
      process.exit(-1);
    });
  });
});
