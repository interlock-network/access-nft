//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MINT TX
//

// imports (anything polkadot with node-js must be required)
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const WeightV2 = require('@polkadot/types/interfaces');

// utility functions
import {
  setupSession,
  contractGetter,
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const yellow = color.yellow.bold;
const magenta = color.magenta;

// environment constants
import * as dotenv from 'dotenv';
dotenv.config();

const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;

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

	  // create key pair for owner
  	const keyring = new Keyring({type: 'sr25519'});
	  const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

  	// get attribute isauthenticated state
  	var [ gasRequired, storageDeposit, RESULT, OUTPUT ] =
    	await contractGetter(
      	api,
	      contract,
  	    'mint',
    	  'mint',
      	recipient
	    ); 

	  // define special type for gas weights
  	type WeightV2 = InstanceType<typeof WeightV2>;
	  const gasLimit = api.registry.createType('WeightV2', {
  	  refTime: refTimeLimit,
    	proofSize: proofSizeLimit,
	  }) as WeightV2;

  	// too much gas required?
	  if (gasRequired > gasLimit) {
  
  	  // emit error message with signature values to server
    	console.log(red(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
      	'tx needs too much gas');
	    process.send('gas-limit');
  	  process.exit();
	  }

  	// too much storage required?
	  if (storageDeposit > storageDepositLimit) {
  
  	  // emit error message with signature values to server
    	console.log(red(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
      	'tx needs too much storage');
	    process.send('storage-limit');
  	  process.exit();
	  }

  	// submit doer tx
	  let extrinsic = await contract.tx['mint'](
  	  { storageDepositLimit, gasLimit }, recipient)
    	  .signAndSend(OWNER_PAIR, result => {

	    // when tx hits block
  	  if (result.status.isInBlock) {

	      // logging
  	    console.log(yellow(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) + `mint in a block`);

	    // when tx is finalized in block, tx is successful
  	  } else if (result.status.isFinalized) {

	      // logging and terminate
  	    console.log(green(`UA-NFT`) + color.bold(`|BLOCKCHAIN: `) +
    	    color.bold(`mint successful`));

      	// emit success message with signature values to server
	      process.send(`mint-complete`);
  	    process.exit();
	    }
	  });

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

