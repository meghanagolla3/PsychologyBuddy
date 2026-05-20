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
    <section className="w-full  py-10 sm:py-20 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
        <h2 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-[#2F3D43] mb-3 tracking-tight">
          Schools See Real Impact
        </h2>
        <p className="text-[#686D70] text-xs sm:text-sm md:text-[16px] leading-relaxed px-4">
          Meaningful improvements across student wellbeing, administrative efficiency, and trust
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {impactCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-xl sm:rounded-2xl border p-6 sm:p-10 flex flex-col mx-3 sm:mx-0 gap-3 sm:gap-4 transition-shadow duration-200 hover:shadow-md drop-shadow-md sm:drop-shadow-lg drop-shadow-[#5DBAF926]"
            >
              {/* Image */}
              <div className="w-9 h-9 sm:w-11 sm:h-11">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="font-medium text-[#3A3A3A] text-base sm:text-[20px]">{card.title}</h3>

              {/* Points */}
              <ul className="flex flex-col gap-2">
                {card.points.map((point, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs sm:text-sm md:text-[16px] text-[#767676]">
                    <Check className="text-[#16A249] w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"/>
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