import { IABIMethod, ILogItem } from "./ethjs-abi";
export declare function encodeInputs(method: IABIMethod, args?: any[]): string;
export declare function decodeOutputs(method: IABIMethod, outputData: string): any[];
/**
 * A decoded Solidity event log
 */
export interface IDecodedSolidityEvent {
    /**
     * The event's name
     */
    type: string;
    /**
     * Event parameters as a key-value map
     */
    [key: string]: any;
}
export declare class ContractLogDecoder {
    abi: IABIMethod[];
    private _decoder;
    constructor(abi: IABIMethod[]);
    decode(rawlog: ILogItem): IDecodedSolidityEvent | null;
}
