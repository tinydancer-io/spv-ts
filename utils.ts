import * as blake3 from 'blake3';
import {createHash} from "crypto";



export type Pubkey = Uint8Array; // Assuming Pubkey is a fixed-size byte array
export type Data = Uint8Array; // Assuming Data is a byte array

export type Hash = Uint8Array;

export interface Proof {
    path: number[];
    siblings: Hash[][];
}

// TypeScript equivalent of the AccountDeltaProof tuple struct
export interface AccountDeltaProof {
    key: Pubkey;
    dataProof: [Data, Proof];
}

// TypeScript equivalent of the BankHashProof struct
export interface BankHashProof {
    proofs: AccountDeltaProof[];
    numSigs: bigint; // u64 is represented as bigint in TypeScript
    accountDeltaRoot: Hash;
    parentBankhash: Hash;
    blockhash: Hash;
}

// TypeScript equivalent of the Update struct
export interface Update {
    slot: bigint; // u64 is represented as bigint in TypeScript
    root: Hash;
    proof: BankHashProof;
}


// Util helper function to calculate the hash of a Solana account
// https://github.com/solana-labs/solana/blob/v1.16.15/runtime/src/accounts_db.rs#L6076-L6118
// We can see as we make the code more resilient to see if we can also make
// the structures match and use the function from solana-sdk, but currently it seems a bit more
// complicated and lower priority, since getting a stable version working is top priority

export function hashSolanaAccount(
    lamports: number,
    owner: Uint8Array,
    executable: boolean,
    rentEpoch: number,
    data: Uint8Array,
    pubkey: Uint8Array
): Uint8Array {
    if (lamports === 0) {
        return new Uint8Array(32).fill(8);
    }

    const hasher = blake3.createHash();

    hasher.update(new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer));
    hasher.update(new Uint8Array(new BigUint64Array([BigInt(rentEpoch)]).buffer));
    hasher.update(data);

    if (executable) {
        hasher.update(new Uint8Array([1]));
    } else {
        hasher.update(new Uint8Array([0]));
    }
    hasher.update(owner);
    hasher.update(pubkey);

    return hasher.digest();
}



export function verifyProof(leafHash: Hash, proof: Proof, root: Hash): boolean {
    // Validate path length and siblings length
    if (proof.path.length !== proof.siblings.length) {
        return false;
    }

    let currentHash = new Uint8Array(leafHash);

    for (let i = 0; i < proof.path.length; i++) {
        const indexInChunk = proof.path[i];
        const siblingHashes = proof.siblings[i];
        const hasher = createHash('sha256');

        // We need to hash the elements in the correct order.
        // Before the current hash, add the siblings.
        for (let j = 0; j < indexInChunk; j++) {
            hasher.update(siblingHashes[j]);
        }

        // Hash the current hash
        hasher.update(currentHash);

        // After the current hash, add the remaining siblings.
        for (let j = indexInChunk; j < siblingHashes.length; j++) {
            hasher.update(siblingHashes[j]);
        }

        currentHash = hasher.digest();
    }

    return Buffer.from(currentHash).equals(Buffer.from(root));
}
