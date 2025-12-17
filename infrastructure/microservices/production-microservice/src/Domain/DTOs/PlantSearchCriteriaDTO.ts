import { PlantState } from "../enums/PlantState";

export type PlantSortField =
  | "createdAt"
  | "commonName"
  | "latinName"
  | "countryOfOrigin"
  | "state"
  | "oilStrength";

export type SortDirection = "ASC" | "DESC";

export interface PlantSearchCriteriaDTO {
  commonName?: string;
  latinName?: string;
  countryOfOrigin?: string;
  state?: PlantState;
  minOilStrength?: number;
  maxOilStrength?: number;
  searchTerm?: string;
  sortBy?: PlantSortField;
  sortDirection?: SortDirection;
}
