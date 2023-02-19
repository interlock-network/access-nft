//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER SET AUTHENTICATED
//

// imports
import { io } from 'socket.io-client';

// utility functions
import {
  contractGetter,
  setupSession,
  contractDoer,
  discoSocket
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// constants
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const FALSE = '0x66616c7365';

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

      // get attribute isauthenticated state
      var [ gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated ] =
        await contractGetter(
          api,
          socket,
          contract,
          'setAuthenticated',
          'psp34Metadata::getAttribute',
          {u64: nft.u64},
          ISAUTHENTICATED,
        ); 
      let authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));

      // record nft id of one that is waiting and ready to authenticate
      if (authenticated.ok == FALSE) {

        notAuthenticatedId = nft.u64;
      }
    }

    // call setAuthenticated transaction
    await contractDoer(
      api,
      socket,
      contract,
      storageDepositLimit,
      refTimeLimit,
      proofSizeLimit,
      'setAuthenticated',
      'setAuthenticated',
      {u64: notAuthenticatedId}
    );

  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) + error);

    discoSocket(socket, 'setCredential')
    process.send('program-error');
    process.exit();
  }
}

process.on('message', wallet => {

  // setup socket connection with autheticateWallet script
  var socket = io('http://localhost:3000');
  socket.on('connect', () => {

    console.log(blue(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `setAuth connect, SID ` + cyan(`${socket.id}`));
    
    setAuthenticated(wallet, socket).catch((error) => {

      console.error(error);
      process.exit(-1);
    });
  });
});
