import { _decorator, Component, EventTouch, Input, input, instantiate, IVec2, Node, UITransform, Vec2 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IActor, IBullet, InputTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';

import { EntityStateEnum, EventEnum } from '../../Enum';
import { WeaponManager } from '../Weapon/WeaponManager';
import { rad2Angle } from '../../Utils';
import { ExplosionStateMachine } from './ExplosionStateMachine';
import EventManager from '../../Global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('ExplosionManager')
export class ExplosionManager extends EntityManager {

 type:EntityTypeEnum;
 id:number;

 

    init(type:EntityTypeEnum,{x,y}:IVec2){
      this.node.setPosition(x,y);
      this.type = type;
     
      this.fsm = this.addComponent(ExplosionStateMachine);
      this.fsm.init(type);
      this.state = EntityStateEnum.Idle;
      
    
    }


}

