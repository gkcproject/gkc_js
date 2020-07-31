"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Browser polyfill required by ethjs-abi
// https://github.com/ethjs/ethjs-abi/blob/5e2d4c3b7207111c143ca30d01d743c28cfb52f6/src/utils/index.js#L28
if (typeof Buffer === "undefined") {
    const { Buffer } = require("buffer");
    Object.assign(window, {
        Buffer,
    });
}
__export(require("./abi"));
__export(require("./Contract"));
__export(require("./GkcRPC"));
__export(require("./Gkc"));
__export(require("./TxReceiptPromise"));
