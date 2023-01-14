//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 ACCESS NFT - AUTHENTICATE WALLET
//

// 
// This is the parent script for the access NFT authentication process.
// It runs persistently, and spawns a verifyWalletChild process each time somebody
// wishes to authenticate the fact that they possess an access NFT,
// to establish access credentials of some sort. This script is meant to
// be simple, limited to listening for requests to authenticate, and spawing
// script to gather credentials in the case of authentication success.
//

//
// CREATE TABLE access(nftid integer, wallet text, waiting integer, complete integer)
// 





// testing purposes only
// const prompt = require('prompt-sync')({sigint: true});




const ipc = require('node-ipc').default;
const path = require('path');
const fork = require('child_process').fork;
const verifyWallet = path.resolve('verifyWallet.js');
const getCredentials = path.resolve('getCredentials.js');

// setup server for app to connect to
ipc.config.id = 'authenticateWallet';
ipc.config.retry = 500;
// ipc.config.silent = true;

// message to expect from CLIapp { type: string = 'authenticate wallet', wallet: string}
ipc.serve(() => ipc.server.on('authenticate wallet', message => {

	// QUESTION: will this spin up only one child process at a time?
	// 					 ...or will is be in parallel as intended?

  console.log(`ACCESSNFT: beginning auth process for wallet = ${message.wallet}`);

	const verifyWalletChild = fork(verifyWallet);
	verifyWalletChild.send({wallet: message.wallet});

	verifyWalletChild.on('message', childMessage => {
  	
		console.log(`ACCESSNFT: ${childMessage.type} for wallet = ${message.wallet}`);
  	if (message.type == "authentication complete") {

    	//////////////////////////////////
    	//
	  	// CALL CREDENTIAL-GATHERING CHILD SCRIPT
    	//
    	//////////////////////////////////

    	verifyWalletChild.close();
  	};
	});
}));
ipc.server.start();

// testing purposes only
// const amount = 1;
// const wallet = '5EtTSfiarDaXaDiKfVkQii3eCDnbHtEdwggyGX3Zbe45mXH7';


