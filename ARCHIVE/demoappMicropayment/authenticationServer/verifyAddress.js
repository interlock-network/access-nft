"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER VERIFY WALLET
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// imports
var socket_io_client_1 = require("socket.io-client");
// utility functions
var utils_1 = require("./utils");
// specify color formatting
var color = require("cli-color");
var red = color.red.bold;
var green = color.green.bold;
var blue = color.blue.bold;
var cyan = color.cyan;
var yellow = color.yellow.bold;
var magenta = color.magenta;
// constants
var FALSE = '0x66616c7365';
var ISAUTHENTICATED = '0x697361757468656e74696361746564';
function verifyAddress(address, socket) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, api, contract, notAuthenticated, notAuthenticatedId, _b, gasRequired, storageDepositRequired, RESULT_collection, OUTPUT_collection, array, nft, _i, array_1, _c, gasRequired, storageDepositRequired, RESULT_authenticated, OUTPUT_authenticated, authenticated, hash, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 10, , 11]);
                    console.log(green("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        "authenticating address");
                    console.log(green("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        magenta("".concat(address, "\n")));
                    return [4 /*yield*/, (0, utils_1.setupSession)('verifyAddress')];
                case 1:
                    _a = _d.sent(), api = _a[0], contract = _a[1];
                    notAuthenticated = false;
                    notAuthenticatedId = void 0;
                    // log that checking if available uanft exists or uanft owes micropayment already
                    console.log(yellow("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        magenta("".concat(address)));
                    console.log(yellow("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        "owes micropayment?");
                    console.log(yellow("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        "has valid nft?\n");
                    return [4 /*yield*/, (0, utils_1.contractGetter)(api, socket, contract, 'verifyAddress', 'getCollection', address)];
                case 2:
                    _b = _d.sent(), gasRequired = _b[0], storageDepositRequired = _b[1], RESULT_collection = _b[2], OUTPUT_collection = _b[3];
                    array = Array.from(OUTPUT_collection.ok.ok);
                    nft = void 0;
                    _i = 0, array_1 = array;
                    _d.label = 3;
                case 3:
                    if (!(_i < array_1.length)) return [3 /*break*/, 6];
                    nft = array_1[_i];
                    return [4 /*yield*/, (0, utils_1.contractGetter)(api, socket, contract, 'verifyAddress', 'psp34Metadata::getAttribute', { u64: nft.u64 }, ISAUTHENTICATED)];
                case 4:
                    _c = _d.sent(), gasRequired = _c[0], storageDepositRequired = _c[1], RESULT_authenticated = _c[2], OUTPUT_authenticated = _c[3];
                    authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));
                    // record nft id of one that has not yet been authenticated
                    if (authenticated.ok == FALSE) {
                        notAuthenticated = true;
                        notAuthenticatedId = nft.u64;
                    }
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (!(notAuthenticated == false)) return [3 /*break*/, 7];
                    console.log(red("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        magenta("".concat(address)));
                    console.log(red("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        "needs nonauthenticated nft\n");
                    (0, utils_1.terminateProcess)(socket, 'verifyAddress', 'all-nfts-authenticated', []);
                    return [3 /*break*/, 9];
                case 7:
                    if (!(notAuthenticated == true)) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, utils_1.sendMicropayment)(api, address, notAuthenticatedId)];
                case 8:
                    hash = _d.sent();
                    (0, utils_1.terminateProcess)(socket, 'verifyAddress', 'waiting', [hash, notAuthenticatedId, address]);
                    _d.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _d.sent();
                    console.log(red("UA-NFT") + color.bold("|AUTH-SERVER: ") + error_1);
                    (0, utils_1.terminateProcess)(socket, 'verifyAddress', 'program-error', []);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// entrypoint
process.on('message', function (address) {
    // setup socket connection with serverMainscript
    var socket = (0, socket_io_client_1.io)('http://localhost:3000');
    socket.on('connect', function () {
        console.log(blue("UA-NFT") + color.bold("|AUTH-SERVER: ") +
            "verifyAddr connect, SID " + cyan("".concat(socket.id)));
        verifyAddress(address, socket)["catch"](function (error) {
            console.error(error);
            process.exit(-1);
        });
    });
});
