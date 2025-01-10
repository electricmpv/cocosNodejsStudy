import { Prefab } from "cc";
import Singleton from "../Base/Singleton";
import { IActorMove, IState, IVec2 } from "../Common";
import { ActorManager } from "../Entity/Actor/ActorManager";
import { JoyStickManager } from "../UI/JoyStickManager";

const ACTOR_SPEED = 100;

export default class DataManager extends Singleton {
  static get Instance() {
    return super.GetInstance<DataManager>();
  }

  jm:JoyStickManager;
  actorMap:Map<number,ActorManager> = new Map();
  prefabMap:Map<string,Prefab> = new Map();

  state:IState = {
    actors:[
      {
        id:1,
        position:{
          x:0,
          y:0
        },
        direction:{
          x:1,
          y:0
        },
      }
    ]
  }

  applyInput(input:IActorMove){
    const{id,dt,direction:{x,y},} = input;
    const actor = this.state.actors.find(actor => actor.id === id);
    if(actor){
      actor.direction.x = x;
      actor.direction.y = y;
      actor.position.x += x * ACTOR_SPEED * dt;
      actor.position.y += y * ACTOR_SPEED * dt;
    }
  }
}

