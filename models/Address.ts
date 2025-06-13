import { AddressType } from "./AddressType";
import { Country } from "./Country";
import { PagedQuery } from "./PagedQuery";
import { Person } from "./Person";
import { State } from "./State";

export interface Address {
  id: number;
  street: string;
  city: string;
  stateId: number;
  state: State | null; // Replace 'any' with a specific State type/interface if available
  postalCode: string | null;
  addressTypeId: number;
  addressType: AddressType | null; // Replace 'any' with a specific AddressType if available
  personId: number;
  person: Person | null; // Replace 'any' with a specific Person type/interface if available
  countryId?: number;
  country?: Country | null;
}

export interface AddressSearchQuery extends PagedQuery {
  personId?: number;
}
