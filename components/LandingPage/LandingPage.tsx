import React from "react";
import Navigation from "./components/Navigation";
import Hero from "./sections/Hero";
import Features from "./sections/Features";
import HowItWorks from "./sections/HowItWorks";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F5F5F9] via-[#F1F1F6] to-[#f8f7f8] relative">
      <Navigation />
      <div 
        className="relative"
        style={{
          backgroundImage: 'url("/LP.png")',
          backgroundSize: "100% auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#9ecbfd]/10 to-[#92c4fc]/0"></div>
        <Hero />
        <Features />
      </div>
      <HowItWorks />
    </div>
  );
};

export default LandingPage;
