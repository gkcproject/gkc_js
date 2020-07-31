import { IRPCGetTransactionReceiptResult, IRPCGetTransactionResult, GkcRPC } from "./GkcRPC";
export declare type TxReceiptConfirmationHandler = (tx: IRPCGetTransactionResult, receipt: IRPCGetTransactionReceiptResult) => any;
export interface ITxReceiptConfirmOptions {
    pollInterval?: number;
}
export declare class TxReceiptPromise {
    private _rpc;
    txid: string;
    private _emitter;
    constructor(_rpc: GkcRPC, txid: string);
    confirm(confirm?: number, opts?: ITxReceiptConfirmOptions): Promise<IRPCGetTransactionReceiptResult>;
    onConfirm(fn: TxReceiptConfirmationHandler): void;
    offConfirm(fn: TxReceiptConfirmationHandler): void;
}
