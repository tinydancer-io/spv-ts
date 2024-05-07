import { AccountInfo } from "@solana/web3.js";
import { sha256 } from "@noble/hashes/sha256";
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
  
class Hash {
    private bytes: Uint8Array;
    private static readonly MAX_BYTES = 32;

    constructor(bytes: Uint8Array) {
        if (bytes.length > Hash.MAX_BYTES) {
            throw new Error(`Hash cannot have more than ${Hash.MAX_BYTES} bytes`);
        }
        this.bytes = bytes;
    }

    // Convert bytes to hexadecimal string
    toString(): string {
        return Array.prototype.map.call(this.bytes, byte => {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    // Convert hexadecimal string to bytes
    static fromString(str: string): Hash {
        const bytes = new Uint8Array(str.length / 2);
        for (let i = 0; i < str.length; i += 2) {
            bytes[i / 2] = parseInt(str.slice(i, i + 2), 16);
        }
        return new Hash(bytes);
    }

    // Get the byte array
    toBytes(): Uint8Array {
        return this.bytes;
    }
}



interface Update {
    slot: number;
    root: Hash;
    proof: BankHashProof;
}

interface BankHashProof {
    proofs: AccountDeltaProof[];
    num_sigs: number;
    account_delta_root: Hash;
    parent_bankhash: Hash;
    blockhash: Hash;
}

interface Proof {
    path: number[]; // Position in the chunk (between 0 and 15) for each level.
    siblings: Hash[][]; // Sibling hashes at each level.
}

interface BankHashComponents {
    parent_bankhash: Hash;
    accounts_delta_hash: Hash;
    num_sigs: number;
    current_blockhash: Hash;
}

interface Data {
    hash: Hash;
    account: AccountInfo<Buffer>;
}

interface AccountDeltaProof {
    pubkey: string; // Assuming Pubkey is a string type
    dataProof: [Data, Proof];
}


function verifyProof(leafHash: Hash, proof: Proof, root: Hash): boolean {
    if (proof.path.length !== proof.siblings.length) {
        return false;
    }

    let currentHash: Hash = leafHash;

    for (let i = 0; i < proof.path.length; i++) {
        const indexInChunk = proof.path[i];
        const siblingHashes = proof.siblings[i];

        const hasher = sha256.create();

        for (let j = 0; j < indexInChunk; j++) {
            hasher.update(siblingHashes[j].toBytes());
        }

        hasher.update(currentHash.toBytes());

        for (let j = indexInChunk; j < siblingHashes.length; j++) {
            hasher.update(siblingHashes[j].toBytes());
        }

        currentHash = new Hash(hasher.digest());
    }

    return currentHash.toString() === root.toString();
}