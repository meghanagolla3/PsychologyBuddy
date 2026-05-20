import React from "react";
import Navigation from "./components/Navigation";
import Hero from "./sections/Hero";
import Features from "./sections/Features";
import HowItWorks from "./sections/HowItWorks";
import WellnessSection from "./sections/Wellness";
import TrustSection from "./sections/Privacy";
import FAQSection from "./sections/FAQ";
import Footer from "./sections/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F9] relative overflow-x-hidden">
      <Navigation />
      
      {/* Section 1: Hero */}
      <Hero />

      {/* Section 2: Features */}
      <div id="features" className="relative z-20 w-full mt-[-35vw] sm:mt-[-35vw] lg:mt-[-18vw] pb-20"> 
        <Features />
      </div>

      <div id="how-it-works">
        <HowItWorks />
      </div>
      <WellnessSection />
      <div id="trust">
        <TrustSection />
      </div>
      <div id="faq">
        <FAQSection />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;