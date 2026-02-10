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
    <div className="bg-white border border-[#eeeeee] rounded-3xl pl-6 pr-2 pt-7 pb-9 shadow-sm hover:shadow-[#bee0f7] hover:shadow-xl hover:border-none transition-shadow duration-300">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-blue-500 w-full h-full rounded-xl flex items-center justify-center">
            {Icon && <Icon className="w-7 h-7 text-white" strokeWidth={3} />}
          </div>
        )}
      </div>
      <h3 className="text-xl font-medium text-black mb-3">{title}</h3>
      <p className="text-[#767676] text-lg leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
