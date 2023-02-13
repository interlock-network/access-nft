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
import * as figlet from 'figlet';

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

var somethingUseful;

// setup server
const app = express();
const options = {  
  key: readFileSync('./server-creds/key.pem'),
  cert: readFileSync('./server-creds/cert.pem')
};
const httpsServer = createServer(options, app);
const io = new Server(httpsServer);

io.on('connect', (socket) => {

  console.log(magenta(`ACCESSNFT: `) + `client application connected`);  

  socket.onAny((message, ...args) => {

    if (message == 'request-access') {

      // deal with cleartext credentials
      let username = args[0];
      let password = args[1];

      // get SHA256 hashes
      const userhash = getHash(username);
      const passhash = getHash(password);

      // free and cleanup sensitive info
      username = 0;
      password = 0;
      global.gc();
    
      // fetch the passhash corresponding to userhash from blockchain
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

          // any further messages are client requests to restricted area server
          socket.onAny((session) => {

            // RESTRICTED AREA BELOW!!!
            //
            // only the privileged few who possess a
            // universal access NFT may interact in this space
            //
            // This space (its functionality) will vary according to the given
            // universal access nft application
            //
            var somethingUseful = false;

              // a cheeky functionality
              if (session == 'do-something-useful') {

                somethingUseful = true;
                console.log(magenta(`ACCESSNFT: `) +
                  `${username} on socket ` + cyan(`ID ${socket.id}`) +
                  `just did something extremely useful`);
                socket.emit('did-something-useful', somethingUseful);

              // another cheeky functionality
              } else if (session == 'do-something-useless') {

                somethingUseful = false;
                console.log(magenta(`ACCESSNFT: `) +
                  `${username} on socket ` + cyan(`ID ${socket.id}`) +
                  `just did something extremely useless`);
                socket.emit('did-something-useless', somethingUseful);

              // serve the client some cool graphics
              } else if (session == 'fetch-art') {

                console.log(magenta(`ACCESSNFT: `) +
                  `${username} on socket ` + cyan(`ID ${socket.id}`) +
                  `just fetched ascii art`);

                // generate ascii art
                figlet('(:  RESTRICTED AREA  :)\n\n\n\n\n\n         ...YOU ROCK!!!', function(err, data) {
                  
                  if (err) {
                    console.log('Something went wrong...');
                     console.dir(err);
                    return;
                  }
                  socket.emit('ascii-art', data);
                });

              } else if (session == 'logout') {

                console.log(magenta(`ACCESSNFT: `) +
                  `${username} on socket ` + cyan(`ID ${socket.id}`) +
                  `just logged out`);
                socket.disconnect();
              }
            //
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
