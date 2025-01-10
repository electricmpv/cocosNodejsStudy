import { InputTypeEnum } from "./Enum";

export interface IVec2{
  x:number;
  y:number;
}

export interface IActor{
  id:number;
  position:IVec2;
  direction:IVec2;
}

export interface IState {actors:IActor[]}

export interface IActorMove{
  id:number;
  type:InputTypeEnum.ActorMove;
  direction:IVec2;
  dt:number;
}
