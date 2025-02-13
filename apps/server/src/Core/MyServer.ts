import { WebSocketServer,WebSocket } from "ws";
import { Connection } from "./Connection";
import { ApiMsgEnum, IModel } from "../Common";
import { EventEmitter } from "stream";

export class MyServer extends EventEmitter{
  port:number;
  wss:WebSocketServer;
  apiMap:Map<ApiMsgEnum,Function> = new Map();

  connections:Set<Connection> = new Set();

  constructor({port}:{port:number}){
    super();
    this.port = port;
  }

  start(){
    return new Promise((resolve,reject)=>{  
    this.wss = new WebSocketServer({ port: 9876 });
    this.wss.on("listening", () => {
      resolve(true)
      console.log("服务器端：监听成功！")
    })
   
    this.wss.on("error", (error) => {
      console.log("服务器端：连接失败！",error)
      reject(error)
    })  
    this.wss.on("close", () => {
      console.log("服务器端：连接关闭！")
      reject(false)
    })
    
    this.wss.on("connection", (ws:WebSocket) => {
      const connection = new Connection(this,ws)
      this.connections.add(connection)
      this.emit("connection",connection)
      console.log("服务器端：连接成功！")
     
      
      connection.on("close",()=>{
        this.connections.delete(connection)
        this.emit("disconnection",connection)
        
      })
    })
  })
}

setApi<T extends keyof IModel["api"]>(name:T,cb:(connection:Connection,args:IModel["api"][T]["req"])=>void){
  this.apiMap.set(name,cb)
}


}