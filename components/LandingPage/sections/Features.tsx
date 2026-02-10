import React from "react";
import { Heart, MessageCircle, BookOpen, Wrench, LucideIcon } from "lucide-react";
import FeatureCard from "../components/FeatureCard";

interface Feature {
  icon: LucideIcon;
  imageSrc?: string;
  title: string;
  description: string;
}

const Features: React.FC = () => {
  const features: Feature[] = [
    {
      icon: Heart,
      title: "Smart Mood Tracker",
      description:
        "Understand how you feel every day with simple check-ins and insightful patterns",
    },
    {
      icon: MessageCircle,
      title: "AI Support Chat",
      description:
        "Talk freely with your friendly AI mentor available 24/7 whenever you need support",
    },
    {
      icon: BookOpen,
      title: "MindSpace Library",
      description:
        "Learn how to manage stress, focus better, and build confidence with expert-designed lessons",
    },
    {
      icon: Wrench,
      title: "Self-help Tools",
      description: "Evidence-based exercises and coping strategies",
    },
  ];

  return (
    <div className="py-1 px-6">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-normal">
            Designed for Schools. Loved by Students.
          </h2>
          <p className="text-xl text-[#767676] max-w-3xl mx-auto mt-[-10px]">
            Empowering institutions to care for every student's emotional health
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
