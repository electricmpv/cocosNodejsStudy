import { PlayerManager } from "./Biz/PlayerManager";
import { RoomManager } from "./Biz/RoomManager";
import { ApiMsgEnum, IApiGameStartReq, IApiGameStartRes, IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes, IApiRoomCreateReq, IApiRoomCreateRes, IApiRoomJoinReq, IApiRoomJoinRes, IApiRoomLeaveReq, IApiRoomLeaveRes, IApiRoomListReq, IApiRoomListRes } from "./Common";
import { Connection, MyServer } from "./Core";
import { symlinkCommon } from "./Utils";
import { WebSocketServer } from "ws";

symlinkCommon();

declare module "./Core"{
  interface Connection{
    playerId:number;
  }
}

const server = new MyServer({port:9876});

server.on("connection",(connection:Connection)=>{
  console.log("来人了"+"服务器端：连接数：",server.connections.size)

})


  server.on("disconnection",(connection:Connection)=>{
    console.log("人走了"+"服务器端：连接数：",server.connections.size)
  if(connection.playerId){
    PlayerManager.Instance.removePlayer(connection.playerId);
    
  }
  PlayerManager.Instance.syncPlayers();
  //console.log("PlayerManager.Instance.players.size",PlayerManager.Instance.players.size)
  })
    

server.setApi(ApiMsgEnum.ApiPlayerJoin,(connection:Connection,data:IApiPlayerJoinReq):IApiPlayerJoinRes=>{
  const {nickname}=data;
  const player=PlayerManager.Instance.createPlayer({nickname,connection});
  connection.playerId=player.id;
  PlayerManager.Instance.syncPlayers();
  return {
    player:PlayerManager.Instance.getPlayerView(player),
  }
})

server.setApi(ApiMsgEnum.ApiPlayerList,(connection:Connection,data:IApiPlayerListReq):IApiPlayerListRes=>{
  
  return {
    list:PlayerManager.Instance.getPlayersView(),
  }
})


server.setApi(ApiMsgEnum.ApiRoomList,(connection:Connection,data:IApiRoomListReq):IApiRoomListRes=>{
  
  return {
    list:RoomManager.Instance.getRoomsView(),
  }
})



server.setApi(ApiMsgEnum.ApiRoomCreate,(connection:Connection,data:IApiRoomCreateReq):IApiRoomCreateRes=>{
 if(connection.playerId){
 
  const newRoom=RoomManager.Instance.createRoom();
  const room=RoomManager.Instance.joinRoom(newRoom.id,connection.playerId);
 
  if(room){
    RoomManager.Instance.syncRooms();
    PlayerManager.Instance.syncPlayers();
    return {
      room:RoomManager.Instance.getRoomView(room),

    }
 }else{
  throw new Error("房间不存在");
 }
}else{
  throw new Error("玩家未登录");
 }
 
})


server.setApi(ApiMsgEnum.ApiRoomJoin,(connection:Connection,{rid}:IApiRoomJoinReq):IApiRoomJoinRes=>{
  if(connection.playerId){
  

  
   const room=RoomManager.Instance.joinRoom(rid,connection.playerId);
  
   if(room){
     RoomManager.Instance.syncRooms();
     RoomManager.Instance.syncRoom(room.id);
     PlayerManager.Instance.syncPlayers();
     return {
       room:RoomManager.Instance.getRoomView(room),
 
     }
  }else{
   throw new Error("房间不存在");
  }
 }else{
   throw new Error("玩家未登录");
  }
  
 })

 server.setApi(ApiMsgEnum.ApiRoomLeave,(connection:Connection,data:IApiRoomLeaveReq):IApiRoomLeaveRes=>{
  if(connection.playerId){
    const player=PlayerManager.Instance.idMapPlayer.get(connection.playerId);
    if(player){
      const rid=player.rid;
  
   if(rid){
    RoomManager.Instance.leaveRoom(rid,player.id);
     RoomManager.Instance.syncRooms();
     RoomManager.Instance.syncRoom(rid);
     PlayerManager.Instance.syncPlayers();
     return {
 
     }
  }else{
   throw new Error("玩家不在房间中");
  }
    }else{
      throw new Error("玩家不存在");
    }

   
 }else{
   throw new Error("玩家未登录");
  }
  
 })



 server.setApi(ApiMsgEnum.ApiGameStart,(connection:Connection,data:IApiGameStartReq):IApiGameStartRes=>{
  if(connection.playerId){
    const player=PlayerManager.Instance.idMapPlayer.get(connection.playerId);
    if(player){

      const rid=player.rid;
  
   if(rid){
    RoomManager.Instance.startRoom(rid);
     RoomManager.Instance.syncRooms();
     RoomManager.Instance.syncRoom(rid);
     PlayerManager.Instance.syncPlayers();
     return {
 
     }
  }else{
   throw new Error("玩家不在房间中");
  }
    }else{
      throw new Error("玩家不存在");
    }

   
 }else{
   throw new Error("玩家未登录");
  }
  
 })

server.start().then(()=>{
  console.log("服务器端：启动成功！")
}).catch((error)=>{
  console.log("服务器端：启动失败！",error)
})



// let inputs =[]

// wss.on("connection", (socket) => {
//   socket.on("message", (buffer) => {
//     const str = buffer.toString();
//     try{
//       const msg = JSON.parse(str);
//       const {name,data} = msg;
//       const {input,frameId} = data;
//       inputs.push(input)
      
//       } 
//     catch(e){
//       console.log("服务器端：解析失败！",e)
//     }
//   })

//   setInterval(()=>{
//     const temp =inputs
//     inputs =[]
//     const msg={
//       name:ApiMsgEnum.MsgServerSync,
//       data:{
//         inputs:temp,
//       },
//     }
//     socket.send(JSON.stringify(msg));
//   },50)
// });


// wss.on("listening", () => {
//   console.log("Server is running on port 9876"+"服务器端：服务启动！！");
// });
