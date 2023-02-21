"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - SERVER SET CREDENTIAL
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
var magenta = color.magenta;
// constants
//
// null === no limit
// refTime and proofSize determined by contracts-ui estimation plus fudge-factor
var refTimeLimit = 6050000000;
var proofSizeLimit = 150000;
var storageDepositLimit = null;
function setCredential(socket, message) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, api, contract, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, utils_1.setupSession)('setCredential')];
                case 1:
                    _a = _b.sent(), api = _a[0], contract = _a[1];
                    console.log(green("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        "setting credentials for NFT " + red("ID ".concat(message.id)));
                    console.log(green("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        "owned by address");
                    console.log(green("UA-NFT") + color.bold("|AUTH-SERVER: ") +
                        magenta("".concat(message.address, "\n")));
                    // call setCredential tx
                    return [4 /*yield*/, (0, utils_1.contractDoer)(api, socket, contract, storageDepositLimit, refTimeLimit, proofSizeLimit, 'setCredential', 'setCredential', { u64: message.id }, '0x' + message.userhash, '0x' + message.passhash)];
                case 2:
                    // call setCredential tx
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.log(red("UA-NFT") + color.bold("|AUTH-SERVER: ") + error_1);
                    (0, utils_1.discoSocket)(socket, 'setCredential');
                    process.send('setCredential-process-error');
                    process.exit();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
process.on('message', function (message) {
    // setup socket connection with autheticateWallet script
    var socket = (0, socket_io_client_1.io)('http://localhost:3000');
    socket.on('connect', function () {
        console.log(blue("UA-NFT") + color.bold("|AUTH-SERVER: ") +
            "setCred connect, SID " + cyan("".concat(socket.id)));
        setCredential(socket, message)["catch"](function (error) {
            console.error(error);
            process.exit(-1);
        });
    });
});
