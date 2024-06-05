// import {
//     CallOptions,
//     ChannelCredentials,
//     Client,
//     ClientDuplexStream,
//     ClientOptions,
//     ClientUnaryCall,
//     handleBidiStreamingCall,
//     handleUnaryCall,
//     makeGenericClientConstructor,
//     Metadata,
//     ServiceError,
//     UntypedServiceImplementation,
//   } from "@grpc/grpc-js";
// import { AccountInfo, PublicKey } from "@solana/web3.js";
import net from "net";
import {Proof,Hash,Pubkey,Update,BankHashProof,AccountDeltaProof} from "./utils";
import { type Schema, serialize, deserialize } from 'borsh';
import BN from 'bn.js';

import * as borsh from "borsh";

// export interface TinydancerProofClient extends Client {
//     
// }


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
      console.log(`\nBankHash proof verification succeeded for account with Pubkey: ${p.key} in slot ${slot_num}`)
    }
      // console.log("Data: ",new Uint8Array(d));
      // const update: Update = deserialize(schema,Update as any,d);
    });
}
