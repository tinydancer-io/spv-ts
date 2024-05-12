import { blake3, Blake3Opts} from '@noble/hashes/blake3';
import { AccountInfo } from "@solana/web3.js";
import { sha256 } from "@noble/hashes/sha256";
import { u32, u8, struct, } from "@solana/buffer-layout";
import { publicKey, u64, bool, Buffer} from "@solana/buffer-layout-utils";
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

export interface CopyAccount {
    digest: Uint8Array;
    slot: number;
}

// export const CopyAccountLayout = struct([
   
// ]);

export interface Update {
    slot: number;
    root: Hash;
    proof: BankHashProof;
}

export interface BankHashProof {
    proofs: AccountDeltaProof[];
    num_sigs: number;
    account_delta_root: Hash;
    parent_bankhash: Hash;
    blockhash: Hash;
}

export interface Proof {
    path: number[]; // Position in the chunk (between 0 and 15) for each level.
    siblings: Hash[][]; // Sibling hashes at each level.
}

export interface BankHashComponents {
    parent_bankhash: Hash;
    accounts_delta_hash: Hash;
    num_sigs: number;
    current_blockhash: Hash;
}

export interface Data {
    hash: Hash;
    account: AccountInfo<Buffer>;
}

export interface AccountDeltaProof {
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



function hashSolanaAccount(
    lamports: number,
    owner: Uint8Array,
    executable: boolean,
    rentEpoch: number,
    data: Uint8Array,
    pubkey: Uint8Array
): Hash {
    if (lamports === 0) {
        return new Hash(new Uint8Array(32).fill(8));
    }
    const hasher = blake3.create({});

    hasher.update(new Uint8Array(new Float64Array([lamports]).buffer));
    hasher.update(new Uint8Array(new Float64Array([rentEpoch]).buffer));
    hasher.update(data);

    if (executable) {
        hasher.update(new Uint8Array([1]));
    } else {
        hasher.update(new Uint8Array([0]));
    }
    hasher.update(owner);
    hasher.update(pubkey);

    const hashBytes = new Uint8Array(hasher.digest());
    return new Hash(hashBytes);
}