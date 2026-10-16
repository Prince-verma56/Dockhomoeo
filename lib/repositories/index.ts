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
  ICareRepository,
  IConsultationRepository,
} from "./interfaces";
import {
  ApiAccountRepository,
  ApiAuthRepository,
  ApiCareRepository,
  ApiConsultationRepository,
  ApiCartRepository,
  ApiHomeRepository,
  ApiInsightRepository,
  ApiPrescriptionRepository,
  ApiProductRepository,
  ApiSearchRepository,
  ApiServiceabilityRepository,
} from "./api";

/**
 * False: the catalogue, cart, checkout, orders and Health Insights are the
 * live shop API (Phase 2+3, insights since Phase 4). When true, pages label what they show as development data — an
 * order "placed" then is a preview reference, not an order — and the local
 * photo map may stand in for product images.
 *
 * The development catalogue in ./local (LocalHome/Product/Search/Cart/
 * Serviceability/InsightRepository) is kept for explicit offline work: swap the
 * classes below *and* set this to true together. Nothing falls back to it
 * when a live request fails.
 */
export const usingMockData = false;


// Dependency Injection Container
// The UI only imports from this file, so swapping implementations needs no UI change.

const auth = new ApiAuthRepository();

export const repositories = {
  home: new ApiHomeRepository() as IHomeRepository,
  product: new ApiProductRepository() as IProductRepository,
  search: new ApiSearchRepository() as ISearchRepository,
  cart: new ApiCartRepository() as ICartRepository,
  serviceability: new ApiServiceabilityRepository() as IServiceabilityRepository,
  insight: new ApiInsightRepository() as IInsightRepository,
  auth: auth as IAuthRepository,
  account: new ApiAccountRepository(auth) as IAccountRepository,
  prescription: new ApiPrescriptionRepository() as IPrescriptionRepository,
  care: new ApiCareRepository() as ICareRepository,
  consultation: new ApiConsultationRepository() as IConsultationRepository,
};
