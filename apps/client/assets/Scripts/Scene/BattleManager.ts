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
        this.stage.destroyAllChildren();
        DataManager.Instance.jm =this.ui.getComponentInChildren(JoyStickManager);
    }
    async start(){
      await this.loadRes();
      this.initMap();
      this.shouldUpdate = true;
    }
    async loadRes(){
      const list = []
      for(const type in PrefabPathEnum){
        const p = ResourceManager.Instance.loadRes(PrefabPathEnum[type],Prefab).then((res)=>{
          DataManager.Instance.prefabMap.set(type,res);
        }
      )
      list.push(p);
    }
      await Promise.all(list);
    }
    initMap(){
      const map = DataManager.Instance.prefabMap.get(EntityTypeEnum.Map);
      const mapNode = instantiate(map);
      mapNode.setParent(this.stage);
    }

    update(dt){
      if(!this.shouldUpdate) return;
      this.render();
      this.tick(dt);
    }
    tick(dt){
      this.tickActor(dt);
    }
    tickActor(dt){
      for(const data of DataManager.Instance.state.actors){
        const {id} = data;
        let am = DataManager.Instance.actorMap.get(id);
        am.tick(dt);
      }
    }
    render(){
      this.renderActor();
    }
    async renderActor(){
      for(const data of DataManager.Instance.state.actors){
        const {id,type} = data;
        let am = DataManager.Instance.actorMap.get(id);
        if(!am){
         const prefab = DataManager.Instance.prefabMap.get(type);
         const actor = instantiate(prefab);
         actor.setParent(this.stage);
         am =actor.addComponent(ActorManager);
         DataManager.Instance.actorMap.set(id,am);
         am.init(data)
        }else{
          am.render(data);
        }
       
      }
    }

}

