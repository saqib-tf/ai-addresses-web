import { Person } from "./Person";

export interface Gender {
  id: number;
  code: string;
  name: string;
  persons: Person[]; // Replace 'any' with Person[] if you want to reference the Person interface
}
