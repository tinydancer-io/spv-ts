import { AccountInfo, PublicKey } from "@solana/web3.js";
import { monitorAndVerifyUpdates, DEFAULT_RPC_URL, DEFAULT_PK } from "./client";
import { getCopyProgram } from "./program";

async function main() {
  let program  = getCopyProgram(process.argv[2],new Uint8Array(DEFAULT_PK));
  let account_pubkey = new PublicKey("HPUJAf6r3zJrkM72wB3EhGGtfbTkQwMPMSq6d7HaapYr");
  let account_state = await program.provider.connection.getAccountInfo(account_pubkey);
  await monitorAndVerifyUpdates(account_pubkey,account_state as AccountInfo<Buffer>,program);
}
main();
