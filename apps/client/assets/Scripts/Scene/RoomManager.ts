import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { ApiMsgEnum, IApiPlayerListRes, IApiRoomListRes, IMsgGameStart, IMsgRoom } from '../Common';
import { NetworkManager } from '../Global/NetworkManager';
import { PlayerManager } from '../UI/PlayerManager';
import DataManager from '../Global/DataManager';
import { SceneEnum } from '../Enum';
import { deepClone } from '../Utils';

const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {

    @property(Node)
    playerContainer:Node;
    @property(Prefab)
    playerPrefab:Prefab;


    onLoad(){
        NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgRoom,this.renderPlayer,this)
        NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgGameStart,this.handleGameStart,this)
    }

    start() {
      this.renderPlayer({room:DataManager.Instance.roomInfo})
       
    }

    onDestroy(){
        NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgRoom,this.renderPlayer,this)
        NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgGameStart,this.handleGameStart,this)
    }

 
   renderPlayer({room:{players:list}}:IMsgRoom){
    for(const c of this.playerContainer.children){
        c.active=false;
    }
    while(this.playerContainer.children.length<list.length){
        const node = instantiate(this.playerPrefab);
        node.active=false;
        node.setParent(this.playerContainer);

   }

   //console.log("客户端：渲染玩家！list:",list)
   for(let i=0;i<list.length;i++){
    const data = list[i];
    const node = this.playerContainer.children[i];
    node.getComponent(PlayerManager).init(data);
}

}



async handleLeaveRoom(){
  const{success,error,res}=await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomLeave,{})
  if(!success){
    console.log("客户端：离开房间失败！",error)
    return;
  }
  DataManager.Instance.roomInfo=null;
  //console.log("客户端：离开房间成功！DataManager.Instance.roomInfo:",DataManager.Instance.roomInfo)
  director.loadScene(SceneEnum.Hall);
}

async handleStart(){
  const{success,error,res}=await NetworkManager.Instance.callApi(ApiMsgEnum.ApiGameStart,{})
  if(!success){
    console.log("客户端：开始游戏失败！",error)
    return;
  }
  console.log("客户端：开始游戏成功！",res)
}

 handleGameStart({state}:IMsgGameStart){
    DataManager.Instance.state=state;
    DataManager.Instance.lastState=deepClone(state);
    director.loadScene(SceneEnum.Battle)
}



}