import { IContractInfo, Contract } from "./Contract";
import { IABIMethod } from "./ethjs-abi";
import { GkcRPC } from "./GkcRPC";
import { ContractLogDecoder } from "./abi";
export interface IABIDefs {
    [key: string]: {
        abi: IABIMethod[];
    };
}
/**
 * Information about contracts
 */
export interface IContractsRepoData {
    /**
     * Information about deployed contracts
     */
    contracts: {
        [key: string]: IContractInfo;
    };
    /**
     * Information about deployed libraries
     */
    libraries: {
        [key: string]: IContractInfo;
    };
    /**
     * Information of contracts referenced by deployed contract/libraries, but not deployed
     */
    related: {
        [key: string]: {
            abi: IABIMethod[];
        };
    };
}
/**
 * ContractsRepo contains the ABI definitions of all known contracts
 */
export declare class ContractsRepo {
    private rpc;
    private repoData;
    /**
     * A logDecoder that knows about events defined in all known contracts.
     */
    logDecoder: ContractLogDecoder;
    constructor(rpc: GkcRPC, repoData: IContractsRepoData);
    contract(name: string): Contract;
    /**
     *  Combine all known event ABIs into one single array
     */
    private allEventABIs;
}
