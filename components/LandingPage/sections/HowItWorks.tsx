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
    className: "md:-ml-46 md:-mt-38 md:w-[600px] md:h-[352px] -ml-23 -mt-21 w-[350px] h-[216px]",
    description: "Choose your mood in seconds no pressure, just honesty",
  },
  {
    key: "aiSupport",
    label: "AI Support",
    sublabel: "Step 2",
    image: "/HIW/2.svg",
    className: "md:-ml-19 md:-mt-33.5 md:w-[400px] md:h-[250px] -ml-10 -mt-22 w-[230px] h-[170px]",
    description: "Psychology buddy helps you understand why you feel that way",
  },
  {
    key: "learnGrow",
    label: "Learn & Grow",
    sublabel: "Step 3",
    image: "/HIW/3.svg",
    className: "md:-ml-25 md:-mt-33 md:w-[400px] md:h-[250px] -ml-10 -mt-22 w-[230px] h-[170px]",
    description: "Learn through Mind Space lessons and earn badges",
  },
  {
    key: "expertHelp",
    label: "Get Expert Help",
    sublabel: "Step 4",
    image: "/HIW/4.svg",
    className: "md:-ml-22.5 md:-mt-33.5 md:w-[400px] md:h-[250px] -ml-11 -mt-25 w-[240px] h-[180px]",
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

  // Animate line width/height
  const animatedWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const animatedHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      className="py-2 sm:py-4 md:py-1 bg-gradient-to-r from-[#f5f5f9] via-[#f3f3f4]/10 to-[#f5f5f9] relative overflow-hidden"
    >
      {/* Section Title */}
      <div className="text-center mb-5 md:mb-10 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-[40px] font-semibold text-[#2F3D43]">
          How It Works
        </h2>
        <p className="text-[#686D70] mt-2 text-[11px] sm:text-sm md:text-[16px]">
          Your journey to emotional wellbeing in four simple steps
        </p>
      </div>

      {/* ===== Steps ===== */}
      <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-4 justify-between px-6 md:px-26 py-10 md:py-20 relative z-10 gap-20 md:gap-12 justify-items-center">
        
        {/* ===== Animated Behind-Line (Desktop: horizontal, connecting card centers) ===== */}
        <div className="absolute left-[12.5%] right-[12.5%] top-[202px] hidden md:block z-0">
          <div className="w-full h-[3px] bg-[#2DC8EF]/20 rounded-full relative">
            <motion.div
              style={{ width: animatedWidth }}
              className="absolute left-0 top-0 h-full bg-[#2DC8EF] drop-shadow-[0_0_8px_#2DC8EF] rounded-full"
            />
          </div>
        </div>

        {/* ===== Animated Behind-Line (Mobile: vertical, connecting card centers) ===== */}
        <div className="absolute left-[99px] top-[80px] bottom-[80px] w-[3px] md:hidden z-0">
          <div className="h-full bg-[#2DC8EF]/20 rounded-full relative">
            <motion.div
              style={{ height: animatedHeight }}
              className="absolute left-0 top-0 w-full bg-[#2DC8EF] drop-shadow-[0_0_8px_#2DC8EF] rounded-full"
            />
          </div>
        </div>

        {steps.map((step) => (
            <div key={step.key} className="flex flex-row md:flex-col items-center text-left md:text-center w-full md:w-auto gap-6 md:gap-0 relative">
              
              {/* White rounded card background wrapper */}
              <div className="relative w-[150px] h-[81px] md:w-[217px] md:h-[117px] drop-shadow-xl drop-shadow-[#589EE626] rounded-[15px] md:rounded-[21px] bg-white mt-0 md:mt-16 flex-shrink-0 z-10">
                
                {/* Overlapping Character Illustration (Handcrafted offsets and sizes) */}
                <div className={`flex ${step.className} items-center justify-center relative z-10`}>
                  <Image
                    src={step.image}
                    alt={step.label}
                    width={
                      step.key === "chooseMood" ? 750 :
                      step.key === "aiSupport" ? 275 :
                      step.key === "learnGrow" ? 330 :
                      280 // expertHelp
                    }
                    height={
                      step.key === "chooseMood" ? 750 :
                      step.key === "aiSupport" ? 125 :
                      step.key === "learnGrow" ? 175 :
                      240 // expertHelp
                    }
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>

              </div>

              {/* Step Text Info */}
              <div className="flex flex-col text-left md:text-center md:items-center justify-center">
                {/* Step Title */}
                <h3 className="mt-0 md:mt-16 text-[18px] sm:text-[20px] md:text-[24px] font-semibold md:font-medium text-[#2F3D43]">
                  {step.label}
                </h3>

                {/* Step Description */}
                <p className="text-[#767676] mt-1.5 md:mt-2 w-full max-w-[260px] md:w-[180px] sm:w-[210px] text-[12px] sm:text-sm md:text-[16px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default HowItWorks;