"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    key: "chooseMood",
    label: "Choose Mood",
    sublabel: "Step 1",
    image: "/HIW/11.png",
    className: "md:-ml-20 md:-mt-28 md:w-[400px] md:h-[250px] -ml-10 -mt-14 w-[200px] h-[125px]",
    description: "Choose your mood in seconds no pressure, just honesty",
  },
  {
    key: "aiSupport",
    label: "AI Support",
    sublabel: "Step 2",
    image: "/HIW/2.svg",
    className: "md:-ml-19 md:-mt-39 md:w-[400px] md:h-[250px] -ml-10 -mt-20 w-[200px] h-[125px]",
    description: "Psychology buddy helps you understand why you feel that way",
  },
  {
    key: "learnGrow",
    label: "Learn & Grow",
    sublabel: "Step 3",
    image: "/HIW/3.svg",
    className: "md:-ml-25 md:-mt-38 md:w-[400px] md:h-[250px] -ml-12 -mt-19 w-[200px] h-[125px]",
    description: "Learn through Mind Space lessons and earn badges",
  },
  {
    key: "expertHelp",
    label: "Get Expert Help",
    sublabel: "Step 4",
    image: "/HIW/4.svg",
    className: "md:-ml-22.5 md:-mt-35 md:w-[400px] md:h-[250px] -ml-11 -mt-18 w-[200px] h-[125px]",
    description: "In cases requiring further support, alerts enable school administrators to respond.",
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll animation controller
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 30%"],
  });

  // Animate line width
  const animatedWidth = useTransform(scrollYProgress, [0, 1], ["0%", "65%"]);

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-[#f5f5f9] via-[#f3f3f4]/10 to-[#f5f5f9] relative overflow-hidden"
    >
      {/* Section Title */}
      <div className="text-center mb-10 md:mb-16 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-[40px] font-semibold text-[#2F3D43]">
          How It Works
        </h2>
        <p className="text-[#686D70] mt-2 text-[11px] sm:text-sm md:text-[16px]">
          Your journey to emotional wellbeing in four simple steps
        </p>
      </div>

      {/* ===== Animated Behind-Line (Hides on mobile/tablets where cards are stacked) ===== */}
      <div className="absolute top-[385px] left-[1400px] -translate-x-1/2 w-[120%] hidden lg:block z-0">
        <motion.div
          style={{ width: animatedWidth }}
          className="h-[3px] border-2 border-[#2DC8EF] drop-shadow-sm drop-shadow-[#2DC8EF] rounded-full"
        />
      </div>

      {/* ===== Steps Container ===== */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-20 sm:gap-y-24 lg:gap-4 justify-items-center w-full">
          {steps.map((step) => (
            <div key={step.key} className="flex flex-col items-center text-center">
              
              {/* White rounded card background wrapper */}
              <div className="relative w-[217px] h-[117px] drop-shadow-xl drop-shadow-[#589EE626] rounded-[21px] bg-white mt-4 md:mt-16 flex-shrink-0">
                
                {/* Overlapping Character Illustration (Handcrafted offsets and sizes) */}
                <div className={`flex ${step.className} items-center justify-center relative z-10`}>
                  <Image
                    src={step.image}
                    alt={step.label}
                    width={
                      step.key === "chooseMood" ? 650 :
                      step.key === "aiSupport" ? 275 :
                      step.key === "learnGrow" ? 330 :
                      280 // expertHelp
                    }
                    height={
                      step.key === "chooseMood" ? 650 :
                      step.key === "aiSupport" ? 125 :
                      step.key === "learnGrow" ? 175 :
                      240 // expertHelp
                    }
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>

              </div>

              {/* Step Title */}
              <h3 className="mt-6 md:mt-16 text-[16px] sm:text-[20px] md:text-[24px] font-semibold md:font-medium text-[#2F3D43]">
                {step.label}
              </h3>

              {/* Step Description */}
              <p className="text-[#767676] mt-2 w-[180px] sm:w-[210px] text-[11px] sm:text-sm md:text-[16px] leading-relaxed px-2">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;