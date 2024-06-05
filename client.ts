import net from "net";
import {Proof,Hash,PubkeyBytes,Update,BankHashProof,AccountDeltaProof, verifyLeavesAgainstBankhash} from "./utils";
import { type Schema, serialize, deserialize } from "borsh";
import { PublicKey} from "@solana/web3.js";
import * as borsh from "borsh";
import bs58 from "bs58";

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
    // rpcPubkey: PublicKey,
    // rpcAccount: AccountInfo<T>
): Promise<void> {
    const client = net.connect({
      port: 5000,
      host: '127.0.0.1' 
    
      // keepAlive: true,
    },function (){
      console.log("connected to geyser");
    });
    
    client.on('data', function(d: any){
    // console.log(JSON.stringify(new Uint8Array(d), null, 4)); 
    let received_update: Update = borsh.deserialize(UpdateSchema, d) as any;
    // console.dir(data, { depth: 6 });

let bankhash = received_update.root;
    let bankhash_proof = received_update.proof;
    let slot_num = received_update.slot;
     for (const p of bankhash_proof.proofs){
       // console.log(`DEBUG: p: ${p.dataProof}`);
       verifyLeavesAgainstBankhash(p,bankhash,bankhash_proof.numSigs,bankhash_proof.accountDeltaRoot,bankhash_proof.parentBankhash,bankhash_proof.blockhash);
      const account_key = new PublicKey(bs58.encode(p.key)); 
       console.log(`\nBankHash proof verification succeeded for account with Pubkey: ${account_key.toBase58()} in slot ${slot_num}`)
    }
      // console.log("Data: ",new Uint8Array(d));
      // const update: Update = deserialize(schema,Update as any,d);
    });
}
