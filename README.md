# SPV TS
This is a native typescript (with some wasm only for blake3) implementation of the SPV protocol that interacts with our plugin.

The file example.ts contains an implementation for how this can be integrated into your code.

If you are looking to integrate this into a frontend web app see [SPV-React-Example](https://github.com/tinydancer-io/spv-react-example) this uses Node.js APIs.

Note: The source account when sending the txn has been set to the same key as the copy account for demo purposes, ideally this would be replaced with the account you want to verify.
