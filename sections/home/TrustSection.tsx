import { CheckCircle2, FlaskConical, PackageCheck, ShieldCheck } from "lucide-react";
import { Container } from "@/components/shared/Container";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "100% Authentic Quality",
    description: "Every remedy is sourced directly from certified manufacturers and official distributors. No counterfeits, no compromises."
  },
  {
    icon: FlaskConical,
    title: "Pharmacopoeia Grade",
    description: "Our catalog strictly features formulations prepared according to standard homoeopathic pharmacopoeias (HPI, Schwabe, etc)."
  },
  {
    icon: PackageCheck,
    title: "Temperature Controlled",
    description: "From our climate-controlled warehouse to your doorstep, your medicines are preserved exactly as the manufacturer intended."
  },
  {
    icon: CheckCircle2,
    title: "Transparent Information",
    description: "Clear indications, precise compositions, and dosage forms so you and your practitioner know exactly what you are getting."
  }
];

export function TrustSection() {
  return (
    <section className="py-24 bg-[#0a2015] text-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[0.8rem] font-medium text-[#a7c5b6] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#1b7a54]" />
              The DocHomo Standard
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Healthcare you can trust, delivered with precision.
            </h2>
            
            <p className="text-[#8ba99a] text-lg mb-10 leading-relaxed">
              We understand that when it comes to medicine, authenticity and care are non-negotiable. That's why we've built a platform that puts pharmaceutical integrity first.
            </p>

            <div className="grid sm:grid-cols-2 gap-8">
              {TRUST_POINTS.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div key={index} className="flex flex-col">
                    <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-[#4ade80] mb-4">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
                    <p className="text-sm text-[#8ba99a] leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative w-full aspect-square max-w-lg mx-auto lg:ml-auto rounded-3xl overflow-hidden bg-white/5 border border-white/10">
            {/* Elegant abstract representation of trust/quality in healthcare */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1b7a54]/20 to-transparent mix-blend-overlay" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/5 rounded-full blur-3xl" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
              <div className="size-24 rounded-full bg-gradient-to-b from-[#1b7a54] to-[#0a2015] flex items-center justify-center border border-white/20 shadow-2xl mb-8">
                <ShieldCheck className="size-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Verified Excellence</h3>
              <p className="text-[#a7c5b6] leading-relaxed">
                DocHomo is committed to bridging the gap between world-class homoeopathic manufacturing and the patients who rely on them.
              </p>
            </div>
          </div>
          
        </div>
      </Container>
    </section>
  );
}
