"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronLeft, CreditCard, Wallet, Loader2, XCircle, FileText } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { repositories } from "@/lib/repositories";
import { ApiAddress } from "@/types/api/cart";
import { ApiPrescription } from "@/types/api/prescription";
import { ApiServiceabilityResult } from "@/types/api/serviceability";

type CheckoutStep = "information" | "payment" | "review";

export function CheckoutView() {
  const router = useRouter();
  const { items, quote, clearCart } = useCart();
  
  const [step, setStep] = useState<CheckoutStep>("information");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<ApiAddress>({
    fullName: "",
    phone: "",
    line1: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE");
  const [note] = useState("");
  
  const { status } = useAuth();
  const [prescriptions, setPrescriptions] = useState<ApiPrescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | undefined>(undefined);

  const [serviceability, setServiceability] = useState<ApiServiceabilityResult | null>(null);
  const [isCheckingServiceability, setIsCheckingServiceability] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setLoadingPrescriptions(true);
      repositories.prescription.getPrescriptions().then((res: ApiPrescription[]) => {
        setPrescriptions(res);
      }).catch(console.error).finally(() => {
        setLoadingPrescriptions(false);
      });
    }
  }, [status]);

  useEffect(() => {
    if (address.pincode.length === 6) {
      setIsCheckingServiceability(true);
      repositories.serviceability.checkPincode(address.pincode).then((res: ApiServiceabilityResult) => {
        setServiceability(res);
      }).catch(console.error).finally(() => {
        setIsCheckingServiceability(false);
      });
    } else {
      setServiceability(null);
    }
  }, [address.pincode]);

  if (items.length === 0) {
    return (
      <Container>
        <div className="py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button onClick={() => router.push("/products")} className="text-[#1b7a54] hover:underline">
            Go to Shop
          </button>
        </div>
      </Container>
    );
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        lines: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        paymentMethod,
        address,
        note,
        expectedTotal: quote?.grandTotal,
        prescriptionId: selectedPrescriptionId ? parseInt(selectedPrescriptionId.replace('rx_', '')) : undefined,
      };
      const res = await repositories.cart.checkout(payload);
      
      clearCart();
      router.push(`/checkout/success?orderNumber=${res.orderNumber}`);
    } catch (e) {
      console.error(e);
      alert("Something went wrong during checkout.");
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side: Forms */}
        <div className="w-full lg:w-2/3">
          
          {/* Breadcrumb Steps */}
          <div className="flex items-center gap-2 text-sm font-medium mb-8">
            <button 
              onClick={() => setStep("information")}
              className={step === "information" ? "text-[#0a2015]" : "text-[#4b6b5a] hover:text-[#0a2015]"}
            >
              Information
            </button>
            <ChevronLeft className="size-4 rotate-180 text-black/20" />
            <button 
              onClick={() => step === "review" && setStep("payment")}
              disabled={step === "information"}
              className={`${step === "payment" ? "text-[#0a2015]" : "text-[#4b6b5a]"} ${step === "information" ? "opacity-50 cursor-not-allowed" : "hover:text-[#0a2015]"}`}
            >
              Payment
            </button>
            <ChevronLeft className="size-4 rotate-180 text-black/20" />
            <span className={step === "review" ? "text-[#0a2015]" : "text-[#4b6b5a] opacity-50"}>
              Review
            </span>
          </div>
          
          {/* STEP 1: Information */}
          {step === "information" && (
            <form onSubmit={handleInfoSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h2 className="text-xl font-bold text-[#0a2015] mb-4">Contact</h2>
                <div className="space-y-4">
                  <input 
                    required
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none"
                  />
                  <input 
                    required
                    type="tel" 
                    placeholder="Phone Number" 
                    value={address.phone}
                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                    className="w-full h-14 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none"
                  />
                </div>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-[#0a2015] mb-4">Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    placeholder="Full Name" 
                    value={address.fullName}
                    onChange={(e) => setAddress({...address, fullName: e.target.value})}
                    className="w-full md:col-span-2 h-14 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none"
                  />
                  <input 
                    required
                    type="text" 
                    placeholder="Address Line 1 (House No, Building, Street, Area)" 
                    value={address.line1}
                    onChange={(e) => setAddress({...address, line1: e.target.value})}
                    className="w-full md:col-span-2 h-14 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Landmark (Optional)" 
                    value={address.landmark || ""}
                    onChange={(e) => setAddress({...address, landmark: e.target.value})}
                    className="w-full md:col-span-2 h-14 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none"
                  />
                  <input 
                    required
                    type="text" 
                    placeholder="City" 
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full h-14 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none"
                  />
                  <input 
                    required
                    type="text" 
                    placeholder="State" 
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    className="w-full h-14 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none"
                  />
                  <div className="md:col-span-2">
                    <input 
                      required
                      type="text" 
                      placeholder="PIN Code" 
                      value={address.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 6) {
                          setAddress({...address, pincode: val});
                        }
                      }}
                      className="w-full h-14 px-4 rounded-xl border border-black/10 focus:border-[#1b7a54] focus:ring-1 focus:ring-[#1b7a54] outline-none"
                      maxLength={6}
                    />
                    
                    {isCheckingServiceability && (
                      <div className="mt-2 text-sm text-[#4b6b5a] flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" /> Checking delivery availability...
                      </div>
                    )}
                    
                    {!isCheckingServiceability && serviceability && (
                      <div className={`mt-3 p-3 rounded-xl text-sm flex items-start gap-3 ${
                        serviceability.isServiceable ? 'bg-green-50 text-green-900 border border-green-200/50' : 'bg-red-50 text-red-900 border border-red-200/50'
                      }`}>
                        {serviceability.isServiceable ? (
                          <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold">
                            {serviceability.isServiceable ? "Delivery Available" : "Not Serviceable"}
                          </p>
                          <p className="mt-0.5 opacity-90 leading-snug">
                            {serviceability.isServiceable 
                              ? "Get it by " + new Date(Date.now() + (serviceability.estimatedDeliveryDays || 3) * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
                              : serviceability.message || "We do not deliver to this pincode yet."
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Prescription Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#0a2015]">Prescription (Optional)</h2>
                </div>
                {loadingPrescriptions ? (
                  <div className="p-4 rounded-2xl border border-black/5 flex justify-center">
                    <Loader2 className="size-5 animate-spin text-[#4b6b5a]" />
                  </div>
                ) : prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    <label 
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        !selectedPrescriptionId
                          ? "border-[#1b7a54] bg-[#1b7a54]/5" 
                          : "border-black/5 bg-white hover:border-black/20"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="prescription" 
                        value=""
                        checked={!selectedPrescriptionId}
                        onChange={() => setSelectedPrescriptionId(undefined)}
                        className="size-5 accent-[#1b7a54]"
                      />
                      <div className="flex-1 font-semibold text-[#0a2015]">No Prescription</div>
                    </label>
                    {prescriptions.map(rx => (
                      <label 
                        key={rx.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedPrescriptionId === rx.id 
                            ? "border-[#1b7a54] bg-[#1b7a54]/5" 
                            : "border-black/5 bg-white hover:border-black/20"
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="prescription" 
                          value={rx.id}
                          checked={selectedPrescriptionId === rx.id}
                          onChange={() => setSelectedPrescriptionId(rx.id)}
                          className="size-5 accent-[#1b7a54]"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-[#0a2015] flex items-center gap-2">
                            <FileText className="size-4 text-[#1b7a54]" /> {rx.fileName}
                          </div>
                          <div className="text-sm text-[#4b6b5a]">Uploaded {new Date(rx.uploadedAt || rx.issuedAt || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-black/5 text-sm text-[#4b6b5a]">
                    You have no saved prescriptions. If required, our doctors will contact you after order placement.
                  </div>
                )}
              </section>

              <button 
                type="submit"
                disabled={serviceability?.isServiceable === false || address.pincode.length < 6}
                className="w-full md:w-auto h-14 px-8 rounded-xl bg-[#0a2015] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#153a27] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment <ArrowRight className="size-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Payment */}
          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
              <section>
                <h2 className="text-xl font-bold text-[#0a2015] mb-4">Payment Method</h2>
                <p className="text-sm text-[#4b6b5a] mb-6">All transactions are secure and encrypted.</p>
                
                <div className="space-y-4">
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "ONLINE" 
                        ? "border-[#1b7a54] bg-[#1b7a54]/5" 
                        : "border-black/5 bg-white hover:border-black/20"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="size-5 accent-[#1b7a54]"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-[#0a2015]">Online Payment (UPI, Cards, NetBanking)</div>
                      <div className="text-sm text-[#4b6b5a]">Pay securely via our payment gateway.</div>
                    </div>
                    <CreditCard className="size-6 text-[#1b7a54]" />
                  </label>
                  
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "COD" 
                        ? "border-[#1b7a54] bg-[#1b7a54]/5" 
                        : "border-black/5 bg-white hover:border-black/20"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="size-5 accent-[#1b7a54]"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-[#0a2015]">Cash on Delivery</div>
                      <div className="text-sm text-[#4b6b5a]">Pay in cash when your order arrives. (Additional ₹50 fee applies).</div>
                    </div>
                    <Wallet className="size-6 text-[#1b7a54]" />
                  </label>
                </div>
              </section>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep("information")}
                  className="h-14 px-8 rounded-xl border border-black/10 text-[#0a2015] font-semibold hover:bg-black/5 transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-1 md:flex-none h-14 px-8 rounded-xl bg-[#0a2015] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#153a27] transition-all"
                >
                  Review Order <ArrowRight className="size-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Review */}
          {step === "review" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
              <section>
                <h2 className="text-xl font-bold text-[#0a2015] mb-4">Review Order</h2>
                
                <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-6">
                  
                  <div className="flex justify-between items-start border-b border-black/5 pb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-[#4b6b5a] uppercase tracking-wider mb-2">Contact & Delivery</h3>
                      <p className="text-base text-[#0a2015] font-medium">{address.fullName}</p>
                      <p className="text-sm text-[#0a2015]">{email}</p>
                      <p className="text-sm text-[#0a2015]">{address.phone}</p>
                      <p className="text-sm text-[#0a2015] mt-2">
                        {address.line1}<br />
                        {address.landmark && <>{address.landmark}<br/></>}
                        {address.city}, {address.state} {address.pincode}
                      </p>
                    </div>
                    <button onClick={() => setStep("information")} className="text-sm font-semibold text-[#1b7a54] hover:underline">
                      Edit
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-start pb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#4b6b5a] uppercase tracking-wider mb-2">Payment</h3>
                      <p className="text-base text-[#0a2015] font-medium flex items-center gap-2">
                        {paymentMethod === "ONLINE" ? <CreditCard className="size-4 text-[#1b7a54]" /> : <Wallet className="size-4 text-[#1b7a54]" />}
                        {paymentMethod === "ONLINE" ? "Online Payment" : "Cash on Delivery"}
                      </p>
                    </div>
                    <button onClick={() => setStep("payment")} className="text-sm font-semibold text-[#1b7a54] hover:underline">
                      Edit
                    </button>
                  </div>

                </div>
              </section>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep("payment")}
                  className="h-14 px-8 rounded-xl border border-black/10 text-[#0a2015] font-semibold hover:bg-black/5 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 h-14 px-8 rounded-xl bg-[#0a2015] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#153a27] transition-all disabled:opacity-50 shadow-xl shadow-[#0a2015]/20"
                >
                  {isSubmitting ? "Processing..." : (
                    <>Place Order <CheckCircle2 className="size-5" /></>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
        
        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <OrderSummary />
          </div>
        </div>
      </div>
    </Container>
  );
}
