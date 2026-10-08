import {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
} from "./interfaces";
import {
  LocalHomeRepository,
  LocalProductRepository,
  LocalSearchRepository,
  LocalCartRepository,
} from "./local";

// Dependency Injection Container
// The UI only imports from this file, ensuring that swapping to
// API-based repositories in the future requires exactly zero UI changes.

export const repositories = {
  home: new LocalHomeRepository() as IHomeRepository,
  product: new LocalProductRepository() as IProductRepository,
  search: new LocalSearchRepository() as ISearchRepository,
  cart: new LocalCartRepository() as ICartRepository,
};
