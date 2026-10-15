import Header from "@/components/dd/Header";
import Hero from "@/components/dd/Hero";
import Industries from "@/components/dd/Industries";
import Templates from "@/components/dd/Templates";
import HowItWorks from "@/components/dd/HowItWorks";
import WhyStandApart from "@/components/dd/WhyStandApart";
import Pricing from "@/components/dd/Pricing";
import Contact from "@/components/dd/Contact";
import Footer from "@/components/dd/Footer";
import { useState } from "react";

export default function Home() {
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Industries onSelectIndustry={setSelectedIndustry} />
        <Templates selectedIndustry={selectedIndustry} onClearIndustry={() => setSelectedIndustry(null)} />
        <HowItWorks />
        <WhyStandApart />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}