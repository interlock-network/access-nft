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
  terminateProcess,
  contractDoer
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
  		const [ api, contract ] = await setupSession('restrictedArea');

    	// get nft collection for wallet
    	var [ gasRequired, storageDepositRequired, RESULT_check, OUTPUT_check ] =
      	await contractGetter(
        	api,
	        socket,
  	      contract,
    	    'restrictedArea',
      	  'getCollection',
					wallet,
      	);

      
  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);
    terminateProcess(socket, 'setAuthenticated', 'program-error', []);
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
