import { _decorator, Component, EventTouch, Input, input, instantiate, Node, UITransform, Vec2,ProgressBar, Vec3, Tween, tween } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IActor, InputTypeEnum, toFixed } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { ActorStateMachine } from './ActorStateMachine';
import { EntityStateEnum, EventEnum } from '../../Enum';
import { WeaponManager } from '../Weapon/WeaponManager';
import { rad2Angle } from '../../Utils';
import EventManager from '../../Global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export class ActorManager extends EntityManager {

  id:number;
  bulletType:EntityTypeEnum;
  private hp:ProgressBar;
  private targetPos:Vec3;
  private tween:Tween<unknown>;
  private wm:WeaponManager;

  private hpBar:Node;


    init(data:IActor){
      this.hp = this.node.getComponentInChildren(ProgressBar);
      this.id = data.id;
      this.bulletType = data.bulletType;
      this.fsm = this.addComponent(ActorStateMachine);
      this.fsm.init(data.type);
      this.state = EntityStateEnum.Idle;
      this.node.active = false;
      this.targetPos = undefined;
      const prefab = DataManager.Instance.prefabMap.get(EntityTypeEnum.Weapon1);
      const weapon = instantiate(prefab);
      weapon.setParent(this.node);
      this.wm = weapon.addComponent(WeaponManager);
      this.wm.init(data);
    }

    tick(dt){
      if(this.id !== DataManager.Instance.myPlayerId) return;
      if(DataManager.Instance.jm.input.length() ){
        const{x,y} = DataManager.Instance.jm.input;
        EventManager.Instance.emit(EventEnum.ClientSync,{
          id:DataManager.Instance.myPlayerId,
          type:InputTypeEnum.ActorMove,
          direction:{x:toFixed(x),y:toFixed(y)},
          dt:toFixed(dt),
        });
       

        
        //console.log(DataManager.Instance.state.actors[0].position);
      }else{
        this.state = EntityStateEnum.Idle;
      }
    }
    render(data:IActor){
      this.renderPos(data);
      this.renderDirection(data);
      this.renderHp(data);
    }


    renderPos(data:IActor){
      const {position} = data;
      const newPos = new Vec3(position.x,position.y);
      if(!this.targetPos){
        this.node.active = true;
        this.node.setPosition(newPos);
        this.targetPos = new Vec3(newPos);
      }else if(!this.targetPos.equals(newPos)){
        this.tween?.stop();
        this.node.setPosition(this.targetPos);
        this.targetPos.set(newPos);
        this.state = EntityStateEnum.Run;
        this.tween = tween(this.node).to(0.032,{
          position:this.targetPos,
        }).call(()=>{
          this.state = EntityStateEnum.Idle;
        }).start();
      }

}

renderDirection(data:IActor){
  const {direction} = data;
  if(direction.x !==0){
    this.node.setScale(direction.x > 0 ? 1 : -1,1,1);
    this.hp.node.setScale(direction.x > 0 ? 1 : -1,1,1);
}
  const side = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  const rad = Math.asin(direction.y / side);
  const angle = rad2Angle(rad);
  this.wm.node.setRotationFromEuler(0,0,angle);
}

renderHp(data:IActor){
  this.hp.progress = data.hp / this.hp.totalLength;
}

}

