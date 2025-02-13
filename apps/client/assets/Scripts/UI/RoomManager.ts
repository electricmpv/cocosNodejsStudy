import { _decorator, Component, Label, Node } from 'cc';
import { IRoom } from '../Common';
import EventManager from '../Global/EventManager';
import { EventEnum } from '../Enum';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
    id:number;
    init({id,players}:IRoom){
        this.id = id;
        const label = this.getComponent(Label)
        label.string = `房间ID:${id} 玩家数:${players.length}`;
        this.node.active = true;
       }

       handleClick(){
        EventManager.Instance.emit(EventEnum.RoomJoin,this.id)
       }
}

