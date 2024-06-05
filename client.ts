import net from "net";
import {Update, verifyLeavesAgainstBankhash,AccountInfo} from "./utils";
import { type Schema } from "borsh";
import { PublicKey} from "@solana/web3.js";
import * as borsh from "borsh";
import bs58 from "bs58";
import { getCopyAccount, getCopyProgram } from "./program";

const DEFAULT_RPC_URL = "http://localhost:8899";
const DEFAULT_WS_URL = "ws://localhost:8900";

const DEFAULT_PK = [45,207,31,93,231,214,161,227,225,230,236,108,50,104,185,205,104,14,156,220,12,239,251,77,251,125,107,36,28,176,221,158,120,200,251,238,85,242,127,115,244,44,243,118,63,141,216,168,6,121,152,103,15,138,172,242,170,49,129,92,168,198,182,199];


const HashSchema: Schema = {
  array: {
    type: "u8",
    len: 32,
  },
};

const PublicKeySchema: Schema = {
  array: {
    type: "u8",
    len: 32,
  },
};

const AccountInfoSchema: Schema = {
  struct: {
    pubkey: PublicKeySchema,
    lamports: "u64",
    owner: PublicKeySchema,
    executable: "bool",
    rent_epoch: "u64",
    data: {
      array: {
        type: "u8",
      },
    },
    write_version: "u64",
    slot: "u64",
  },
};

const DataSchema: Schema = {
  struct: {
    pubkey: PublicKeySchema,
    hash: HashSchema,
    account: AccountInfoSchema,
  },
};

const ProofSchema: Schema = {
  struct: {
    path: {
      array: {
        type: "u64",
      },
    },
    siblings: {
      array: {
        type: {
          array: {
            type: HashSchema,
          },
        },
      },
    },
  },
};

const AccountDeltaProofSchema: Schema = {
  struct: {
    key: PublicKeySchema,
    data: DataSchema,
    proof: ProofSchema,
  },
};

const BankHashProofSchema: Schema = {
  struct: {
    proofs: {
      array: {
        type: AccountDeltaProofSchema,
      },
    },
    numSigs: "u64",
    accountDeltaRoot: HashSchema,
    parentBankhash: HashSchema,
    blockhash: HashSchema,
  },
};

const UpdateSchema: Schema = {
  struct: {
    slot: "u64",
    root: HashSchema,
    proof: BankHashProofSchema,
  },
};


export async function monitorAndVerifyUpdates<T>(
    rpcPubkey: PublicKey,
    rpcAccount: AccountInfo 
): Promise<void> {
    const client = net.connect({
      port: 5000,
      host: '127.0.0.1' 
    
    },function (){
      console.log("LOG: Client connected to spv geyser");
    });
    
    client.on('data', async function(d: any){
    let received_update: Update = borsh.deserialize(UpdateSchema, d) as any;

let bankhash = received_update.root;
    let bankhash_proof = received_update.proof;
    let slot_num = received_update.slot;
     for (const p of bankhash_proof.proofs){
       await verifyLeavesAgainstBankhash(p,bankhash,bankhash_proof.numSigs,bankhash_proof.accountDeltaRoot,bankhash_proof.parentBankhash,bankhash_proof.blockhash);
      const account_key = new PublicKey(bs58.encode(p.key)); 
       console.log(`\nBankHash proof verification succeeded for account with Pubkey: ${account_key.toBase58()} in slot ${slot_num}`)
    let copyProgram = getCopyProgram(DEFAULT_RPC_URL,new Uint8Array());
    let copyAccount = await getCopyAccount(copyProgram,Buffer.from(p.data.account.data));
     console.log("copyAccount: ",copyAccount)
    }
    });
}
