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
      host: '145.40.125.153',
    
      // keepAlive: true,
    },function (){
      console.log("connected to geyser");
    });
    
    client.on('data', function(d){
      console.log("Data: ",d); 
    });
}
