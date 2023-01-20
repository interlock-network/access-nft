//
// INTERLOCK NETWORK - VERIFY WALLET
// PSP34 ACCESS NFT AUTHENTICATION
//

//
// database table:
// access(NFTid integer, Wallet text, Waiting integer, )
//

// imports
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise, CodePromise } = require('@polkadot/api-contract');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fork = require('child_process').fork;
const setWaiting = path.resolve('setWaiting.js');
require('dotenv').config();

// constants
const ACCESS_METADATA = require('./ACCESS_METADATA.json');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC;
const APP_PROCESS = process.env.APP_PROCESS;
const WEB_SOCKET = process.env.WEB_SOCKET;
const TRUE = '0x74727565';
const FALSE = '0x66616c7365';
const ISAUTHENTICATED = '0x697361757468656e74696361746564';
const ISWAITING = '0x697377616974696e67';
const AMOUNT = 1;

async function verify(message) {

  try {

		// setup session constants
		const wsProvider = new WsProvider(WEB_SOCKET);
    const keyring = new Keyring({type: 'sr25519'});
    const api = await ApiPromise.create({ provider: wsProvider });
    const contract = new ContractPromise(api, ACCESS_METADATA, CONTRACT_ADDRESS);
    const OWNER_PAIR = keyring.addFromUri(OWNER_MNEMONIC);

		// setup socket connection with autheticateWallet script
		var socket = io.connect('http://localhost:3000', {reconnect: true});
		socket.on('connect', (socket) => {
			console.log(`ACCESSNFT:`.blue.bold + ` verifyWallet socket connected`);
		});

    let notAuthenticated = false;
    let notAuthenticatedId;

		console.log(`ACCESSNFT:`.yellow.bold +
			` checking if waiting for micropayment from wallet ` + `${message.wallet}`.magenta.bold);
		console.log(`ACCESSNFT:`.yellow.bold +
			` and checking that wallet contains unauthenticated nfts`);

    // get NFT collection for wallet
    let { gasRequired, storageDeposit, result, output } =
      await contract.query['ilockerCollection'](
        OWNER_PAIR.address, {}, message.wallet);

    // check if the call was successful
    if (result.isOk) {

      // find nft to authenticate
      const collection = JSON.parse(JSON.stringify(output));
      for (nft in collection.ok) {

				// get attribute isathenticated state
        let { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute'](
            OWNER_PAIR.address, {}, {u64: collection.ok[nft].u64}, ISAUTHENTICATED);
        let authenticated = JSON.parse(JSON.stringify(output));

				// record nft id of one that has not yet been authenticated
        if (authenticated == FALSE) {
          notAuthenticated = true;
          notAuthenticatedId = collection.ok[nft].u64;
        }

				// get attribute iswaiting state
				let { gasRequired, storageDeposit, result, output } =
          await contract.query['psp34Metadata::getAttribute'](
            OWNER_PAIR.address, {}, {u64: collection.ok[nft].u64}, ISWAITING);
        let waiting = JSON.parse(JSON.stringify(output));
        
				// if any one of wallet's nfts are waiting, they must resolve this first
				if (waiting == TRUE) {
					console.log(`ACCESSNFT:`.red.bold +
						` need wallet ` + `${message.wallet}`.magenta.bold + ` to return validation transfer`);
					socket.emit('still-waiting', notAuthenticatedId, message.wallet);
					socket.disconnect();
  				console.log(`ACCESSNFT:`.blue.bold +
						` verifyWallet socket disconnected`);
					process.exit();
        }
      }

      // if after checking collection there are no nfts to authenticate
      if (notAuthenticated == false) {

				console.log(`ACCESSNFT:`.red.bold +
					` all nfts in wallet ` + `${message.wallet}`.magenta.bold + ` already authenticated`);
        socket.emit('all-nfts-authenticated', message.wallet);
				socket.disconnect();
  			console.log(`ACCESSNFT:`.blue.bold +
					` verifyWallet socket disconnected`);
        process.exit();

      // or send micropayment to unauthenticated nft
      } else if (notAuthenticated == true) {

    		console.log(`ACCESSNFT:`.green.bold +
					` wallet contains valid unauthenticated nft: ID ` + `${notAuthenticatedId}`.magenta.bold);
    		console.log(`ACCESSNFT:`.green.bold +
					` sending micro payment to wallet ` + `${message.wallet}`.magenta.bold);

  			// create transfer object
  			const transfer = api.tx.balances.transfer(message.wallet, AMOUNT);

  			// Sign and send the transaction using our account
  			const hash = await transfer.signAndSend(OWNER_PAIR);

  			console.log(`ACCESSNFT:`.yellow.bold +
					` authentication transfer sent`);
				console.log(`ACCESSNFT:`.yellow.bold +
					` for record, transfer hash is ` + `${hash.toHex()}`.magenta.bold);
				
				// change contract state to indicate waiting for return micropayment transaction
        const setWaitingChild = fork(setWaiting);
        setWaitingChild.send({id: notAuthenticatedId, wallet: message.wallet});

  			console.log(`ACCESSNFT:`.green.bold +
					` setWaiting successful`);
				socket.disconnect();
  			console.log(`ACCESSNFT:`.blue.bold +
					` verifyWallet socket disconnected`);
				process.exit();
      }
    }

  } catch(error) {

		// if ilockerCollection throws error, then no nfts are present
    console.log(error);
    process.send('no nfts present');
    process.exit();
  }
}

// run main verify()
process.on('message', (message) => {
  verify(message).catch((error) => {
    console.error(error);
    process.exit(-1);
  });
});
