//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER VERIFY WALLET
//

// imports
import { io } from 'socket.io-client';
import { fork } from 'child_process';

// utility functions
import {
  contractGetter,
  setupSession,
  sendMicropayment,
  terminateProcess
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
const TRUE = '0x74727565';
const FALSE = '0x66616c7365';
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const ISWAITING = '0x697377616974696e67';

async function verifyAddress(address, socket) {

  try {

    console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `authenticating address ` + magenta(`${address}`));

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('verifyAddress');

    // track nfts
    let notAuthenticated = false;
    let notAuthenticatedId;

    console.log(yellow(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      magenta(`${address}`) + ` owes micropayment?`);
    console.log(yellow(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      magenta(`${address}`) + ` has valid nft?`);

    // get nft collection for address
    var [ gasRequired, storageDepositRequired, RESULT_collection, OUTPUT_collection ] =
      await contractGetter(
        api,
        socket,
        contract,
        'verifyAddress',
        'getCollection',
        address,
      );

    // find nft to authenticate
    const array = Array.from(OUTPUT_collection.ok.ok);
    let nft: any;
    for (nft of array) {

      // get attribute isathenticated state per nft
      var [ gasRequired, storageDepositRequired, RESULT_authenticated, OUTPUT_authenticated ] =
        await contractGetter(
          api,
          socket,
          contract,
          'verifyAddress',
          'psp34Metadata::getAttribute',
          {u64: nft.u64},
          ISAUTHENTICATED,
        );
      let authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));

      // record nft id of one that has not yet been authenticated
      if (authenticated.ok == FALSE) {
        notAuthenticated = true;
        notAuthenticatedId = nft.u64;
      }
    }

    // if after checking OUTPUT_collection there are no nfts to authenticate
    if (notAuthenticated == false) {

      console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
        magenta(`${address}`) + ` needs unauth nft`);

      terminateProcess(socket, 'verifyAddress', 'all-nfts-authenticated', []);

    // or send micropayment to unauthenticated nft
    } else if (notAuthenticated == true) {

      const hash = await sendMicropayment(
        api,
        address,
        notAuthenticatedId
      );

      terminateProcess(socket, 'verifyAddress', 'waiting', [hash, notAuthenticatedId, address])
    }
  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) + error);
    terminateProcess(socket, 'verifyAddress', 'program-error', []);
  }
}

// entrypoint
process.on('message', address => {

  // setup socket connection with serverMainscript
  var socket = io('http://localhost:3000');
  socket.on('connect', () => {

    console.log(blue(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `verifyAddress socket connected, ID ` + cyan(`${socket.id}`));
    
    verifyAddress(address, socket).catch((error) => {

      console.error(error);
      process.exit(-1);
    });
  });
});
