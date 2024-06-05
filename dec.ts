import * as borsh from "borsh";
import { type Schema } from "borsh";

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

let buffer = Buffer.from(
  "2939000000000000d8345dc4b775e864b8c555710d928f98787ce8ecc83206fe521706fe632e7cdb01000000f37ca1dcf20f08fb40da550bf631937ef88ca85ef9ce3dda933429f8a1c7418bf37ca1dcf20f08fb40da550bf631937ef88ca85ef9ce3dda933429f8a1c7418b9c452ebb17eabea542272ad3fe515293e29c69fc720029345cbecf27cb3e2d99f37ca1dcf20f08fb40da550bf631937ef88ca85ef9ce3dda933429f8a1c7418b00b112000000000023e41ec94895c18762b7ed8e2c869d9bf93c458e539b9e3536c6f79d8a49bffa00ffffffffffffffff3000000048f380e1df53f31fe60444cb35dbcd038b03acba18ba7cfba5dd5ecc3526e6afa9fef1faca7577930000000000000000ba98010000000000293900000000000001000000060000000000000001000000070000006444a034c9e85f990f4034a9fb72bc00e8e32e661765f4830052a547c8c8ee051887a100a37a6476093a5fabbc71177c84e17a02f71027ee98823ca65e6fe1840533e432865abc9f11bc9ecd8b79623b18a3f51f3d24749bf46664781c4ae6995a17da983b54fceed0ed6b60eb4ad6524d4e9dd85bc7bc12ea257e72e4d82a8439341bd52b0293ae5e4ad6d2010282112a9f5e5cdc01de5a9a959b1f659aeef9e7c24a588862cb2322f453cbfe081f41b2962ea7d5e56f82d2f75d0d116e11e283d80c17aedb1759fe4a0d55ae24c2c7a880f81eb85df3ccc0f8740b62e1ce8003000000000000008a5ac5a8eeecf8e02bcce25ce7b248df73796b3d668086874fa0b428d1e130c7567df4e9d308ca01e1de2006e6f9c8dd23597b15182a4e0730193f6f5eadb8706f0cae8cfafd5944611cd138f71e55c9b8cc9bc9e465ff26fd814598d9636c03",
  "hex",
);

let data:any = borsh.deserialize(UpdateSchema, buffer);
console.dir(data["proof"]["proofs"][0], { depth: 6 });
