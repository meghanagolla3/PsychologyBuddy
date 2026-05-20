const steps = [
  {
    number: "01",
    title: "Assessment",
    description:
      "We understand your school's unique needs, challenges, and current systems.",
    highlighted: true,
  },
  {
    number: "02",
    title: "Integration",
    description:
      "Seamless integration with your existing student information systems and workflows.",
    highlighted: false,
  },
  {
    number: "03",
    title: "Training",
    description:
      "Comprehensive onboarding and training for administrators and staff.",
    highlighted: false,
  },
  {
    number: "04",
    title: "Launch",
    description:
      "Soft launch with a pilot group, followed by a full school-wide rollout.",
    highlighted: false,
  },
];

const SimpleImplementation = () => {
  return (
    <section className="w-full py-6 sm:py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
        <h2 className="text-2xl sm:text-3xl md:text-[36px] font-bold text-[#2F3D43] mb-4 tracking-tight">
          Simple Implementation
        </h2>
        <p className="text-[#686D70] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Get started in weeks, not months, with our proven implementation
          process designed for schools
        </p>
      </div>

      {/* Steps Container */}
      <div className="max-w-6xl mx-auto relative pl-5 lg:pl-0">
        {/* Horizontal connecting line - desktop only */}
        <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-[12.5%] right-[12.5%] h-[2px] bg-[#1DA0E1] z-0"></div>
        
        {/* Vertical connecting line - mobile only */}
        <div className="lg:hidden absolute left-[52px] top-12 bottom-12 w-[2px] bg-[#1DA0E1] z-0"></div>
        
        {/* Steps Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-6 sm:py-12 px-6 sm:px-8 flex items-start text-left transition-all duration-300 hover:border-[#1DA0E1] hover:shadow-[0_8px_30px_rgba(29,160,225,0.08)] hover:ring-1 hover:ring-[#1DA0E1]/20"
            >
              {/* Step number badge */}
              <div className="absolute -top-4 -left-5 lg:left-6 w-[42px] h-[38px] rounded-[8px] flex items-center justify-center text-[19px] font-medium shadow-md bg-gradient-to-br from-[#4FC1F9] to-[#1B9EE0] text-white z-10">
                {step.number}
              </div>

              {/* Responsive layout: side-by-side on mobile, stacked vertically on desktop */}
              <div className="flex flex-row lg:flex-col gap-4 sm:gap-6 lg:gap-3 items-start w-full relative z-0">
                {/* Large background number */}
                <span className="text-[48px] sm:text-[64px] font-medium text-[#F1F5F9] select-none leading-none flex-shrink-0 lg:mb-2">
                  {step.number}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] sm:text-[20px] font-bold mb-2.5 text-[#2F3D43] transition-colors duration-300 group-hover:text-[#1DA0E1]">
                    {step.title}
                  </h3>
                  <p className="text-[#767676] text-[13px] sm:text-[14px] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimpleImplementation;