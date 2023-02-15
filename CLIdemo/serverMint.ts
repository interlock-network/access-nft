//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER MINT
//

// imports
import { io } from 'socket.io-client';

// utility functions
import {
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

    console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `minting NFT for` + magenta(` ${recipient}`));

    // call mint tx
    await contractDoer(
      api,
      socket,
      contract,
      storageDepositLimit,
      refTimeLimit,
      proofSizeLimit,
      'mint',
      'mint',
      recipient
   );

  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) + error);

    discoSocket(socket, 'mint')
    process.send('program-error');
    process.exit();
  }
}

process.on('message', wallet => {

  // setup socket connection with autheticateWallet script
  var socket = io('http://localhost:3000');
  socket.on('connect', () => {

    console.log(blue(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `mint socket connected, ID ` + cyan(`${socket.id}`));
    
    setAuthenticated(wallet, socket).catch((error) => {

      console.error(error);
      process.exit(-1);
    });
  });
});

