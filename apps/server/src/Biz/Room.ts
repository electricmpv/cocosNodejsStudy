import { ApiMsgEnum, EntityTypeEnum, IClientInput, IMsgClientSync, InputTypeEnum, IState, toFixed } from "../Common";
import { Connection } from "../Core";
import { Player } from "./Player";
import { PlayerManager } from "./PlayerManager";
import { RoomManager } from "./RoomManager";


export class Room{
  id:number;
  timer1: ReturnType<typeof setInterval>;
  timer2: ReturnType<typeof setInterval>;
  lastTime:number;

  players:Set<Player>= new Set();

  pendingInput:IClientInput[]=[]

  lastPlayerFrameIdMap:Map<number,number>=new Map();

constructor(rid:number){
  this.id=rid;
  

}
join(uid:number){
  const player=PlayerManager.Instance.idMapPlayer.get(uid);
  if(player){
    player.rid=this.id;
    this.players.add(player);
  }
}
leave(uid:number){
  const player=PlayerManager.Instance.idMapPlayer.get(uid);
  if(player){
    player.rid=undefined;
    this.players.delete(player);
    if(this.players.size==0){
      RoomManager.Instance.closeRoom(this.id);
    }
  }
}
close(){
  this.players.clear();
    clearInterval(this.timer1); 
    clearInterval(this.timer2); 
}


sync(){
  for(const player of this.players){
    player.connection.sendMsg(ApiMsgEnum.MsgRoom,{room:RoomManager.Instance.getRoomView(this)})
  }
}

start(){
const state:IState = {
  actors:[...this.players].map((player,index)=>({
    id:player.id,
    nickname:player.nickname,
    type:EntityTypeEnum.Actor1,
    weaponType:EntityTypeEnum.Weapon1,
    bulletType:EntityTypeEnum.Bullet1,
    hp:100,
    position:{
      x:-150+index*300,
      y:-150+index*300,
    },
    direction:{
      x:1,
      y:0
    },
  })),
  bullets:[],
  nextBulletId:1,
  seed:1
}

for(const player of this.players){
  player.connection.sendMsg(ApiMsgEnum.MsgGameStart,{state})
  player.connection.listenMsg(ApiMsgEnum.MsgClientSync,this.getClientMsg,this)
}
this.timer1 = setInterval(()=>{
  this.sendServerMsg()
},1000/60)
this.timer2 = setInterval(()=>{
  this.timePast()
},16)
}





getClientMsg(connection:Connection,{input,frameId}:IMsgClientSync){
  this.pendingInput.push(input)
  this.lastPlayerFrameIdMap.set(connection.playerId,frameId);
}



sendServerMsg(){
    const inputs=this.pendingInput;
    this.pendingInput=[];
    for(const player of this.players){
      player.connection.sendMsg(ApiMsgEnum.MsgServerSync,{
        lastFrameId:this.lastPlayerFrameIdMap.get(player.id)??0,
        inputs})
    }
}



timePast(){

  const now =process.uptime();
  const dt = now - (this.lastTime?? now);
  
  this.pendingInput.push({
    type:InputTypeEnum.TimePass,
    dt:toFixed(dt),
  })
  this.lastTime = now;

 


}



}
