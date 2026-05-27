import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";


const stats = [
  { value: "50K+", label: "Students supported" },
  { value: "200+", label: "Partner schools" },
  { value: "95%", label: "Student satisfaction" },
  { value: "24/7", label: "Support available" },
];

const HeroSection = () => {
  return (
    <section className="w-full bg-gradient-to-b from-[#EBF6FF] via-[#CAE6FF] to-[#D4EAFF] overflow-hidden">
      {/* Hero Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-10 pb-6 md:pt-12 md:pb-8 mt-10 mb-10 md:mt-16 md:mb-16 lg:mt-20 lg:mb-20 text-center">
        {/* Floating decorative blobs */}

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4
          bg-white/33 h-[27px]
          shadow-[0_8px_32px_rgba(0,0,0,0.08)]
          border-[0.4px] border-[#1CBBFF]"
        >
          <Sparkles className="w-[10px] h-[9px] text-[#1D9FE1]" />
          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-[#1D9FE1]">
            Mental Health Support Built for Schools
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-[40px] lg:text-[48px] font-semibold text-[#2F3D43] leading-tight mb-4 sm:mb-5 md:mb-6 tracking-tight px-2">
          Mental Health Support Built for Schools
        </h1>

        {/* Subtext */}
        <p className="text-[#767676] text-xs sm:text-sm md:text-[15px] lg:text-[16px] max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 md:mb-10 px-4">
          Give administrators powerful tools and students access to professional
          support. Psychology <br className="hidden sm:inline"/> Buddy integrates seamlessly with your school's
          existing infrastructure.
        </p>

        {/* CTA */}
        <Link
          href="/contact"
          className="inline-flex items-center bg-gradient-to-b from-[#4FC1F9] to-[#1B9EE0] hover:bg-[#1589b8] text-white font-medium text-xs sm:text-[16px] md:text-[18px] px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-full transition-colors duration-200 shadow-md"
        >
          Request a Demo
        </Link>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pb-10 sm:pb-14 md:pb-16 lg:pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl py-4 sm:py-6 md:py-8 px-2 md:px-4 text-center drop-shadow-lg border border-white"
            >
              <p className="text-xl sm:text-2xl md:text-[30px] lg:text-[34px] font-semibold text-[#1B9EE0] mb-1 md:mb-2">
                {stat.value}
              </p>
              <p className="text-[#2F3D43] text-xs sm:text-sm md:text-[18px] lg:text-[20px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

