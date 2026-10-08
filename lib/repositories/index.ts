import {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
  IInsightRepository,
  IAuthRepository,
  IAccountRepository,
} from "./interfaces";
import {
  LocalHomeRepository,
  LocalProductRepository,
  LocalSearchRepository,
  LocalCartRepository,
  LocalInsightRepository,
  LocalAuthRepository,
  LocalAccountRepository,
} from "./local";

// Dependency Injection Container
// The UI only imports from this file, ensuring that swapping to
// API-based repositories in the future requires exactly zero UI changes.

export const repositories = {
  home: new LocalHomeRepository() as IHomeRepository,
  product: new LocalProductRepository() as IProductRepository,
  search: new LocalSearchRepository() as ISearchRepository,
  cart: new LocalCartRepository() as ICartRepository,
  insight: new LocalInsightRepository() as IInsightRepository,
  auth: new LocalAuthRepository() as IAuthRepository,
  account: new LocalAccountRepository() as IAccountRepository,
};
