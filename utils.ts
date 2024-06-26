import * as blake3 from "blake3";
import { createHash } from "crypto";

export type PubkeyBytes = Uint8Array;

export type Hash = Uint8Array;

export interface Proof {
  path: number[];
  siblings: Hash[][];
}

export interface Data {
  pubkey: PubkeyBytes;
  hash: Hash;
  account: AccountInfo;
}

export interface AccountDeltaProof {
  key: PubkeyBytes;
  data: Data;
  proof: Proof;
}

export interface BankHashProof {
  proofs: AccountDeltaProof[];
  numSigs: bigint; // u64 is represented as bigint in TypeScript
  accountDeltaRoot: Hash;
  parentBankhash: Hash;
  blockhash: Hash;
}

export interface Update {
  slot: bigint; // u64 is represented as bigint in TypeScript
  root: Hash;
  proof: BankHashProof;
}

export interface AccountInfo {
  pubkey: Uint8Array;
  lamports: number;
  owner: Uint8Array;
  executable: boolean;
  rent_epoch: number;
  data: Uint8Array;
}

export interface AccountData {
  account: AccountInfo;
  hash: Hash;
}
// Util helper function to calculate the hash of a Solana account
// https://github.com/solana-labs/solana/blob/v1.16.15/runtime/src/accounts_db.rs#L6076-L6118
// We can see as we make the code more resilient to see if we can also make
// the structures match and use the function from solana-sdk, but currently it seems a bit more
// complicated and lower priority, since getting a stable version working is top priority

export async function hashSolanaAccount(
  lamports: number,
  owner: Uint8Array,
  executable: boolean,
  rent_epoch: number,
  data: Uint8Array,
  pubkey: Uint8Array,
): Promise<Uint8Array> {
  if (lamports === 0) {
    return new Uint8Array(32).fill(8);
  }
  await blake3.load();
  const hasher = blake3.createHash();

  hasher.update(new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer));
  hasher.update(
    new Uint8Array(new BigUint64Array([BigInt(rent_epoch)]).buffer),
  );
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

export function hashv(hashes: Uint8Array[]): Uint8Array {
  const hasher = createHash("sha256");
  for (const hash of hashes) {
    hasher.update(Buffer.from(hash));
  }
  return hasher.digest();
}

export function verifyProof(leafHash: Hash, proof: Proof, root: Hash): boolean {
  if (proof.path.length !== proof.siblings.length) {
    return false;
  }

  let currentHash = new Uint8Array(leafHash);

  for (let i = 0; i < proof.path.length; i++) {
    const indexInChunk = proof.path[i];
    const siblingHashes = proof.siblings[i];
    const hasher = createHash("sha256");

    for (let j = 0; j < indexInChunk; j++) {
      hasher.update(Buffer.from(siblingHashes[j]));
    }

    hasher.update(Buffer.from(currentHash));

    for (let j = indexInChunk; j < siblingHashes.length; j++) {
      hasher.update(Buffer.from(siblingHashes[j]));
    }

    currentHash = hasher.digest();
  }

  return Buffer.from(currentHash).equals(Buffer.from(root));
}

export async function verifyLeavesAgainstBankhash(
  accountProof: AccountDeltaProof,
  bankhash: Hash,
  numSigs: bigint,
  accountDeltaRoot: Hash,
  parentBankhash: Hash,
  blockhash: Hash,
): Promise<void> {
  const pubkey = accountProof.key;
  const data = accountProof.data;
  const proof = accountProof.proof;

  if (!Buffer.from(data.account.pubkey).equals(Buffer.from(pubkey))) {
    throw new Error(
      "account info pubkey doesn't match pubkey in provided update",
    );
  }

  const computedAccountHash = await hashSolanaAccount(
    data.account.lamports,
    data.account.owner,
    data.account.executable,
    data.account.rent_epoch,
    data.account.data,
    data.account.pubkey,
  );

  if (!Buffer.from(data.hash).equals(Buffer.from(computedAccountHash))) {
    throw new Error("account data does not match account hash");
  }

  const computedBankhash = hashv([
    parentBankhash,
    accountDeltaRoot,
    new Uint8Array(new BigUint64Array([numSigs]).buffer),
    blockhash,
  ]);

  if (!Buffer.from(bankhash).equals(Buffer.from(computedBankhash))) {
    throw new Error("bank hash does not match data");
  }

  if (!verifyProof(data.hash, proof, accountDeltaRoot)) {
    throw new Error("account merkle proof verification failure");
  }
}

export function int32ToBytesLE(num: number): Uint8Array {
  const bytes = new Uint8Array(4);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, num, true);
  return bytes;
}
