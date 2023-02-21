//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - RESTRICTED ACCESS AREA
//

// imports
import { fork } from 'child_process';
import { createServer } from "https";
import { readFileSync } from "fs";
import { Server } from "socket.io";
import * as express from 'express';
import * as figlet from 'figlet';
import * as crypto from 'crypto';

// child process paths
import * as path from 'path';
const restrictedGetCredential = path.resolve('getCredential.js');

// specify color formatting
import * as color from 'cli-color';
const red = color.red.bold;
const green = color.green.bold;
const blue = color.blue.bold;
const cyan = color.cyan;
const magenta = color.magenta.bold;

// constants
const SERVERPORT = 8443;

// setup https server
const app = express();
const options = {  
  key: readFileSync('./server-credentials/key.pem'),
  cert: readFileSync('./server-credentials/cert.pem')
};
const httpsServer = createServer(options, app);
const io = new Server(httpsServer);

// state variable only accessible to those inside restricted access area
var somethingUseful: boolean;

// on secure https client connection to restricted access server
io.on('connect', (socket) => {

  // log connection
  console.log(blue(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
    `client connected, SID ` + cyan(`${socket.id}\n`));  

  // any time a client application connects to enter the restricted access area
  socket.onAny((message, ...args) => {

    // the only action a connecting server can perform...
    // ...tack on elses for additional functionality
    if (message == 'request-access') {

      // deal with cleartext credentials
      let username = args[0];
      let password = args[1];

      // get SHA256 hashes
      const userhash = getHash(username);
      const passhash = getHash(password);

      // free and force cleanup sensitive info from working memory
      // by forcing garbage collection on dereferenced value because
      // who knows when js will do it
      password = 0;
      global.gc();
    
      // fetch the passhash corresponding to userhash from blockchain
      // by spawing getCredential
      const restrictedGetCredentialChild = fork(restrictedGetCredential);
      restrictedGetCredentialChild.send( {userhash: userhash, passhash: passhash} );

      // wait for results from getCredential
      restrictedGetCredentialChild.on('message', (results) => {

        // userhash does not exist
        if (results == 'bad-username') {

          // log and sever connection
          console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
            `login fail bad username for client`);
          console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
            `on socket ` + cyan(`ID ${socket.id}\n`));
          socket.emit('bad-username');
          socket.disconnect();

        // userhash exists but the passhash is a mismatch
        } else if (results == 'bad-password') {

          // log and sever connection
          console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
            `login fail bad password for client`);
          console.log(red(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
            `on socket ` + cyan(`ID ${socket.id}\n`));
          socket.emit('bad-password');
          socket.disconnect();

        // userhash and passhash are a match
        } else if (results == 'access-granted') {

          // log and wait for restricted access area request
          console.log(green(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
            `login success for client`);
          console.log(green(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
            `on socket ` + cyan(`ID ${socket.id}\n`));
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

              // user just changed state in the restricted access area
              somethingUseful = true;

              // log that client did something super useful
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                cyan(`${username}`) + ` on socket ` + cyan(`ID ${socket.id}`));
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                `just did something extremely useful`);
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                color.bold(`somethingUseful = `) + green(`${somethingUseful}\n`));

              // notify client that it's official...they did something super useful
              socket.emit('did-something-useful', somethingUseful);

            // another cheeky functionality
            } else if (session == 'do-something-useless') {

              // user just changed state in the restricted access area
              somethingUseful = false;

              // log that client did something super useless
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                cyan(`${username}`) + ` on socket ` + cyan(`ID ${socket.id}`));
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                `just did something extremely useless`);
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                color.bold(`somethingUseful = `) + red(`${somethingUseful}\n`));

              // notify client that it's official...they did something super useless
              socket.emit('did-something-useless', somethingUseful);

            // serve the client some cool welcome graphics
            } else if (session == 'fetch-art') {

              // log that welcome graphics were served
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                cyan(`${username}`) + ` on socket ` + cyan(`ID ${socket.id}`));
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                `just fetched ascii art\n`);

              // generate ascii art for welcoming with figlet package
              figlet(`WELCOME TO\nRESTRICTED\n\n\nAREA...\n\n\n\n\n\n` +
                 `...YOU'RE VERY\nIMPORTANT!!!  :)`, function(err, data) {
                  
                if (err) {
                  console.log('Something went wrong...');
                  console.dir(err);
                  return;
                }
                socket.emit('ascii-art', data);
              });

            // sever connection on logout request
            } else if (session == 'logout') {

              // log and disconnect
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                cyan(`${username}`) + ` on socket ` + cyan(`ID ${socket.id}`));
              console.log(magenta(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
                `just logged out\n`);
              socket.disconnect();
            }

            // free and force cleanup sensitive info
            socket.on('disconnect', () => {
              
              // force garbage collection because who knows when js will do it
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

// listen for connections on SSL port
httpsServer.listen(SERVERPORT, () => {
  
  console.log(blue(`\nUA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
    color.bold(`secure https server running from restricted`));  
  console.log(blue(`UA-NFT`) + color.bold(`|RESTRICTED-AREA: `) +
    color.bold(`area, ready for connecting applications\n`));  
});

//
// calculate SHA256 hash
//
function getHash(input) {

  const digest = crypto
    .createHash('sha256')
    .update(input ?? '')
    .digest('hex');

  return digest
}

