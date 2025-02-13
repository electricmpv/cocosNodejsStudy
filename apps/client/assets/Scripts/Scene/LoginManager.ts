import { _decorator, Component, director, EditBox, Node } from 'cc';
import { NetworkManager } from '../Global/NetworkManager';
import { ApiMsgEnum } from '../Common';
import DataManager from '../Global/DataManager';
import { SceneEnum } from '../Enum';
const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    input:EditBox;
    onLoad(){
        this.input = this.getComponentInChildren(EditBox);
        director.preloadScene(SceneEnum.Hall);
    }
   async start() {
        await NetworkManager.Instance.connect();
    }

   async handleClick(){
    if(!NetworkManager.Instance.isConnected){
        console.log("未连接到服务器");
        await NetworkManager.Instance.connect();
        return;
    }
    const nickname=this.input.string;
    if(!nickname){
        console.log("昵称不能为空nickname没有！");
        return;
    }
    const{success,error,res}=await NetworkManager.Instance.callApi(ApiMsgEnum.ApiPlayerJoin,{nickname})
      if(!success){
        console.log("客户端：调用API失败！",error)
        return;
      }
      DataManager.Instance.myPlayerId=res.player.id;
      console.log("客户端：调用API成功！res!",res)
      director.loadScene(SceneEnum.Hall);
  
   }
}
