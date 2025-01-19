import { _decorator, Component, EventTouch, Input, input, Node, UITransform, Vec2 } from 'cc';
import DataManager from '../../Global/DataManager';
import { IActor, InputTypeEnum } from '../../Common';
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export class ActorManager extends Component {

  

    init(data:IActor){
      
    }

    tick(dt){
      if(DataManager.Instance.jm.input.length() ){
        const{x,y} = DataManager.Instance.jm.input;
        DataManager.Instance.applyInput({
          id:1,
          type:InputTypeEnum.ActorMove,
          direction:{x,y},
          dt,
        });
        console.log(DataManager.Instance.state.actors[0].position);
      }
    }
    render(data:IActor){
      const {direction,position} = data;
      this.node.setPosition(position.x,position.y);
      if(direction.x !==0){
        this.node.setScale(direction.x > 0 ? 1 : -1,1,1);
      }
    }

}

