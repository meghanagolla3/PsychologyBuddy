import React from "react";

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your journey to emotional wellbeing in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start">
          {/* Step 1: Choose Mood */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 w-full max-w-[200px] h-[200px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 text-4xl">😊</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Choose Mood
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Choose your mood in seconds no pressure, just honesty
            </p>
          </div>

          {/* Step 2: AI Support */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 w-full max-w-[200px] h-[200px] bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <div className="text-green-600 text-4xl">🤖</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              AI Support
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Psychology buddy helps you understand why you feel that way
            </p>
          </div>

          {/* Step 3: Learn & Grow */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 w-full max-w-[200px] h-[200px] bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <div className="text-purple-600 text-4xl">📚</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Learn & Grow
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get personalized activities to boost your mood and build
              resilience
            </p>
          </div>

          {/* Step 4: Track Progress */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 w-full max-w-[200px] h-[200px] bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
              <div className="text-orange-600 text-4xl">📈</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Track Progress
            </h3>
            <p className="text-gray-600 leading-relaxed">
              See your emotional patterns and celebrate your growth over time
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
