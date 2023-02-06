//
// INTERLOCK NETWORK - SET CREDENTIALS
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
import * as color from 'cli-color';
const red = color.red.bold;
const blue = color.blue.bold;
const cyan = color.cyan;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 6050000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

async function setCredential(message, socket) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('setCredential');

    // check setWaiting contract call via dryrun
    const [ gasRequired, storageDeposit, RESULT_dryrun, OUTPUT_dryrun ] =
      await contractGetter(
        api,
        socket,
        contract,
        'setCredential',
        'setCredential',
        {u64: message.id},
	message.hash
      );

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
      'setCredential',
      'setCredential',
      {u64: message.id},
      message.hash
    );

  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);
    terminateProcess(socket, 'setCredential', 'process-error', [ authenticatingSocket, message.wallet ]);
  }
}

process.on('message', message => {

  // setup socket connection with autheticateWallet script
  var socket = io('http://localhost:3000');
  socket.on('connect', () => {

    console.log(blue(`ACCESSNFT:`) +
      ` setCredential socket connected, ID ` + cyan(`${socket.id}`));
    
    setCredential(message, secureSocket).catch((error) => {

      console.error(error);
      process.exit(-1);
    });
  });
});
