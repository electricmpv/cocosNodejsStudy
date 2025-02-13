import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { ApiMsgEnum, IApiPlayerListRes, IApiRoomListRes } from '../Common';
import { NetworkManager } from '../Global/NetworkManager';
import { PlayerManager } from '../UI/PlayerManager';
import DataManager from '../Global/DataManager';
import { EventEnum, SceneEnum } from '../Enum';
import { RoomManager } from '../UI/RoomManager';
import EventManager from '../Global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('HallManager')
export class HallManager extends Component {

    @property(Node)
    playerContainer:Node;
    @property(Prefab)
    playerPrefab:Prefab;

    @property(Node)
    roomContainer:Node;
    @property(Prefab)
    roomPrefab:Prefab;

    onLoad(){
        EventManager.Instance.on(EventEnum.RoomJoin,this.handleJoinRoom,this)
        NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgPlayerList,this.renderPlayer,this)
        NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgRoomList,this.renderRoom,this)
    }

    start() {
        this.playerContainer.destroyAllChildren();
        this.roomContainer.destroyAllChildren();
        this.getPlayers();
        this.getRooms();
    }

    onDestroy(){
        EventManager.Instance.off(EventEnum.RoomJoin,this.handleJoinRoom,this)
        NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgPlayerList,this.renderPlayer,this)
        NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgRoomList,this.renderRoom,this)
    }

   async getPlayers(){
    const{success,error,res}=await NetworkManager.Instance.callApi(ApiMsgEnum.ApiPlayerList,{})
      if(!success){
        console.log("客户端：调用API失败！",error)
        return;
      }
      console.log("客户端：调用API成功！res:",res)
      this.renderPlayer(res);
   }

   renderPlayer({list}:IApiPlayerListRes){
    for(const c of this.playerContainer.children){
        c.active=false;
    }
    while(this.playerContainer.children.length<list.length){
        const node = instantiate(this.playerPrefab);
        node.active=false;
        node.setParent(this.playerContainer);

   }

   console.log("客户端：渲染玩家！list:",list)
   for(let i=0;i<list.length;i++){
    const data = list[i];
    const node = this.playerContainer.children[i];
    node.getComponent(PlayerManager).init(data);
}

}

async getRooms(){
  const{success,error,res}=await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomList,{})
    if(!success){
      console.log("客户端：调用API失败！",error)
      return;
    }
    console.log("客户端：调用API成功！res:",res)
    this.renderRoom(res);
 }

 renderRoom({list}:IApiRoomListRes){
  for(const c of this.roomContainer.children){
    c.active=false;
}
while(this.roomContainer.children.length<list.length){
    const node = instantiate(this.roomPrefab);
    node.active=false;
    node.setParent(this.roomContainer);

}

console.log("客户端：渲染房间！list:",list)
for(let i=0;i<list.length;i++){
const data = list[i];
const node = this.roomContainer.children[i];
node.getComponent(RoomManager).init(data);
}
 }

async handleCreateRoom(){
  const{success,error,res}=await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomCreate,{})
  if(!success){
    console.log("客户端：创建房间失败！",error)
    return;
  }
  DataManager.Instance.roomInfo=res.room;
  //console.log("客户端：创建房间成功！DataManager.Instance.roomInfo:",DataManager.Instance.roomInfo)
  director.loadScene(SceneEnum.Room);
}

async handleJoinRoom(rid:number){
  const{success,error,res}=await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomJoin,{rid,})
  if(!success){
    console.log("客户端：加入房间失败！",error)
    return;
  }
  DataManager.Instance.roomInfo=res.room;
  console.log("客户端：加入房间成功！DataManager.Instance.roomInfo:",DataManager.Instance.roomInfo)
  director.loadScene(SceneEnum.Room);
}

}