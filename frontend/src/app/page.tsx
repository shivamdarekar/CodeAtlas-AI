import { Footer } from "@/layout/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCards } from "@/components/FeatureCards";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0C0A09]">
      <main className="flex-1">
        <HeroSection />
        <FeatureCards />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
