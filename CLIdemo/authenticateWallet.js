//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 ACCESS NFT - AUTHENTICATE WALLET
//

// 
// This is the parent script for the access NFT authentication process.
// It runs persistently, and spawns a child process each time somebody
// wishes to authenticate the fact that they possess an access NFT,
// to establish access credentials of some sort. This script is meant to
// be simple, limited to listening for requests to authenticate, and spawing
// script to gather credentials in the case of authentication success.
//

const path = require('path');
const prompt = require('prompt-sync')({sigint: true});

const fork = require('child_process').fork;
const program = path.resolve('verifyWallet.js');


const amount = 1;
const wallet = '5EtTSfiarDaXaDiKfVkQii3eCDnbHtEdwggyGX3Zbe45mXH7';


// VVVV loop here to listen for request from webpage VVVV
const child = fork(program);

child.send({amount: amount, wallet: wallet});

child.on('message', message => {
  console.log('status:', message);
  if (message.type == "authentication complete") {

    //////////////////////////////////
    //
    // insert database entry here
    //
    //////////////////////////////////

    //////////////////////////////////
    //
    // prompt webpage to prompt user to enter credentials
    //
    //////////////////////////////////

    //////////////////////////////////
    //
    // listen for credentials and enter in DB?
    //
    //////////////////////////////////

    child.close();
  };
});
// ^^^^ loop here to listen for request from webpage ^^^^



