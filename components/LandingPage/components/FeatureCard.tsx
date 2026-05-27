import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  imageSrc?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, imageSrc }) => {
  return (
    <div className="bg-white border-0.5 border-[#D4D4D4] rounded-2xl md:rounded-3xl w-full h-auto min-h-[130px] px-3.5 py-4 sm:px-5 sm:py-6 md:pl-6 md:pr-2 md:pt-7 md:pb-7 drop-shadow-lg hover:shadow-[#00ABFF1A] hover:shadow-xl hover:border-none transition-all duration-300 flex flex-col items-start">
      <div className="w-[32px] h-[30px] sm:w-[48px] sm:h-[45px] md:w-[54px] md:h-[51px] rounded-lg md:rounded-xl flex items-center justify-center mb-2.5 sm:mb-4 overflow-hidden flex-shrink-0">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-blue-500 w-full h-full rounded-lg md:rounded-xl flex items-center justify-center">
            {Icon && <Icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" strokeWidth={3} />}
          </div>
        )}
      </div>
      <h3 className="text-[12px] sm:text-[18px] md:text-[20px] font-semibold md:font-medium text-[#2F3D43] mb-1 sm:mb-2 md:mb-3">{title}</h3>
      <p className="text-[#767676] text-[8px] sm:text-[12px] md:text-[14px] leading-normal sm:leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;

