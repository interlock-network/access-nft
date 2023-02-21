"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER SET AUTHENTICATED
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
var ISAUTHENTICATED = '0x697361757468656e74696361746564';
var FALSE = '0x66616c7365';
// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
var refTimeLimit = 6050000000;
var proofSizeLimit = 150000;
var storageDepositLimit = null;
function setAuthenticated(wallet, socket) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, api, contract, notAuthenticatedId, _b, gasRequired, storageDeposit, RESULT_collection, OUTPUT_collection, collection, array, nft, _i, array_1, _c, gasRequired, storageDeposit, RESULT_authenticated, OUTPUT_authenticated, authenticated, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, utils_1.setupSession)('setAuthenticated')];
                case 1:
                    _a = _d.sent(), api = _a[0], contract = _a[1];
                    return [4 /*yield*/, (0, utils_1.contractGetter)(api, socket, contract, 'setAuthenticated', 'getCollection', wallet)];
                case 2:
                    _b = _d.sent(), gasRequired = _b[0], storageDeposit = _b[1], RESULT_collection = _b[2], OUTPUT_collection = _b[3];
                    collection = JSON.parse(JSON.stringify(OUTPUT_collection));
                    array = Array.from(collection.ok.ok);
                    nft = void 0;
                    _i = 0, array_1 = array;
                    _d.label = 3;
                case 3:
                    if (!(_i < array_1.length)) return [3 /*break*/, 6];
                    nft = array_1[_i];
                    return [4 /*yield*/, (0, utils_1.contractGetter)(api, socket, contract, 'setAuthenticated', 'psp34Metadata::getAttribute', { u64: nft.u64 }, ISAUTHENTICATED)];
                case 4:
                    _c = _d.sent(), gasRequired = _c[0], storageDeposit = _c[1], RESULT_authenticated = _c[2], OUTPUT_authenticated = _c[3];
                    authenticated = JSON.parse(JSON.stringify(OUTPUT_authenticated));
                    // record nft id of one that is waiting and ready to authenticate
                    if (authenticated.ok == FALSE) {
                        notAuthenticatedId = nft.u64;
                    }
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: 
                // call setAuthenticated transaction
                return [4 /*yield*/, (0, utils_1.contractDoer)(api, socket, contract, storageDepositLimit, refTimeLimit, proofSizeLimit, 'setAuthenticated', 'setAuthenticated', { u64: notAuthenticatedId })];
                case 7:
                    // call setAuthenticated transaction
                    _d.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _d.sent();
                    console.log(red("UA-NFT") + color.bold("|AUTH-SERVER: ") + error_1);
                    (0, utils_1.discoSocket)(socket, 'setCredential');
                    process.send('program-error');
                    process.exit();
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
process.on('message', function (wallet) {
    // setup socket connection with autheticateWallet script
    var socket = (0, socket_io_client_1.io)('http://localhost:3000');
    socket.on('connect', function () {
        console.log(blue("UA-NFT") + color.bold("|AUTH-SERVER: ") +
            "setAuth connect, SID " + cyan("".concat(socket.id)));
        setAuthenticated(wallet, socket)["catch"](function (error) {
            console.error(error);
            process.exit(-1);
        });
    });
});
