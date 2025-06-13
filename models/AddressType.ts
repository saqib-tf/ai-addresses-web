import { Address } from "./Address";

export interface AddressType {
  id: number;
  name: string;
  addresses: Address[]; // Replace 'any' with a specific Address type/interface if available
}
