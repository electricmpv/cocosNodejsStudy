import { _decorator, Component, EventTouch, Input, input, Node, UITransform, Vec2 } from 'cc';
import EventManager from '../Global/EventManager';
import { EventEnum } from '../Enum';
const { ccclass, property } = _decorator;

@ccclass('ShootManager')
export class ShootManager extends Component {
  handleShoot(){
    EventManager.Instance.emit(EventEnum.WeaponShoot);
  }
    
}

