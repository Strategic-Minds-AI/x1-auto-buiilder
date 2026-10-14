import Header from "@/components/dd/Header";
import Hero from "@/components/dd/Hero";
import Industries from "@/components/dd/Industries";
import Templates from "@/components/dd/Templates";
import HowItWorks from "@/components/dd/HowItWorks";
import WhyStandApart from "@/components/dd/WhyStandApart";
import Pricing from "@/components/dd/Pricing";
import Contact from "@/components/dd/Contact";
import Footer from "@/components/dd/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Industries />
        <Templates />
        <HowItWorks />
        <WhyStandApart />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}