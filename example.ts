import { AccountInfo, PublicKey, SYSVAR_CLOCK_PUBKEY, SystemProgram } from "@solana/web3.js";
import { monitorAndVerifyUpdates, DEFAULT_RPC_URL, DEFAULT_PK,  } from "./client";
import { getCopyProgram,COPY_PROGRAM_ID } from "./program";
async function main() {
  let program  = getCopyProgram(process.argv[2],new Uint8Array(DEFAULT_PK),COPY_PROGRAM_ID);

  
let [account_for_proof,bump] = PublicKey.findProgramAddressSync([Buffer.from("copy_hash")],program.programId)
console.log("account_for_proof: ",account_for_proof);

  let account_state = await program.provider.connection.getAccountInfo(account_for_proof);
  await monitorAndVerifyUpdates(account_for_proof,account_state as AccountInfo<Buffer>,program,bump);

}
main();
