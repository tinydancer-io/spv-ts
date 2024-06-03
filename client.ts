import {
    CallOptions,
    ChannelCredentials,
    Client,
    ClientDuplexStream,
    ClientOptions,
    ClientUnaryCall,
    handleBidiStreamingCall,
    handleUnaryCall,
    makeGenericClientConstructor,
    Metadata,
    ServiceError,
    UntypedServiceImplementation,
  } from "@grpc/grpc-js";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import net from "net";

import { Schema, serialize, deserialize } from 'borsh';
import BN from 'bn.js';

export interface TinydancerProofClient extends Client {
    
}
// Define a class for each struct

class Pubkey {
    constructor(properties: { key: Uint8Array }) {
        Object.assign(this, properties);
    }
}

class Data {
    constructor(properties: { data: Uint8Array }) {
        Object.assign(this, properties);
    }
}

class Proof {
    constructor(properties: { proof: Uint8Array }) {
        Object.assign(this, properties);
    }
}

class AccountDeltaProof {
    constructor(properties: { pubkey: Pubkey, dataProof: [Data, Proof] }) {
        Object.assign(this, properties);
    }
}

class BankHashProof {
    constructor(properties: { proofs: AccountDeltaProof[], numSigs: BN, accountDeltaRoot: Uint8Array, parentBankhash: Uint8Array, blockhash: Uint8Array }) {
        Object.assign(this, properties);
    }
}

class Update {
    constructor(properties: { slot: BN, root: Uint8Array, proof: BankHashProof }) {
        Object.assign(this, properties);
    }
}

// Define the schema for each class

const pubkeySchema: Schema = new Map([[Pubkey, {
    kind: 'struct',
    fields: [
        ['key', [32]]
    ]
}]]);

const dataSchema: Schema = new Map([[Data, {
    kind: 'struct',
    fields: [
        ['data', ['u8']]
    ]
}]]);

const proofSchema: Schema = new Map([[Proof, {
    kind: 'struct',
    fields: [
        ['proof', ['u8']]
    ]
}]]);

const accountDeltaProofSchema: Schema = new Map([[AccountDeltaProof, {
    kind: 'struct',
    fields: [
        ['pubkey', Pubkey],
        ['dataProof', [Data, Proof]]
    ]
}]]);

const bankHashProofSchema: Schema = new Map([[BankHashProof, {
    kind: 'struct',
    fields: [
        ['proofs', [AccountDeltaProof]],
        ['numSigs', 'u64'],
        ['accountDeltaRoot', [32]],
        ['parentBankhash', [32]],
        ['blockhash', [32]]
    ]
}]]);

const updateSchema: Schema = new Map([[Update, {
    kind: 'struct',
    fields: [
        ['slot', 'u64'],
        ['root', [32]],
        ['proof', BankHashProof]
    ]
}]]);

// Combine all schemas into one

const schema: Schema = new Map([...pubkeySchema, ...dataSchema, ...proofSchema, ...accountDeltaProofSchema, ...bankHashProofSchema, ...updateSchema]);




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
    
    client.on('data', function(d){
      console.log("Data: ",d);
      const update: Update = deserialize(schema, d);
    });
}
