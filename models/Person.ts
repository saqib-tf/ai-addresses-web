import { Gender } from "./Gender";

export interface Person {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  genderId?: number;
  gender?: Gender | null; // Replace 'any' with a specific Gender type/interface if available
  profilePictureUrl: string;
}
