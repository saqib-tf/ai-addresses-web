import { State } from "./State";

export interface Country {
  id: number;
  code: string;
  name: string;
  states: State[]; // Replace 'any' with State[] if you want to reference the State interface
}
