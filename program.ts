import { Program, AnchorProvider, Idl } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { Connection, Keypair } from "@solana/web3.js";

export const COPY_PROGRAM_ID = "3R72AjaZj6gCbANm7LrjNwDqpxacxwnnqE7JgegBTY4Z";

export function getCopyProgram(
  rpcUrl: string,
  privateKey: Uint8Array,
): Program<Copy> {
  const key = Keypair.fromSecretKey(privateKey);
  const wallet = new NodeWallet(key);

  const provider = new AnchorProvider(new Connection(rpcUrl), wallet, {
    commitment: "confirmed",
  });

  return new Program(COPY_IDL, COPY_PROGRAM_ID, provider) as Program<Copy>;
}

export async function getCopyAccount(
  program: Program<Copy>,
  copy_account_buffer: Buffer,
): Promise<any> {
  return await program.account.copyAccount.coder.accounts.decode(
    "copyAccount",
    copy_account_buffer,
  );
}

export type Copy = {
  version: "0.1.0";
  name: "copy";
  instructions: [
    {
      name: "copyHash";
      accounts: [
        {
          name: "creator";
          isMut: true;
          isSigner: true;
          docs: ["The signer who initiates the chunk processing."];
        },
        {
          name: "sourceAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "copyAccount";
          isMut: true;
          isSigner: false;
          docs: [
            "Account (PDA) for storing the Merkle root of the accumulated chunks. Initializes if not already present.",
          ];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["The built-in Solana system program."];
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
          docs: ["The Solana sysvar to fetch the current slot number."];
        },
      ];
      args: [
        {
          name: "bump";
          type: "u8";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "copyAccount";
      docs: [
        "Represents the root account for blocks, typically storing a Merkle root.",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "digest";
            docs: [
              'The accumulated digest for all the merkle roots for each blob that is successfully "accumulated" during that slot',
            ];
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "slot";
            docs: [
              "The current slot number in Solana when this root is recorded.",
            ];
            type: "u64";
          },
        ];
      };
    },
  ];
};

export const COPY_IDL: Copy = {
  version: "0.1.0",
  name: "copy",
  instructions: [
    {
      name: "copyHash",
      accounts: [
        {
          name: "creator",
          isMut: true,
          isSigner: true,
          docs: ["The signer who initiates the chunk processing."],
        },
        {
          name: "sourceAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "copyAccount",
          isMut: true,
          isSigner: false,
          docs: [
            "Account (PDA) for storing the Merkle root of the accumulated chunks. Initializes if not already present.",
          ],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["The built-in Solana system program."],
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
          docs: ["The Solana sysvar to fetch the current slot number."],
        },
      ],
      args: [
        {
          name: "bump",
          type: "u8",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "copyAccount",
      docs: [
        "Represents the root account for blocks, typically storing a Merkle root.",
      ],
      type: {
        kind: "struct",
        fields: [
          {
            name: "digest",
            docs: [
              'The accumulated digest for all the merkle roots for each blob that is successfully "accumulated" during that slot',
            ],
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "slot",
            docs: [
              "The current slot number in Solana when this root is recorded.",
            ],
            type: "u64",
          },
        ],
      },
    },
  ],
};
