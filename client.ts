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
import net from "net";


export interface TinydancerProofClient extends Client {
    
}





export async function monitorAndVerifyUpdates<T>(
    // rpcPubkey: PublicKey,
    // rpcAccount: AccountInfo<T>
): Promise<void> {
    const client = net.connect({
      port: 5000,
      host: '127.0.0.1' 
    
      // keepAlive: true,
    },function (){
      console.log("connected to geyser");
    });
    
    client.on('data', function(d){
      console.log("Data: ",d); 
    });
}
