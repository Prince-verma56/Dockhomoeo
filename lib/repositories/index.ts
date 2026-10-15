import {
  IHomeRepository,
  IProductRepository,
  ISearchRepository,
  ICartRepository,
  IInsightRepository,
  IAuthRepository,
  IAccountRepository,
  IServiceabilityRepository,
  IPrescriptionRepository,
} from "./interfaces";
import {
  LocalHomeRepository,
  LocalProductRepository,
  LocalSearchRepository,
  LocalCartRepository,
  LocalInsightRepository,
  LocalAuthRepository,
  LocalAccountRepository,
  LocalServiceabilityRepository,
  LocalPrescriptionRepository,
} from "./local";

/**
 * True while the repositories below are the local development mocks. Pages
 * use it to label previews honestly — e.g. an order placed here is a preview
 * reference, not an order. Flip it in the same change that swaps in API
 * repositories.
 */
export const usingMockData = true;

// Dependency Injection Container
// The UI only imports from this file, ensuring that swapping to
// API-based repositories in the future requires exactly zero UI changes.
// Ready replacements for home, product, search, cart and serviceability live
// in ./api (Api*Repository); the swap order is in
// DOCHOMO-FINAL-FRONTEND-HANDOFF.md.

export const repositories = {
  home: new LocalHomeRepository() as IHomeRepository,
  product: new LocalProductRepository() as IProductRepository,
  search: new LocalSearchRepository() as ISearchRepository,
  cart: new LocalCartRepository() as ICartRepository,
  insight: new LocalInsightRepository() as IInsightRepository,
  auth: new LocalAuthRepository() as IAuthRepository,
  account: new LocalAccountRepository() as IAccountRepository,
  serviceability: new LocalServiceabilityRepository() as IServiceabilityRepository,
  prescription: new LocalPrescriptionRepository() as IPrescriptionRepository,
};
