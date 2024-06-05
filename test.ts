import { AccountInfo, PublicKey, SYSVAR_CLOCK_PUBKEY, SystemProgram } from "@solana/web3.js";
import { monitorAndVerifyUpdates, DEFAULT_RPC_URL, DEFAULT_PK,  } from "./client";
import { getCopyProgram,COPY_PROGRAM_ID } from "./program";
import * as anchor from "@project-serum/anchor";
async function main() {
  let program  = getCopyProgram(process.argv[2],new Uint8Array(DEFAULT_PK),COPY_PROGRAM_ID);
  // let account_pubkey = new PublicKey("HPUJAf6r3zJrkM72wB3EhGGtfbTkQwMPMSq6d7HaapYr");

  
let [account_for_proof,bump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.bs58.decode("copy_hash")],program.programId)
console.log("account_for_proof: ",account_for_proof);

  let account_state = await program.provider.connection.getAccountInfo(account_for_proof);
  let txn = await program.methods.copyHash(bump).accounts({
    copyAccount: account_for_proof,
    sourceAccount: account_for_proof,
    clock: SYSVAR_CLOCK_PUBKEY,
    systemProgram: SystemProgram.programId,
    creator: program.provider.publicKey!!
  }).rpc({
    commitment: "processed"
  });
  console.log("txn_hash:",txn)
  await monitorAndVerifyUpdates(account_for_proof,account_state as AccountInfo<Buffer>,program);

}
main();
