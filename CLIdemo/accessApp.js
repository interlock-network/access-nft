//
// INTERLOCK NETWORK - SET AUTHENTICATED
// PSP34 ACCESS NFT AUTHENTICATION
//

// imports
const colors = require('colors');
var io = require('socket.io-client');

async function accessApp(socket, wallet) {

  try {

  socket.emit('authenticate-nft', wallet);

  } catch(error) {

    console.log(`ACCESSNFT:`.red.bold + error);
    console.log(`ACCESSNFT:`.blue.bold +
      ` setAuthenticated socket disconnecting, ID ` + `${socket.id}`.cyan.bold);
    socket.disconnect();
    process.exit();
  }
}

// setup socket connection with autheticateWallet script
var socket = io.connect('http://localhost:3000', {reconnect: true});
socket.on('connect', () => {
  console.log(`ACCESSNFT:`.blue.bold +
    ` accessApp socket connected, ID ` + `${socket.id}`.cyan.bold);
   
  accessApp(socket, process.argv[2]).catch((error) => {
    console.error(error);
    process.exit(-1);
  });
});
