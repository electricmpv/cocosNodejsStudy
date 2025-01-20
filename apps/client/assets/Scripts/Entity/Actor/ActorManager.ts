import { _decorator, Component, EventTouch, Input, input, instantiate, Node, UITransform, Vec2,ProgressBar } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IActor, InputTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { ActorStateMachine } from './ActorStateMachine';
import { EntityStateEnum } from '../../Enum';
import { WeaponManager } from '../Weapon/WeaponManager';
import { rad2Angle } from '../../Utils';
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export class ActorManager extends EntityManager {

  id:number;
  bulletType:EntityTypeEnum;
  private hp:ProgressBar;

  private wm:WeaponManager;

    init(data:IActor){
      this.hp = this.node.getComponentInChildren(ProgressBar);
      this.id = data.id;
      this.bulletType = data.bulletType;
      this.fsm = this.addComponent(ActorStateMachine);
      this.fsm.init(data.type);
      this.state = EntityStateEnum.Idle;
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
        DataManager.Instance.applyInput({
          id:1,
          type:InputTypeEnum.ActorMove,
          direction:{x,y},
          dt,
        });
        this.state = EntityStateEnum.Run;
        //console.log(DataManager.Instance.state.actors[0].position);
      }else{
        this.state = EntityStateEnum.Idle;
      }
    }
    render(data:IActor){
      const {direction,position} = data;
      this.node.setPosition(position.x,position.y);
      if(direction.x !==0){
        this.node.setScale(direction.x > 0 ? 1 : -1,1,1);
        this.hp.node.setScale(direction.x > 0 ? 1 : -1,1,1);
      }
      const side = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
      const rad = Math.asin(direction.y / side);
      const angle = rad2Angle(rad);
      this.wm.node.setRotationFromEuler(0,0,angle);
      this.hp.progress = data.hp / this.hp.totalLength;
    }

}

