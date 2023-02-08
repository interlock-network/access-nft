//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - RESTRICTED AREA
//

// imports
import { fork } from 'child_process';
import { createServer } from "https";
import { readFileSync } from "fs";
import { Server } from "socket.io";
import * as express from 'express';

// child process paths
import * as path from 'path';
const restrictedCredentialCheck = path.resolve('restrictedCredentialCheck.js');

// utility functions
import {
  contractGetter,
  setupSession,
  terminateProcess,
  contractDoer,
  getHash
} from "./utils";

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const magenta = color.magenta.bold;

// constants
const SERVERPORT = 8443;

// setup server
const app = express();
const options = {  
  key: readFileSync('/Users/blairmunroakusa/_ROOT/interlockDUMP/access-nft/CLIdemo/server-creds/key.pem'),
  cert: readFileSync('/Users/blairmunroakusa/_ROOT/interlockDUMP/access-nft/CLIdemo/server-creds/cert.pem')
};
const httpsServer = createServer(options, app);
const io = new Server(httpsServer);

io.on('connect', (socket) => {

  console.log(magenta(`ACCESSNFT: `) + `client application connected`);  

  socket.onAny((message, ...args) => {

    if (message == 'request-access') {

      const username = args[0];
      const password = args[1];

      const userhash = getHash(username);
      const passhash = getHash(password);

      // initiate authentication process for wallet
      const restrictedCredentialCheckChild = fork(restrictedCredentialCheck);
      restrictedCredentialCheckChild.send( {userhash: userhash, passhash: passhash} );

      restrictedCredentialCheckChild.on('message', (results) => {

        if (results == 'bad-username') {

          console.log(magenta(`ACCESSNFT: `) +
            `login fail bad username for client on socket ` + cyan(`ID ${socket.id}`));
          socket.emit('bad-username');
          socket.disconnect();

        } else if (results == 'bad-password') {

          console.log(magenta(`ACCESSNFT: `) +
            `login fail bad password for client on socket ` + cyan(`ID ${socket.id}`));
          socket.emit('bad-password');
          socket.disconnect();

        } else if (results == 'access-granted') {

          console.log(magenta(`ACCESSNFT: `) +
            `login success for client on socket ` + cyan(`ID ${socket.id}`));
          socket.emit('access-granted');

          socket.on('message', (session) => {

            // RESTRICTED AREA BELOW!!!
            //
            // only the privileged few who possess a
            // universal access NFT may interact in this space
            //
            var somethingUseless = false;
            var logout = false;

            do {
              if (session == 'do-something-useless') {

                somethingUseless = true;
                console.log(magenta(`ACCESSNFT: `) +
                  `${username} on socket ` + cyan(`ID ${socket.id}` +
                  `just did something extremely useless`));
                socket.emit('did-something-useless');

              } else if (session == 'undo-something-useless') {

                somethingUseless = false;
                console.log(magenta(`ACCESSNFT: `) +
                  `${username} on socket ` + cyan(`ID ${socket.id}` +
                  `just undid something extremely useless`));
                socket.emit('undid-something-useless');
              } else if (session == 'logout') {

                console.log(magenta(`ACCESSNFT: `) +
                  `${username} on socket ` + cyan(`ID ${socket.id}` +
                  `just logged out`));
                socket.disconnect();
              }
            } while (!logout);
            //
            // RESTRICTED ACCESS AREA ABOVE!!!
          });
        }
      });
    }
  });
});

httpsServer.listen(SERVERPORT, () => {
  
  console.log(magenta(`ACCESSNFT: `) +
    color.bold(`https server running from restricted area`));  
});
