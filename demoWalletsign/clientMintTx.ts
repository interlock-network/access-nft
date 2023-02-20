//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MINT TX
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
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
const refTimeLimit = 8000000000;
const proofSizeLimit = 180000;
const storageDepositLimit = null;

async function mint(recipient) {

  try {

    // establish connection with blockchain
    const [ api, contract ] = await setupSession('setAuthenticated');

    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      `minting UA-NFT for`);
    console.log(green(`UA-NFT`) + color.bold(`|CLIENT-APP: `) +
      magenta(`${recipient}\n`));

    // call mint tx
    await contractDoer(
      api,
      contract,
      storageDepositLimit,
      refTimeLimit,
      proofSizeLimit,
      'mint',
      'mint',
      recipient
   );

  } catch(error) {

    console.log(red(`UA-NFT`) + color.bold(`|CLIENT-APP: `) + error);

    process.send('program-error');
    process.exit();
  }
}

process.on('message', recipient => {

  mint(recipient).catch((error) => {

    console.error(error);
    process.exit(-1);
  });
});

