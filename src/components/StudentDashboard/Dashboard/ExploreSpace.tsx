"use client";

import { MessageCircle, BookOpen, Brain, Medal } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    title: "AI Chat",
    subtitle: "Track your journey",
    iconColor: "bg-purple-500",
    icon: <MessageCircle className="h-6 w-6 text-white" />,
    href: "/students/chat",
  },
  {
    title: "Self help Tools",
    subtitle: "Quick tools to calm your mind.",
    iconColor: "bg-blue-500",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    href: "/students/selfhelptools",
  },
  {
    title: "Psychoeducation Library",
    subtitle: "Understand emotions and mental wellbeing.",
    iconColor: "bg-green-500",
    icon: <Brain className="h-6 w-6 text-white" />,
    href: "/students/content/library",
  },
  {
    title: "Badges and Streaks",
    subtitle: "Track progress and celebrate consistency.",
    iconColor: "bg-pink-500",
    icon: <Medal className="h-6 w-6 text-white" />,
    href: "/students/badges",
  },
];

export default function ExploreSpace() {
  return (
    <div className="w-full">
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900">
        Explore Your Space
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Choose what feels helpful right now.
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {tools.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm 
                       hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer
                       block no-underline"
          >
            {/* Icon */}
            <div className={`p-3 rounded-xl ${item.iconColor} inline-flex`}>
              {item.icon}
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-gray-800 mt-4">
              {item.title}
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {item.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}