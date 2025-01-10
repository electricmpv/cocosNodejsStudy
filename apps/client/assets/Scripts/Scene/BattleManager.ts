import { _decorator, Component, EventTouch, Input, input, instantiate, Node, Prefab, UITransform, Vec2 } from 'cc';
import DataManager from '../Global/DataManager';
import { JoyStickManager } from '../UI/JoyStickManager';
import { ResourceManager } from '../Global/ResourceManager';
import { ActorManager } from '../Entity/Actor/ActorManager';
import { PrefabPathEnum } from '../Enum';
import { EntityTypeEnum } from '../Common';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
private stage:Node;
private ui:Node;
private shouldUpdate:boolean = false;
  

    onLoad() {
        this.stage = this.node.getChildByName("Stage");
        this.ui = this.node.getChildByName("UI");
        DataManager.Instance.jm =this.ui.getComponentInChildren(JoyStickManager);
    }
    async start(){
      await this.loadRes();
      this.shouldUpdate = true;
    }
    async loadRes(){
      const list = []
      const p = ResourceManager.Instance.loadRes(PrefabPathEnum[EntityTypeEnum.Actor1],Prefab).then((res)=>{
        DataManager.Instance.prefabMap.set(EntityTypeEnum.Actor1,res);
      }
      )
      list.push(p);
      await Promise.all(list);
    }

    update(){
      if(!this.shouldUpdate) return;
      this.render();
    }
    render(){
      this.renderActor();
    }
    async renderActor(){
      for(const data of DataManager.Instance.state.actors){
        let am = DataManager.Instance.actorMap.get(data.id);
        if(!am){
         const prefab = await ResourceManager.Instance.loadRes('prefab/Actor',Prefab)
         const actor = instantiate(prefab);
         actor.setParent(this.stage);
         am =actor.addComponent(ActorManager);
         DataManager.Instance.actorMap.set(data.id,am);
         am.init(data)
        }else{
          am.render(data);
        }
       
      }
    }

}

