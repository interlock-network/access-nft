"use strict";
//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT MAIN
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
// child process paths
var path = require("path");
var menu = path.resolve('main.js');
var addWallet = path.resolve('addWallet.js');
var deleteWallet = path.resolve('deleteWallet.js');
var mint = path.resolve('mint.js');
var authenticate = path.resolve('authenticate.js');
var display = path.resolve('display.js');
var login = path.resolve('login.js');
// imports
var child_process_1 = require("child_process");
var prompts = require("prompts");
// specify color formatting
var color = require("cli-color");
var red = color.red.bold;
var green = color.green.bold;
var blue = color.blue.bold;
var cyan = color.cyan;
var yellow = color.yellow.bold;
var magenta = color.magenta;
var bold = color.bold;
// start menu options
var options = [
    { title: bold('add wallet or use default for signing tx\n'), value: 'add' },
    { title: bold('mint new universal access NFT\n'), value: 'mint' },
    { title: bold('register or reset universal access NFT credentials\n'), value: 'authenticate' },
    { title: bold('display universal access NFT collection\n'), value: 'display' },
    { title: bold('login to restricted access area\n'), value: 'login' },
    { title: bold('delete wallet information\n'), value: 'delete' },
    { title: bold('quit application\n'), value: 'quit' }
];
function mainMenu() {
    return __awaiter(this, void 0, void 0, function () {
        var response, addWalletChild, mintChild, authenticateChild, displayChild, loginChild, deleteWalletChild, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, prompts([
                            {
                                type: 'select',
                                name: 'choice',
                                message: blue(' UNIVERSAL ACCESS NFT DEMO APP ~ PLEASE CHOOSE AN ACTION!\n'),
                                choices: options
                            }
                        ])];
                case 1:
                    response = _a.sent();
                    switch (response.choice) {
                        case 'add':
                            addWalletChild = (0, child_process_1.fork)(addWallet);
                            addWalletChild.on('message', function () {
                                var menuChild = (0, child_process_1.fork)(menu);
                            });
                            break;
                        case 'mint':
                            mintChild = (0, child_process_1.fork)(mint);
                            mintChild.on('message', function () {
                                var menuChild = (0, child_process_1.fork)(menu);
                            });
                            break;
                        case 'authenticate':
                            authenticateChild = (0, child_process_1.fork)(authenticate);
                            authenticateChild.on('message', function () {
                                var menuChild = (0, child_process_1.fork)(menu);
                            });
                            break;
                        case 'display':
                            displayChild = (0, child_process_1.fork)(display);
                            displayChild.on('message', function () {
                                var menuChild = (0, child_process_1.fork)(menu);
                            });
                            break;
                        case 'login':
                            loginChild = (0, child_process_1.fork)(login);
                            loginChild.on('message', function () {
                                var menuChild = (0, child_process_1.fork)(menu);
                            });
                            break;
                        case 'delete':
                            deleteWalletChild = (0, child_process_1.fork)(deleteWallet);
                            deleteWalletChild.on('message', function () {
                                var menuChild = (0, child_process_1.fork)(menu);
                            });
                            break;
                        case 'quit':
                            console.clear();
                            console.log(red("\n\n GOODBYE!!!\n\n"));
                            setTimeout(function () {
                                console.clear();
                                process.exit();
                            }, 2500);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
console.clear();
console.log(blue("\n Welcome to the Universal Access NFT demo app!\n"));
console.log(red(" The value of this tech is as a blockchain-based secret/access"));
console.log(red(" management system using NFTs and crypto hashing to establish"));
console.log(red(" access permissions/credentials highly resistant to compromise.\n"));
console.log(yellow(". NFT provides owner right to register one set of access credentials."));
console.log(yellow(". All credential info is kept secret, anonymized on blockchain.."));
console.log(yellow(". Never are access credentials stored in database."));
console.log(yellow(". Anonymized credentials stored on blockchain as SHA256 hash digests."));
console.log(yellow(". Architecture lends itself to future zero-knowledge proof scheme.\n"));
console.log(bold.magenta(" This is a proof of concept containing all the key pieces."));
console.log(bold.magenta(" Production implementations will vary. Implementation may be"));
console.log(bold.magenta(" configured for basic username/password, or 2FA token issue.\n"));
mainMenu();
