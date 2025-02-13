import { MyServer } from "./MyServer";
import { WebSocketServer,WebSocket } from "ws";
import { EventEmitter } from "stream";
import { ApiMsgEnum, binaryDecode, binaryEncode, IModel, strdecode, strencode } from "../Common";
import { bufferToArrayBuffer } from "../Utils";

interface IItem{
  cb: Function;
  ctx: unknown;
}


export class Connection extends EventEmitter{

  private msgMap:Map<ApiMsgEnum,Array<IItem>>=new Map();
 


  constructor(private server:MyServer,private ws:WebSocket){
    super();
    this.ws.on("close",()=>{
      //this.server.connections.delete(this)
      this.emit("close")
    })

    this.ws.on("message",(buffer:Buffer)=>{
      
      

    try{
      const json= binaryDecode(bufferToArrayBuffer(buffer))
      
      const {name,data} = json;
      if(this.server.apiMap.has(name)){
        try{
          console.log("服务器端：调用API！",name,data)
          const cb=this.server.apiMap.get(name)
          const res=cb.call(null,this,data)
          this.sendMsg(name,{
          success:true,
          res,
        })
        }catch(e){
          this.sendMsg(name,{
            success:false,
            error:e.message
          })
        }
      }else if(this.msgMap.has(name)){
        try{
          this.msgMap.get(name).forEach(({cb,ctx})=>{
            cb.call(ctx,this,data)
          })
        }catch(e){
          console.log("服务器端：处理消息失败！",e)
        }
      }
      
      
      } 
    catch(e){
      console.log("服务器端：解析失败！",e)
    }
    })
  }

  sendMsg<T extends keyof IModel["msg"]>(name:T,data:IModel["msg"][T]){
    const msg={
      name,
      data
    } 
    const da = binaryEncode(name,data)
  //   const str = JSON.stringify(msg);
  // const ta = strencode(str);
  const buffer = Buffer.from(da.buffer);
  

this.ws.send(buffer);
  }
  

  listenMsg<T extends keyof IModel["msg"]>(name:T,cb:(connection:Connection,args:IModel["msg"][T])=>void,ctx:unknown){
    if(this.msgMap.has(name)){
      this.msgMap.get(name).push({cb,ctx})
    }else{
      this.msgMap.set(name,[{cb,ctx}])
    }
  }
  unlistenMsg<T extends keyof IModel["msg"]>(name:T,cb:(connection:Connection,args:IModel["msg"][T])=>void,ctx:unknown){
      if (this.msgMap.has(name)) {
      const index = this.msgMap.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
      index > -1 && this.msgMap.get(name).splice(index, 1);
    }
  }
}
