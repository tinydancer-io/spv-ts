import {
    CallOptions,
    ChannelCredentials,
    Client,
    ClientDuplexStream,
    ClientOptions,
    ClientUnaryCall,
    handleBidiStreamingCall,
    handleUnaryCall,
    makeGenericClientConstructor,
    Metadata,
    ServiceError,
    UntypedServiceImplementation,
  } from "@grpc/grpc-js";
import { AccountInfo, PublicKey } from "@solana/web3.js";



export interface TinydancerProofClient extends Client {
    
}





async function monitorAndVerifyUpdates<T>(
    rpcPubkey: PublicKey,
    rpcAccount: AccountInfo<T>
): Promise<void> {
    
}