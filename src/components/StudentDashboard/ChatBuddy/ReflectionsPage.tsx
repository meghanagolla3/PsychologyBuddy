"use client";
import { useEffect, useState } from "react";
import { Search, ArrowLeft, BookOpen } from "lucide-react";
import Image from "next/image";
import { useServerAuth } from "@/src/hooks";
import { useRouter } from "next/navigation";
import { NavigationUtils } from "@/src/utils";
import { FullPageLoading } from "@/components/ui/LoadingSpinner";
import { AuthError } from "@/components/ui/ErrorMessage";
import SummaryModal from "./SummaryModal";

// Types
interface Reflection {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
  topics?: string[];
  messageCount?: number;
  sessionId?: string;
  // Include original summary fields for proper display
  mainTopic: string;
  conversationStart: string;
  conversationAbout: string;
  reflection: string;
}

export default function ReflectionsPage() {
  const { user, loading, error } = useServerAuth();
  const router = useRouter();
  
  // State hooks - must be called before any early returns
  const [activeTab, setActiveTab] = useState<"related" | "all">("related");
  const [search, setSearch] = useState("");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [filtered, setFiltered] = useState<Reflection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<{
    mainTopic: string;
    conversationStart: string;
    conversationAbout: string;
    reflection: string;
  } | null>(null);

  // Effects
  useEffect(() => {
    if (user) {
      fetchReflections();
    }
  }, [user]);

  // Functions must be defined before useEffect that uses them
  const findRelatedSummaries = (allReflections: Reflection[]) => {
    if (allReflections.length === 0) return [];
    
    // Get the most recent summary (first one, assuming they're sorted by date)
    const mostRecent = allReflections[0];
    
    // Combine all text from the most recent summary for comparison
    const recentText = [
      mostRecent.title?.toLowerCase() || '',
      mostRecent.conversationAbout?.toLowerCase() || '',
      mostRecent.reflection?.toLowerCase() || '',
      ...(mostRecent.topics?.map(t => t.toLowerCase()) || [])
    ].join(' ');
    
    // Calculate similarity scores for all other summaries
    const relatedScores = allReflections.slice(1).map(reflection => {
      const reflectionText = [
        reflection.title?.toLowerCase() || '',
        reflection.conversationAbout?.toLowerCase() || '',
        reflection.reflection?.toLowerCase() || '',
        ...(reflection.topics?.map(t => t.toLowerCase()) || [])
      ].join(' ');
      
      // Calculate similarity score based on common words
      const recentWords = recentText.split(' ').filter(word => word.length > 3);
      const reflectionWords = reflectionText.split(' ').filter(word => word.length > 3);
      
      const commonWords = recentWords.filter(word => reflectionWords.includes(word));
      const similarityScore = commonWords.length / Math.max(recentWords.length, reflectionWords.length);
      
      return {
        reflection,
        score: similarityScore
      };
    });
    
    // Sort by similarity score and take top 3
    const related = relatedScores
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0.1) // Only include summaries with some similarity
      .slice(0, 3)
      .map(item => item.reflection);
    
    console.log('Related summaries found:', related.length);
    return related;
  };

  const filterReflections = () => {
    let list = reflections;

    if (activeTab === "related") {
      list = findRelatedSummaries(reflections);
    }

    if (search.trim()) {
      list = list.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(list);
  };

  useEffect(() => {
    filterReflections();
  }, [search, activeTab, reflections]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <FullPageLoading message="Loading reflections..." />
      </div>
    );
  }

  const fetchReflections = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/students/summary?studentId=${user.id}`, {
        cache: "no-store",
      });

      const data = await res.json();
      if (data.success) {
        setReflections(data.data);
      }
    } catch (error) {
      console.error("Error fetching reflections:", error);
    }
  };

  // Add relative date function
  const getRelativeDate = (date: Date, reference: Date) => {
    const diffTime = Math.abs(reference.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return date < reference ? 'Yesterday' : 'Tomorrow';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // For older dates, show the actual date
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== reference.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleReflectionClick = (reflection: Reflection) => {
    // Use the original summary fields directly - no conversion needed
    const summaryData = {
      mainTopic: reflection.mainTopic,
      conversationStart: reflection.conversationStart,
      conversationAbout: reflection.conversationAbout,
      reflection: reflection.reflection,
      createdAt: reflection.createdAt
    };
    
    setSelectedSummary(summaryData);
    setIsModalOpen(true);
  };

  const handleImportToChat = () => {
    // Navigate to chat with the reflection content
    router.push(`/students/chat?import=${encodeURIComponent(selectedSummary?.reflection || '')}`);
  };

  const getTopicEmoji = (title: string, topics?: string[], conversationAbout?: string, reflection?: string) => {
    // Combine all text content for analysis
    const allText = [
      title?.toLowerCase() || '',
      conversationAbout?.toLowerCase() || '',
      reflection?.toLowerCase() || '',
      ...(topics?.map(t => t.toLowerCase()) || [])
    ].join(' ');
    
    console.log('Analyzing emoji for content:', allText.substring(0, 200) + '...');
    
    // Check for stress-related topics
    if (allText.includes('stress') || allText.includes('overwhelm') || allText.includes('pressure') || allText.includes('stress management')) {
      return { emoji: '😰', image: '/Summary/Sad.svg', color: '' };
    }

    // Check for happiness/positive emotions
    if (allText.includes('happy') || allText.includes('happiness') || allText.includes('joy') || allText.includes('excited') || allText.includes('good')) {
      return { emoji: '😊', image: '/Summary/Happy.svg', color: '' };
    }

    // Check for neutral/okay feelings
    if (allText.includes('normal') || allText.includes('okay') || allText.includes('fine') || allText.includes('alright')) {
      return { emoji: '😐', image: '/Summary/Okay.svg', color: '' };
    }

    // Check for nervousness/anxiety
    if (allText.includes('nervous') || allText.includes('nervousness') || allText.includes('anxious') || allText.includes('worry')) {
      return { emoji: '😟', image: '/Summary/Nervous.svg', color: '' };
    }
    
    // Check for anxiety-related topics
    if (allText.includes('anxiety') || allText.includes('panic') || allText.includes('fear') || allText.includes('concern')) {
      return { emoji: '😟', image: '/Summary/Worry.svg', color: '' };
    }
    
    // Check for sadness/depression topics
    if (allText.includes('sad') || allText.includes('depress') || allText.includes('down') || allText.includes('unhappy') || allText.includes('cry')) {
      return { emoji: '😢', image: '/Summary/Sad.svg', color: '' };
    }
    
    // Check for anger/frustration topics
    if (allText.includes('angry') || allText.includes('mad') || allText.includes('frustrat') || allText.includes('annoyed') || allText.includes('irritated')) {
      return { emoji: '😡', image: '/Summary/Angry.svg', color: '' };
    }
    
    // Check for relationship topics
    if (allText.includes('friend') || allText.includes('family') || allText.includes('relationship') || allText.includes('people') || allText.includes('social')) {
      return { emoji: '👥', image: '', color: '' };
    }
    
    // Check for school/academic topics
    if (allText.includes('school') || allText.includes('study') || allText.includes('exam') || allText.includes('homework') || allText.includes('academic') || allText.includes('class')) {
      return { emoji: '📚', image: '', color: '' };
    }
    
    // Check for sleep topics
    if (allText.includes('sleep') || allText.includes('tired') || allText.includes('insomnia') || allText.includes('rest') || allText.includes('exhausted')) {
      return { emoji: '😴', image: '', color: '' };
    }
    
    // Check for self-esteem topics
    if (allText.includes('confidence') || allText.includes('self-esteem') || allText.includes('worth') || allText.includes('proud') || allText.includes('believe')) {
      return { emoji: '💪', image: '', color: '' };
    }
    
    // Check for mindfulness/coping topics
    if (allText.includes('mindful') || allText.includes('breathing') || allText.includes('meditation') || allText.includes('relax') || allText.includes('calm') || allText.includes('cope')) {
      return { emoji: '🧘', image: '', color: '' };
    }
    
    // Check for health/body topics
    if (allText.includes('health') || allText.includes('body') || allText.includes('eating') || allText.includes('exercise') || allText.includes('physical')) {
      return { emoji: '🏃', image: '', color: '' };
    }
    
    // Check for growth/progress topics
    if (allText.includes('progress') || allText.includes('growth') || allText.includes('improve') || allText.includes('better') || allText.includes('develop')) {
      return { emoji: '🌱', image: '', color: '' };
    }
    
    // Check for support/help topics
    if (allText.includes('help') || allText.includes('support') || allText.includes('listen') || allText.includes('understand') || allText.includes('guidance')) {
      return { emoji: '🤝', image: '', color: '' };
    }
    
    // Default conversation emoji
    return { emoji: '💬', image: '', color: '' };
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header Section */}
      <div className="bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9">
          {/* Back Button */}
          <button
            onClick={() => router.push('/students/chat')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 sm:mb-9 transition-colors"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-[14px] sm:text-[16px]">Back to Chat</span>
          </button>

          {/* Title and Search Row */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6 mb-6 sm:mb-10">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <Image 
                src="/Icons/Reflections.png" 
                alt="Psychology Buddy Logo" 
                width={63}
                height={63}
                className="w-[46px] h-[46px] sm:w-[20px] sm:h-[20px] md:w-[36px] md:h-[36px] lg:w-[63px] lg:h-[63px]"
              />   
              <div className="ml-2">
                <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-gray-800 mb-1">Your Reflections</h1>
                <p className="text-[#686D70] text-[14px] sm:text-[16px]">Private notes from past conversations</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-initial">
                <input
                  placeholder="Search here"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full lg:w-[360px] h-[40px] sm:h-[47px] pl-4 pr-10 py-2.5 text-[#9f9f9f] border border-[#eaeaea] rounded-[25px] bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-[12px] sm:text-[14px]"
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9f9f9f] w-[18px] h-[18px]" size={20} />
              </div>
              <div className="relative">
                <select className="w-[80px] sm:w-[100px] h-[40px] sm:h-[47px] pl-6 sm:pl-8 pr-8 sm:pr-10 py-2 border border-[#eaeaea] rounded-[25px] bg-white text-xs sm:text-sm text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none appearance-none cursor-pointer">
                  <option>All</option>
                  <option>Recent</option>
                  <option>Oldest</option>
                </select>
                <svg className="absolute right-4 sm:right-7 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("related")}
              className={`w-[120px] sm:w-[151px] h-[45px] sm:h-[55px] px-4 sm:px-7 py-2.5 rounded-[16px] font-medium transition-all text-[12px] sm:text-[14px] sm:text-[16px] ${
                activeTab === "related"
                  ? "bg-[#1C76DC] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Related
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`w-[100px] sm:w-[129px] h-[45px] sm:h-[55px] px-4 sm:px-7 py-2.5 rounded-[16px] font-medium transition-all text-[12px] sm:text-[14px] sm:text-[16px] ${
                activeTab === "all"
                  ? "bg-[#1C76DC] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Helper Text */}
        <p className="text-[14px] sm:text-[16px] text-[#686D70] mb-4 sm:mb-5">
          Tap a reflection to continue from that context
        </p>

        {/* Reflection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full text-gray-500 text-center py-8 sm:py-12">
              <p className="text-[14px] sm:text-base">No reflections found.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleReflectionClick(item)}
                className="bg-white rounded-[16px] sm:rounded-[21px] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Emoji and Title */}
                <div className="flex items-center gap-2 sm:gap-3 mt-2 ml-2 sm:ml-3 mb-2">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getTopicEmoji(item.title, item.topics, item.conversationAbout, item.reflection).color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {(() => {
                      const emojiData = getTopicEmoji(item.title, item.topics, item.conversationAbout, item.reflection);
                      const isHappyEmoji = emojiData.emoji === '😊';
                      
                      return emojiData.image ? (
                        <Image 
                          src={emojiData.image}
                          alt={item.title}
                          width={isHappyEmoji ? 28 : 24}
                          height={isHappyEmoji ? 28 : 24}
                          className={`object-contain ${isHappyEmoji ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-6 h-6 sm:w-7 sm:h-7'}`}
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="${isHappyEmoji ? 'text-xl sm:text-3xl' : 'text-lg sm:text-xl'}">${emojiData.emoji}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className={isHappyEmoji ? 'text-xl sm:text-3xl' : 'text-lg sm:text-xl'}>
                          {emojiData.emoji}
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 flex-1 line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-400 ml-4 sm:ml-5 mb-3">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] sm:text-xs">
                    {getRelativeDate(new Date(item.createdAt), new Date())}
                  </span>
                </div>

                {/* Content Preview */}
                <p className="text-xs sm:text-sm ml-4 sm:ml-5 mr-2 sm:mr-5 mb-3 sm:mb-4 text-gray-500 leading-relaxed line-clamp-3">
                  {item.conversationAbout}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary Modal */}
      <SummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        summary={selectedSummary}
        onImport={handleImportToChat}
      />
    </div>
  );
}
