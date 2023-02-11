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
const MAXRETRY = 3;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 8000000000;
const proofSizeLimit = 180000;
const storageDepositLimit = null;

async function setAuthenticated(recipient, socket) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('setAuthenticated');

    // get attribute isauthenticated state
    var [ gasRequired, storageDeposit, RESULT_mint, OUTPUT_mint ] =
      await contractGetter(
        api,
        socket,
        contract,
        'mint',
        'mint',
        recipient
      ); 

    // call doer transaction
		let retry = 0;
    while(retry <= MAXRETRY) {
						
			if((
				await contractDoer(
      		api,
	      	socket,
  	    	contract,
    	  	storageDepositLimit,
      		storageDeposit,
	      	refTimeLimit,
  	    	proofSizeLimit,
    	  	gasRequired,
      		'mint',
	      	'mint',
  	    	recipient
    		))) {

      	process.send('mint-complete');
  			console.log(blue(`ACCESSNFT:`) +
    			` ${origin} socket disconnecting, ID ` + cyan(`${socket.id}`));
  			socket.disconnect();
  			process.exit();
			}

			retry++;
		}

    console.log(red(`ACCESSNFT:`) +
      ` FATAL ERROR, UNABLE TO PROCESS MINT TRANSACTION`);
		process.send('mint-complete');
 		console.log(blue(`ACCESSNFT:`) +
    	` ${origin} socket disconnecting, ID ` + cyan(`${socket.id}`));
  	socket.disconnect();
		process.exit();

  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);
    process.send('program-error');
    console.log(blue(`ACCESSNFT:`) +
      ` ${origin} socket disconnecting, ID ` + cyan(`${socket.id}`));
    socket.disconnect();
    process.exit();
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

