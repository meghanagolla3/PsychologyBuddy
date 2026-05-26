const features = [
  {
    image: "/for/1.svg",
    title: "Safe & Compliant",
    description:
      "DPDP Act-2003, Cyber security Policy and Others with end-to-end encryption. Student privacy is our top priority with parental consent workflows.",
    highlighted: true,
  },
  {
    image: "/for/2.svg",
    title: "Evidence-Based Approach",
    description:
      "Built on cognitive behavioral therapy (CBT) principles and validated by mental health professionals and educators.",
    highlighted: false,
  },
  {
    image: "/for/3.svg",
    title: "Easy to Implement",
    description:
      "No complex setup or extra staff required. Psychology Buddy fits seamlessly into existing school workflows.",
    highlighted: false,
  },
  {
    image: "/for/4.svg",
    title: "Resource Management",
    description:
      "Curate and customize mental health resources aligned with your school's values and curriculum.",
    highlighted: false,
  },
  {
    image: "/for/5.svg",
    title: "Daily Wellbeing",
    description:
      "Students engage in daily check-ins, exercises, and reflections, making mental wellbeing a habit not a one-time intervention.",
    highlighted: false,
  },
  {
    image: "/for/6.svg",
    title: "Actionable Insights for Administrators",
    description:
      "Clear dashboards like Clear dashboards, Engagement levels, Tool usage, Alerts by severity.",
    highlighted: false,
  },
];

const WhySchools = () => {
  return (
    <section className="w-full bg-gradient-to-b from-[#D4EAFF] to-[#f8fafc] py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-10 mb-4 sm:mb-6 md:mb-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8 md:mb-10">
        <h2 className="text-xl sm:text-2xl md:text-[32px] lg:text-[36px] font-semibold text-[#2F3D43] mb-3 md:mb-4 tracking-tight">
          Why Schools Choose Psychology Buddy
        </h2>
        <p className="text-[#686D70] text-xs sm:text-sm md:text-[15px] lg:text-[16px] leading-relaxed px-4">
          Comprehensive mental health support designed specifically for educational institutions with
          safety and effectiveness at the core
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4 drop-shadow-md sm:drop-shadow-lg border transition-shadow duration-200 hover:shadow-md ${
              feature.highlighted
                ? "bg-white border-[#c5e8f7] shadow-md"
                : "bg-white border-gray-100"
            }`}
          >
            {/* Image */}
            <div className="w-[36px] sm:w-[48px] md:w-[52px] h-[34px] sm:h-[46px] md:h-[50px]">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Text */}
            <div>
              <h3 className="font-medium text-[#2F3D43] text-xs sm:text-sm md:text-[16px] lg:text-[18px] mb-1 sm:mb-1.5 leading-snug">
                {feature.title}
              </h3>
              <p className="text-[#767676] text-[10px] sm:text-xs md:text-[13px] lg:text-[14px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhySchools;