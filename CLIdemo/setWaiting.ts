//
// INTERLOCK NETWORK - SET WAITING
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
var io = require('socket.io-client');

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
const blue = color.blue.bold;
const cyan = color.cyan.bold;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 6050000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

async function setWaiting(message, socket) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('setWaiting');

    // check setWaiting contract call via dryrun
    const [ gasRequired, storageDeposit, RESULT_dryrun, OUTPUT_dryrun ] =
      await contractGetter(
        api,
        socket,
        contract,
        'setWaiting',
        'setWaiting',
        {u64: message.id}
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
      'setWaiting',
      'setWaiting',
      {u64: message.id}
    );

  } catch(error) {

    console.log(red(`ACCESSNFT: `) + error);
    terminateProcess(socket, 'setWaiting', 'process-error', [ message.id, message.wallet ]);
  }
}

process.on('message', message => {

  // setup socket connection with autheticateWallet script
  var socket = io.connect('http://localhost:3000', {reconnect: true});
  socket.on('connect', () => {

    console.log(blue(`ACCESSNFT:`) +
      ` setWaiting socket connected, ID ` + cyan(`${socket.id}`));
    
    setWaiting(message, socket).catch((error) => {

      console.error(error);
      process.exit(-1);
    });
  });
});
