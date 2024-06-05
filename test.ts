import { AccountInfo, PublicKey } from "@solana/web3.js";
import { monitorAndVerifyUpdates, DEFAULT_RPC_URL, DEFAULT_PK } from "./client";
import { getCopyAccount, getCopyProgram } from "./program";

async function main() {
  let program  = getCopyProgram(DEFAULT_RPC_URL,new Uint8Array(DEFAULT_PK));
  let account_pubkey = new PublicKey("HPUJAf6r3zJrkM72wB3EhGGtfbTkQwMPMSq6d7HaapYr");
  let account_state = await program.account.copyAccount.getAccountInfo(account_pubkey);
  await monitorAndVerifyUpdates(account_pubkey,account_state as AccountInfo<Buffer>);
}
main();
