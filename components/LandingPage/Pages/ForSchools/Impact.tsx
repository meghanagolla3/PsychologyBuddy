import { size } from "lodash";
import { Check } from "lucide-react";
import Image from "next/image";


const impactCards = [
  {
    image: "/for/7.svg",
    title: "Measurable Impact",
    points: [
      "Improved attendance rates",
      "Reduced disciplinary incidents",
      "Enhanced academic performance",
      "Increased student engagement",
    ],
    highlighted: true,
  },
  {
    image: "/for/8.svg",
    title: "Administrative Efficiency",
    points: [
      "Reduced counselor workload",
      "Better resource allocation",
      "Simplified documentation",
      "Time-saving automation",
    ],
    highlighted: false,
  },
  {
    image: "/for/9.svg",
    size:"12",
    title: "Trust & Safety",
    points: [
      "Evidence-based approach",
      "Licensed clinical oversight",
      "Complete privacy protection",
      "Transparent reporting",
    ],
    highlighted: false,
  },
];

const SchoolsRealImpact = () => {
  return (
    <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-10">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 md:mb-12">
        <h2 className="text-xl sm:text-2xl md:text-[32px] lg:text-[36px] font-semibold text-[#2F3D43] mb-3 md:mb-4 tracking-tight">
          Schools See Real Impact
        </h2>
        <p className="text-[#686D70] text-xs sm:text-sm md:text-[15px] lg:text-[16px] leading-relaxed px-4">
          Meaningful improvements across student wellbeing, administrative efficiency, and trust
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-6 md:gap-10">
        {/* Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {impactCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-xl sm:rounded-2xl border p-4 sm:p-6 md:p-6 flex flex-col gap-3 sm:gap-6 md:gap-3 transition-shadow duration-200 hover:shadow-md drop-shadow-md sm:drop-shadow-lg drop-shadow-[#5DBAF926]"
            >
              {/* Image */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-[#2F3D43] text-sm sm:text-base md:text-[16px] lg:text-[20px]">{card.title}</h3>

              {/* Points */}
              <ul className="flex flex-col gap-2 sm:gap-2.5">
                {card.points.map((point, j) => (
                  <li key={j} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm md:text-[12px] lg:text-[15px] text-[#767676] leading-relaxed">
                    <Check className="text-[#16A249] w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 flex-shrink-0 mt-0.5"/>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        
      </div>
    </section>
  );
};

export default SchoolsRealImpact;