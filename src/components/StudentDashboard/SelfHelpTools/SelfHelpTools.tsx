"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Music, Brain, ArrowLeft } from "lucide-react";
import BackToDashboard from "../Layout/BackToDashboard";

export default function SelfHelpCardsExact() {
  const router = useRouter();
  
  const cards = [
    {
      id: "journaling",
      title: "Journaling",
      description: "Express your thoughts and feelings in a safe, private space",
      icon: BookOpen,
      iconBg: "from-[#A855F7] to-[#9333EA]",
      // ⬇ EXACT background from screenshot
      gradient: "from-[#FFFFFF] via-[#F8F4FF] to-[#F3E9FF]",
      glow: "from-[#F7E9FF] to-[#FFFFFF]",
      bullets: "bg-[#9333EA]",
      cta: "from-[#9333EA] to-[#A855F7]",
      benefits: ["Process emotions", "Track patterns", "Build self-awareness"],
      buttonText: "Build self-awareness",
    },
    {
      id: "music",
      title: "Music Therapy",
      description: "Curated playlists to support your emotional wellbeing",
      icon: Music,
      iconBg: "from-[#3B82F6] to-[#2563EB]",
      // ⬇ Exact sky-blue gradient
      gradient: "from-[#FFFFFF] via-[#F2F7FF] to-[#E6F0FF]",
      glow: "from-[#DDEAFF] to-[#FFFFFF]",
      bullets: "bg-[#3B82F6]",
      cta: "from-[#3B82F6] to-[#60A5FA]",
      benefits: ["Reduce stress", "Improve mood", "Enhance focus"],
      buttonText: "Start Music Therapy",
    },
    {
      id: "meditation",
      title: "Meditation",
      description: "Guided practices for mindfulness and inner peace",
      icon: Brain,
      iconBg: "from-[#10B981] to-[#059669]",
      // ⬇ Exact mint-green gradient
      gradient: "from-[#FFFFFF] via-[#EDFFF7] to-[#D9FCEA]",
      glow: "from-[#C8FFE0] to-[#FFFFFF]",
      bullets: "bg-[#10B981]",
      cta: "from-[#10B981] to-[#34D399]",
      benefits: ["Calm your mind", "Reduce anxiety", "Improve sleep"],
      buttonText: "Start Meditation",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Back Link */}
        <div className="max-w-7xl my-[2px] sm:my-[10px] mx-[-10px] pt-2 sm:pt-3 lg:pt-5 sm:px-3 lg:px-4">
                      <BackToDashboard />
                    </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              Self-Help Tools
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Quick, effective tools to help you manage emotions, reduce stress.
            </p>
          </div>
        </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className={`
              w-[330px] rounded-3xl p-6 relative overflow-hidden
              bg-gradient-to-br ${card.gradient}
              border border-white/70
              shadow-[0px_4px_18px_rgba(0,0,0,0.06)]
            `}
          >
            {/* Soft glow blob */}
            <div
              className={`
                absolute top-[-10px] right-[-10px]
                w-44 h-44 rounded-full blur-3xl opacity-70
                bg-gradient-to-br ${card.glow}
              `}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center shadow-md`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900 mt-4">
                {card.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {card.description}
              </p>

              {/* Benefits */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Benefits
                </p>

                <ul className="space-y-2 text-sm text-gray-700">
                  {card.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${card.bullets}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  if (card.id === "journaling") {
                    router.push("/students/selfhelptools/journaling");
                  } else if (card.id === "music") {
                    router.push("/students/selfhelptools/music");
                  } else if (card.id === "meditation") {
                    router.push("/students/selfhelptools/meditation");
                  }
                }}
                className={`
                  mt-6 w-full py-3 text-sm font-semibold rounded-full text-white
                  bg-gradient-to-r ${card.cta}
                  shadow-md hover:shadow-lg transition-all cursor-pointer
                `}
              >
                {card.buttonText}
              </button>
            </div>
          </div>
        );
      })}
    </div>
    </main>
    </div>
  );
}