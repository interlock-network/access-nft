//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER SET CREDENTIAL
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
const magenta = color.magenta;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 6050000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

async function setCredential(socket, message) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('setCredential');

    console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `setting credentials for NFT ` + red(`ID ${message.id}`));
    console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `owned by address`);
    console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      magenta(`${message.address}\n`));

    // call setCredential tx
    await contractDoer(
      api,
      socket,
      contract,
      storageDepositLimit,
      refTimeLimit,
      proofSizeLimit,
      'setCredential',
      'setCredential',
      {u64: message.id},
      '0x' + message.userhash,
      '0x' + message.passhash,
    );

  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) + error);

    discoSocket(socket, 'setCredential');
    process.send('setCredential-process-error');
    process.exit();
  }
}

process.on('message', message => {

  // setup socket connection with autheticateWallet script
  var socket = io('http://localhost:3000');
  socket.on('connect', () => {

    console.log(blue(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `setCred connect, SID ` + cyan(`${socket.id}`));
    
    setCredential(socket, message).catch((error) => {

      console.error(error);
      process.exit(-1);
    });
  });
});
