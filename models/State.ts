import { Country } from "./Country";
import { PagedQuery } from "./PagedQuery";

export interface State {
  id: number;
  code: string;
  name: string;
  countryId: number;
  country: Country | null; // Replace 'any' with a specific Country type/interface if available
}

export interface StateSearchQuery extends PagedQuery {
  countryId?: number;
}
