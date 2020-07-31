"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Contract_1 = require("./Contract");
const abi_1 = require("./abi");
/**
 * ContractsRepo contains the ABI definitions of all known contracts
 */
class ContractsRepo {
    constructor(rpc, repoData) {
        this.rpc = rpc;
        this.repoData = repoData;
        const eventABIs = this.allEventABIs();
        this.logDecoder = new abi_1.ContractLogDecoder(eventABIs);
    }
    contract(name) {
        const info = this.repoData.contracts[name];
        if (!info) {
            throw new Error(`cannot find contract: ${name}`);
        }
        // Instantiate the contract with a log decoder that can handle all known events
        return new Contract_1.Contract(this.rpc, info, { logDecoder: this.logDecoder });
    }
    /**
     *  Combine all known event ABIs into one single array
     */
    allEventABIs() {
        const allEventABIs = [];
        const { contracts, libraries, related, } = this.repoData;
        if (contracts) {
            mergeDefs(contracts);
        }
        if (libraries) {
            mergeDefs(libraries);
        }
        if (related) {
            mergeDefs(related);
        }
        return allEventABIs;
        // inner utility function for allEventABIs
        function mergeDefs(abiDefs) {
            for (const key of Object.keys(abiDefs)) {
                const defs = abiDefs[key].abi;
                for (const def of defs) {
                    if (def.type === "event") {
                        allEventABIs.push(def);
                    }
                }
            }
        }
    }
}
exports.ContractsRepo = ContractsRepo;
