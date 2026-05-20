import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingQuestion {
  text: string;
  className: string;
}

const Hero: React.FC = () => {
  const router = useRouter();
  const floatingQuestions: FloatingQuestion[] = [
    // LEFT SIDE BUBBLES — Anchored relative to the centered max-w-[850px] content wrapper
    {
      text: "Is anything stressing you today?",
      className: "top-[42%] left-[-30px] sm:left-[-40px] md:left-[-55px] lg:left-[-200px] rotate-[8deg]",
    },
    {
      text: "How is your mood on a scale of 1-5?",
      className: "top-[90%] sm:top-[62%] md:top-[89%] lg:top-[82%] left-[-25px] sm:left-0 md:left-[-40px] lg:left-[-110px] rotate-[3deg]",
    },

    // RIGHT SIDE BUBBLES — Anchored relative to the centered max-w-[850px] content wrapper
    {
      text: "Is anything stressing you today?",
      className: "top-[46%] right-[-25px] sm:right-[-30px] md:right-[-60px] lg:right-[-170px] rotate-[3deg]",
    },
    {
      text: "How are you feeling today?",
      className: "top-[85%] sm:top-[62%] md:top-[88%] lg:top-[82%]  right-[-20px] sm:right-0 md:right-[-20px] lg:right-[-110px] rotate-[-6deg]",
    },
  ];

  const handleExploreNow = () => {
    router.push("/about");
  };

  return (
    <section className="relative w-full aspect-[428/767] lg:aspect-[4/3] overflow-hidden">
      {/* 1. Responsive Vector Backgrounds */}
      {/* Mobile & Tablet Portrait Background: MGB1.svg (< 1024px) */}
      <img
        src="/MGB1.svg"
        alt="Background Mobile"
        className="absolute inset-0 w-full h-full mt-0 sm:mt-0 md:-mt-25 object-cover block lg:hidden z-0 select-none pointer-events-none"
      />
      {/* Desktop & Tablet Landscape Background: LP.svg (>= 1024px) */}
      <img
        src="/LandingPage/LP.svg"
        alt="Background Desktop"
        className="absolute inset-0 w-full h-full -mt-10 sm:-mt-10 md:-mt-40 lg:-mt-10 object-cover hidden lg:block z-0 select-none pointer-events-none"
      />

      {/* 2. Absolute Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-[60px] sm:pt-20 md:pt-28 lg:pt-30 px-4 text-center">
        
        {/* 3. Centered Content Wrapper (Locks floating bubbles visually to the centered text container) */}
        <div className="relative w-full max-w-[300px] sm:max-w-[600px] md:max-w-[600px] lg:max-w-[600px] mx-auto flex flex-col items-center">
          
          {/* Floating Questions (Positioned absolute inside the max-w-[850px] parent box) */}
          {floatingQuestions.map((question, index) => (
            <div
              key={index}
              className={`absolute ${question.className} animate-float z-20`}
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              <div
                className="
                  relative
                  px-0.5 sm:px-3 sm:py-1.5 py-0.5
                  rounded-[4px] sm:rounded-[12px]
                  flex items-center gap-[1px] sm:gap-2
                  backdrop-blur-md
                  bg-white/5
                  /* TRUE glass border */
                  border-[0.1px] sm:border-[0.5px] border-white/30
shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]
                  sm:shadow-[0_0_20px_rgba(255,255,255,0.35),
                             0_4px_18px_rgba(0,0,0,0.05)]
                "
              >
                {/* inner glossy highlight */}
                <div
                  className="
                    absolute inset-0
                    rounded-[6px] sm:rounded-[12px]
                    bg-gradient-to-br
                    from-black/3
                    via-white/5
                    to-white/5
                    pointer-events-none
                  "
                />

                <Sparkles className="w-[4px] h-[4px] sm:w-3 md:w-2 sm:h-3 md:h-2 text-[#6B7073] opacity-70" />
                <span className="text-[4px] sm:text-[10px] md:text-[8px] text-[#6B7073] opacity-80 whitespace-nowrap">
                  {question.text}
                </span>
              </div>
            </div>
          ))}

          {/* Heading Content */}
          <div>
            {/* Tag above heading */}
            <span className="inline-flex items-center justify-center gap-0.5 rounded-full bg-white/20 w-[91px] h-[14px] sm:w-auto sm:h-auto sm:px-3 sm:py-1 text-[6px] sm:text-[10px] text-[#1D9FE1] shadow-[0_4px_18px_rgba(0,0,0,0.05)] backdrop-blur border-[0.1px] border-[#1CBBFF] mb-3 sm:mb-3">
              <Sparkles className="h-1.5 w-1.5 fill-current sm:h-3 sm:w-3 text-[#1D9FE1]" /> Your Wellbeing Champion
            </span>

            <h1 className="text-[20px] sm:text-3xl md:text-4xl lg:text-[38px] font-extrabold text-[#2F3D43] mb-1 sm:mb-3 leading-tight tracking-tight drop-shadow-sm">
              Your Safe Space for Everyday <br className="hidden sm:block" /> Mental Wellness
            </h1>
          </div>

          <p className="text-[10px] sm:text-base md:text-[12px] text-[#686D70] max-w-2xl mx-auto mb-1 sm:mb-4 px-2 leading-relaxed opacity-90">
            Get personalized support, track your emotions, and build healthy
             habits all in one trusted space designed for students.
          </p>

          <Button
            onClick={handleExploreNow}
            className="bg-gradient-to-b from-[#4FC1F9] to-[#1B9EE0] text-white text-[8px] sm:text-[16px] font-medium hover:from-[#4FC1F9] hover:to-[#1B9EE0] drop-shadow-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 px-2.5 py-1 sm:px-5 sm:py-1.5 h-auto rounded-full"
          >
            Explore Now
          </Button>

        </div>
      </div>
    </section>
  );
};

export default Hero;
