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
    // LEFT SIDE BUBBLES — EXACT diagonal ↘
    {
      text: "Is anything stressing you today?",
      className: "top-[38%] left-[11%] rotate-[-8deg]",
    },
    {
      text: "How is your mood on a scale of 1–5?",
      className: "top-[55%] left-[20%] rotate-[-6deg]",
    },

    // RIGHT SIDE BUBBLES — EXACT diagonal ↙
    {
      text: "Is everything good today?",
      className: "top-[35%] right-[13%] rotate-[8deg]",
    },
    {
      text: "How are you feeling today?",
      className: "top-[53%] right-[21%] rotate-[6deg]",
    },
  ];

  const handleExploreNow = () => {
    router.push("/login");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Floating Questions */}
      {floatingQuestions.map((question, index) => (
        <div
          key={index}
          className={`absolute ${question.className} animate-float hidden lg:block z-20`}
          style={{ animationDelay: `${index * 0.5}s` }}
        >
          <div
            className="
              relative
              px-6 py-3
              rounded-3xl
              flex items-center gap-2

              /* GLASS LAYER */
              bg-gradient-to-br
              from-white/45
              via-white/25
              to-white/10

              backdrop-blur-[32px]
              backdrop-saturate-200

              /* BORDER + INNER GLOW */
              border border-white/50
              shadow-[0_8px_40px_rgba(255,255,255,0.35)]
              shadow-[0_20px_60px_rgba(0,0,0,0.15)]

              animate-float
            "
          >
            {/* inner light reflection */}
            <div
              className="
                absolute inset-0 rounded-3xl
                bg-gradient-to-tr
                from-white/40
                to-transparent
                opacity-60
                pointer-events-none
              "
            />
            <Sparkles className="w-4 h-4 text-[#8da1ae]" />
            <span className="text-sm text-[#8da1ae]">{question.text}</span>
          </div>
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="mt-[-200px]">
          {/* Tag above heading */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4
            bg-white/30 backdrop-blur-32xl
            shadow-[0_8px_32px_rgba(0,0,0,0.08)]
            ring-1 ring-[#19a8e6]"
          >
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium text-[#19a8e6]">
              Your Well-being Champion
            </span>
          </div>

          <h1 className="text-[50px] font-[700] text-[#2F3D43] mb-2 leading-[58px] drop-shadow-lg ">
            Your Safe Space for Everyday <br /> Mental Wellness
          </h1>
        </div>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mt-[-10px] mb-4">
          Get personalized support, track your emotions, and build healthy
          <br />
          habits all in one trusted space designed for students.
        </p>

        <Button
          onClick={handleExploreNow}
          className="bg-gradient-to-b from-[#4FC1F9] to-[#1B9EE0] text-white font-medium hover:from-[#4FC1F9] hover:to-[#1B9EE0] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 tracking-wider disabled:cursor-not-allowed"
          style={{
            width: '158px',
            height: '43px',
            borderRadius: '24px',
            paddingTop: '12.46px',
            paddingRight: '5.19px',
            paddingBottom: '12.46px',
            paddingLeft: '5.19px',
            gap: '8.31px'
          }}
        >
          Explore Now
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-16 h-16 bg-cyan-200/30 rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute bottom-40 left-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 right-32 w-12 h-12 bg-purple-200/30 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
    </section>
  );
};

export default Hero;
