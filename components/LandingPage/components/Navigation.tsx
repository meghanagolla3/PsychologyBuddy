import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation: React.FC = () => {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div
        className="
          flex items-center justify-between
          px-5 py-3 rounded-full

          bg-white/30 backdrop-blur-lg
          shadow-[0_8px_32px_rgba(0,0,0,0.08)]
          ring-1 ring-white/60
        "
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-b from-[#068ec0] to-[#1B9EE0] rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-b from-[#068ec0] to-[#1B9EE0]">
            Psychology Buddy
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium tracking-wider">
          <a href="#about" className="hover:text-[#4FC1F9] transition">About us</a>
          <a href="#contact" className="hover:text-[#4FC1F9] transition">Contact us</a>
          <a href="#schools" className="hover:text-[#4FC1F9] transition">For schools</a>
        </div>

        {/* CTA button */}
        <Button 
          onClick={handleGetStarted}
          className="bg-gradient-to-b from-[#4FC1F9] to-[#1B9EE0] text-sm text-white py-4 rounded-full font-medium hover:from-[#4FC1F9] hover:to-[#1B9EE0] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 tracking-wider disabled:cursor-not-allowed"
        >
          Lets Started

        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
