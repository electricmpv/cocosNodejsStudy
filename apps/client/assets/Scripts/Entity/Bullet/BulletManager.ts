import { _decorator, Component, EventTouch, Input, input, instantiate, IVec2, Node, Tween, tween, UITransform, Vec2, Vec3 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IActor, IBullet, InputTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';

import { EntityStateEnum, EventEnum } from '../../Enum';
import { WeaponManager } from '../Weapon/WeaponManager';
import { rad2Angle } from '../../Utils';
import { BulletStateMachine } from './BulletStateMachine';
import EventManager from '../../Global/EventManager';
import { ExplosionManager } from '../Explosion/ExplosionManager';
import { ObjectPoolManager } from '../../Global/ObjectPoolManager';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends EntityManager {

 type:EntityTypeEnum;
 id:number;
 private targetPos:Vec3;
 private tween:Tween<unknown>;

 

    init(data:IBullet){
      this.type = data.type;
      this.id = data.id;
      this.fsm = this.addComponent(BulletStateMachine);
      this.fsm.init(data.type);
      this.state = EntityStateEnum.Idle;
      this.node.active = false;
      this.targetPos = undefined;
      this.node.active = false;
      EventManager.Instance.on(EventEnum.ExplosionBorn,this.handleExplosionBorn,this);
    }

    handleExplosionBorn(id:number,{x,y}:IVec2){
      if(id!==this.id) return;

      const explosion = ObjectPoolManager.Instance.get(EntityTypeEnum.Explosion);
      
      const em = explosion.getComponent(ExplosionManager)||explosion.addComponent(ExplosionManager);
      em.init(EntityTypeEnum.Explosion,{x,y});
        
        EventManager.Instance.off(EventEnum.ExplosionBorn,this.handleExplosionBorn,this);
        DataManager.Instance.bulletMap.delete(this.id);
        //this.node.destroy();
        ObjectPoolManager.Instance.ret(this.node);
    }

   
    render(data:IBullet){
     this.renderPos(data);
     this.renderDirection(data);
    }
    renderPos(data:IBullet){
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
       
        this.tween = tween(this.node).to(0.032,{
          position:this.targetPos,
        }).start();
      }
    }

    renderDirection(data:IBullet){
      const {direction} = data;
      const side = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
      const angle =direction.x > 0 ? rad2Angle(Math.asin(direction.y / side)) :  rad2Angle(Math.asin(-direction.y / side))+180;
      this.node.setRotationFromEuler(0,0,angle);
    }
    // render(data:IBullet){
    //   const {direction,position} = data;
    //   this.node.setPosition(position.x,position.y);
    


    //   // 使用 Math.atan2 来计算角度，这样可以处理所有象限
    //   const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
    //   console.log('Bullet direction:', direction, 'Calculated angle:', angle);
    //   this.node.setRotationFromEuler(0, 0, angle);
    // }

}

