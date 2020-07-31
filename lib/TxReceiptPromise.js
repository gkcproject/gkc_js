"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = require("eventemitter3");
const sleep_1 = require("./sleep");
const EVENT_CONFIRM = "confirm";
class TxReceiptPromise {
    constructor(_rpc, txid) {
        this._rpc = _rpc;
        this.txid = txid;
        this._emitter = new eventemitter3_1.EventEmitter();
    }
    // TODO should return parsed logs with the receipt
    async confirm(confirm = 6, opts = {}) {
        const minconf = confirm;
        const pollInterval = opts.pollInterval || 3000;
        const hasTxWaitSupport = await this._rpc.checkTransactionWaitSupport();
        // if hasTxWaitSupport, make one long-poll per confirmation
        let curConfirmation = 1;
        // if !hasTxWaitSupport, poll every interval until tx.confirmations increased
        let lastConfirmation = 0;
        while (true) {
            const req = { txid: this.txid };
            if (hasTxWaitSupport) {
                req.waitconf = curConfirmation;
            }
            const tx = await this._rpc.getTransaction(req);
            if (tx.confirmations > 0) {
                const receipt = await this._rpc.getTransactionReceipt({ txid: tx.txid });
                if (!receipt) {
                    throw new Error("Cannot get transaction receipt");
                }
                // TODO augment receipt2 with parsed logs
                const receipt2 = receipt;
                // const ctx = new ConfirmedTransaction(this.contract.info.abi, tx, receipt)
                if (tx.confirmations > lastConfirmation) {
                    // confirmation increased since last check
                    curConfirmation = tx.confirmations;
                    this._emitter.emit(EVENT_CONFIRM, tx, receipt2);
                    // TODO emit update event
                    // txUpdated(ctx)
                }
                if (tx.confirmations >= minconf) {
                    // reached number of required confirmations. done
                    return receipt2;
                }
            }
            lastConfirmation = tx.confirmations;
            if (hasTxWaitSupport) {
                // long-poll for one additional confirmation
                curConfirmation++;
            }
            else {
                await sleep_1.sleep(pollInterval + Math.random() * 200);
            }
        }
    }
    onConfirm(fn) {
        this._emitter.on(EVENT_CONFIRM, fn);
    }
    offConfirm(fn) {
        this._emitter.off(EVENT_CONFIRM, fn);
    }
}
exports.TxReceiptPromise = TxReceiptPromise;
