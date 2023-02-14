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

  console.log(blue(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
    `client application connected`);  

  socket.onAny((message, ...args) => {

    if (message == 'request-access') {

      // deal with cleartext credentials
      let username = args[0];
      let password = args[1];

      // get SHA256 hashes
      const userhash = getHash(username);
      const passhash = getHash(password);

      // free and force cleanup sensitive info
      password = 0;
      global.gc();
    
      // fetch the passhash corresponding to userhash from blockchain
      const restrictedCredentialCheckChild = fork(restrictedCredentialCheck);
      restrictedCredentialCheckChild.send( {userhash: userhash, passhash: passhash} );

      restrictedCredentialCheckChild.on('message', (results) => {

        if (results == 'bad-username') {

          console.log(red(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
            `login fail bad username for client on socket ` + cyan(`ID ${socket.id}`));
          socket.emit('bad-username');
          socket.disconnect();

        } else if (results == 'bad-password') {

          console.log(red(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
            `login fail bad password for client on socket ` + cyan(`ID ${socket.id}`));
          socket.emit('bad-password');
          socket.disconnect();

        } else if (results == 'not-authenticated') {

          console.log(red(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
            `login fail NFT not authenticated` + cyan(`ID ${socket.id}`));
          socket.emit('not-authenticated');
          socket.disconnect();

        } else if (results == 'access-granted') {

          console.log(green(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
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

              console.log(magenta(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
                cyan(`${username}`) + ` on socket ` + cyan(`ID ${socket.id}`) +
                ` just did something extremely useful`);
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
                color.bold(`somethingUseful = `) + green(`${somethingUseful}`));

              socket.emit('did-something-useful', somethingUseful);

            // another cheeky functionality
            } else if (session == 'do-something-useless') {

              somethingUseful = false;

              console.log(magenta(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
                cyan(`${username}`) + ` on socket ` + cyan(`ID ${socket.id}`) +
                ` just did something extremely useless`);
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
                color.bold(`somethingUseful = `) + red(`${somethingUseful}`));

              socket.emit('did-something-useless', somethingUseful);

            // serve the client some cool graphics
            } else if (session == 'fetch-art') {

              console.log(magenta(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
                cyan(`${username}`) + ` on socket ` + cyan(`ID ${socket.id}`) +
                ` just fetched ascii art`);

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

              console.log(magenta(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
                cyan(`${username}`) + ` on socket ` + cyan(`ID ${socket.id}`) +
                ` just logged out`);
              socket.disconnect();
            }

            // free and force cleanup sensitive info
            socket.on('disconnect', () => {
              
              username = 0;
              global.gc();
            });
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
  
  console.log(blue(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA-SERVER: `) +
    color.bold(`secure https server running from restricted area, ready for connecting applications`));  
});
