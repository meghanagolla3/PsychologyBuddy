"use client";

import { Sparkles } from "lucide-react";

export default function DailyMotivation() {
  return (
    <div
      className="rounded-2xl p-5 border border-green-100 bg-gradient-to-br 
                 from-green-50 to-green-100 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-green-600" />
        <h3 className="text-sm font-semibold text-green-700">
          Daily Motivation
        </h3>
      </div>

      <p className="mt-3 text-gray-700 text-sm leading-relaxed">
        “It’s okay to not be okay, as long as you are not giving up.”
      </p>

      <p className="mt-2 text-xs text-gray-500">— Jessie Samburu</p>
    </div>
  );
}