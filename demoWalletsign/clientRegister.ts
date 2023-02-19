//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT REGISTER
//

// utility functions
import {
  setupSession,
  contractDoer,
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 8000000000;
const proofSizeLimit = 150000;
const storageDepositLimit = null;

async function register(message) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('register');

    console.log(green(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) +
      `registering credentials for NFT ` + red(`ID ${message.id}`));

    // call register tx
    await contractDoer(
      api,
      contract,
      storageDepositLimit,
      refTimeLimit,
      proofSizeLimit,
      'register',
      'register',
      {u64: message.id},
      '0x' + message.userhash,
      '0x' + message.passhash,
    );

  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|AUTH-SERVER: `) + error);

    process.send('register-process-error');
    process.exit();
  }
}

process.on('message', message => {

  register(message).catch((error) => {

    console.error(error);
    process.exit(-1);
  });
});
