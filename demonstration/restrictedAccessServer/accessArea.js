"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - RESTRICTED ACCESS AREA
//
exports.__esModule = true;
// imports
var child_process_1 = require("child_process");
var https_1 = require("https");
var fs_1 = require("fs");
var socket_io_1 = require("socket.io");
var express = require("express");
var figlet = require("figlet");
var crypto = require("crypto");
// child process paths
var path = require("path");
var restrictedGetCredential = path.resolve('getCredential.js');
// specify color formatting
var color = require("cli-color");
var red = color.red.bold;
var green = color.green.bold;
var blue = color.blue.bold;
var cyan = color.cyan;
var magenta = color.magenta.bold;
// constants
var SERVERPORT = 8443;
// setup https server
var app = express();
var options = {
    key: (0, fs_1.readFileSync)('./server-credentials/key.pem'),
    cert: (0, fs_1.readFileSync)('./server-credentials/cert.pem')
};
var httpsServer = (0, https_1.createServer)(options, app);
var io = new socket_io_1.Server(httpsServer);
// state variable only accessible to those inside restricted access area
var somethingUseful;
// on secure https client connection to restricted access server
io.on('connect', function (socket) {
    // log connection
    console.log(blue("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
        "client connected, SID " + cyan("".concat(socket.id, "\n")));
    // any time a client application connects to enter the restricted access area
    socket.onAny(function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // the only action a connecting server can perform...
        // ...tack on elses for additional functionality
        if (message == 'request-access') {
            // deal with cleartext credentials
            var username_1 = args[0];
            var password = args[1];
            // get SHA256 hashes
            var userhash = getHash(username_1);
            var passhash = getHash(password);
            // free and force cleanup sensitive info from working memory
            // by forcing garbage collection on dereferenced value because
            // who knows when js will do it
            password = 0;
            global.gc();
            // fetch the passhash corresponding to userhash from blockchain
            // by spawing getCredential
            var restrictedGetCredentialChild = (0, child_process_1.fork)(restrictedGetCredential);
            restrictedGetCredentialChild.send({ userhash: userhash, passhash: passhash });
            // wait for results from getCredential
            restrictedGetCredentialChild.on('message', function (results) {
                // userhash does not exist
                if (results == 'bad-username') {
                    // log and sever connection
                    console.log(red("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                        "login fail bad username for client");
                    console.log(red("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                        "on socket " + cyan("ID ".concat(socket.id, "\n")));
                    socket.emit('bad-username');
                    socket.disconnect();
                    // userhash exists but the passhash is a mismatch
                }
                else if (results == 'bad-password') {
                    // log and sever connection
                    console.log(red("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                        "login fail bad password for client");
                    console.log(red("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                        "on socket " + cyan("ID ".concat(socket.id, "\n")));
                    socket.emit('bad-password');
                    socket.disconnect();
                    // userhash and passhash are a match
                }
                else if (results == 'access-granted') {
                    // log and wait for restricted access area request
                    console.log(green("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                        "login success for client");
                    console.log(green("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                        "on socket " + cyan("ID ".concat(socket.id, "\n")));
                    socket.emit('access-granted');
                    // any further messages are client requests to restricted area server
                    socket.onAny(function (session) {
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
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                cyan("".concat(username_1)) + " on socket " + cyan("ID ".concat(socket.id)));
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                "just did something extremely useful");
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                color.bold("somethingUseful = ") + green("".concat(somethingUseful, "\n")));
                            // notify client that it's official...they did something super useful
                            socket.emit('did-something-useful', somethingUseful);
                            // another cheeky functionality
                        }
                        else if (session == 'do-something-useless') {
                            // user just changed state in the restricted access area
                            somethingUseful = false;
                            // log that client did something super useless
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                cyan("".concat(username_1)) + " on socket " + cyan("ID ".concat(socket.id)));
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                "just did something extremely useless");
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                color.bold("somethingUseful = ") + red("".concat(somethingUseful, "\n")));
                            // notify client that it's official...they did something super useless
                            socket.emit('did-something-useless', somethingUseful);
                            // serve the client some cool welcome graphics
                        }
                        else if (session == 'fetch-art') {
                            // log that welcome graphics were served
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                cyan("".concat(username_1)) + " on socket " + cyan("ID ".concat(socket.id)));
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                "just fetched ascii art\n");
                            // generate ascii art for welcoming with figlet package
                            figlet("WELCOME TO\nRESTRICTED\n\n\nAREA...\n\n\n\n\n\n" +
                                "...YOU'RE VERY\nIMPORTANT!!!  :)", function (err, data) {
                                if (err) {
                                    console.log('Something went wrong...');
                                    console.dir(err);
                                    return;
                                }
                                socket.emit('ascii-art', data);
                            });
                            // sever connection on logout request
                        }
                        else if (session == 'logout') {
                            // log and disconnect
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                cyan("".concat(username_1)) + " on socket " + cyan("ID ".concat(socket.id)));
                            console.log(magenta("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
                                "just logged out\n");
                            socket.disconnect();
                        }
                        // free and force cleanup sensitive info
                        socket.on('disconnect', function () {
                            // force garbage collection because who knows when js will do it
                            username_1 = 0;
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
httpsServer.listen(SERVERPORT, function () {
    console.log(blue("\nUA-NFT") + color.bold("|RESTRICTED-AREA: ") +
        color.bold("secure https server running from restricted"));
    console.log(blue("UA-NFT") + color.bold("|RESTRICTED-AREA: ") +
        color.bold("area, ready for connecting applications\n"));
});
//
// calculate SHA256 hash
//
function getHash(input) {
    var digest = crypto
        .createHash('sha256')
        .update(input !== null && input !== void 0 ? input : '')
        .digest('hex');
    return digest;
}
