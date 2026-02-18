'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Heart, Play } from 'lucide-react';
import { toast } from 'sonner';
import SearchHeader from '@/src/components/StudentDashboard/SelfHelpTools/Meditation/SearchHeader';
import FilterTabs from '@/src/components/StudentDashboard/SelfHelpTools/Meditation/FilterTabs';
import { PlayerModal } from '@/src/components/StudentDashboard/SelfHelpTools/Meditation/PlayerModal';
import { MeditationCardProps, CardProps } from '@/src/components/StudentDashboard/SelfHelpTools/Meditation/MeditationCard';

interface MeditationResource {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSec?: number;
  instructor?: string;
  type?: string;
  format?: string;
  status?: string;
  categories?: {
    category: {
      id: string;
      name: string;
      description?: string;
    };
  }[];
  goals?: {
    goal: {
      id: string;
      name: string;
      description?: string;
    };
  }[];
  school?: {
    id: string;
    name: string;
  };
}

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Recommended');
  const [meditationResources, setMeditationResources] = useState<MeditationResource[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      const timer = setTimeout(() => {
        setSearchQuery(query);
      }, 300); // 300ms delay

      return () => clearTimeout(timer);
    },
    []
  );

  // Handle search with debounce
  const handleSearchChange = (query: string) => {
    debouncedSearch(query);
  };

  // Fetch categories on component mount and when page gets focus
  useEffect(() => {
    fetchCategories();
    fetchSavedItems();
  }, []);

  // Also fetch categories when window gets focus (in case admin added new categories)
  useEffect(() => {
    const handleFocus = () => {
      fetchCategories();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Fetch meditation resources on component mount
  useEffect(() => {
    fetchMeditationResources();
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    fetchMeditationResources(activeTab);
  }, [activeTab, searchQuery]);

  const fetchCategories = async () => {
    try {
      console.log('🔄 Fetching categories...');
      const response = await fetch('/api/students/meditation/categories');
      const result = await response.json();
      
      console.log('📊 Categories response:', result);
      
      if (result.success) {
        console.log('✅ Categories fetched:', result.data?.length || 0);
        setCategories(result.data || []);
      } else {
        console.error('❌ Failed to fetch categories:', result.message);
      }
    } catch (error) {
      console.error('💥 Error fetching categories:', error);
    }
  };

  // Fetch saved meditations
  const fetchSavedItems = async () => {
    try {
      // For now, use a hardcoded student ID. In a real app, this would come from auth context
      const studentId = 'student-123'; // Replace with actual student ID from auth
      const response = await fetch(`/api/student/saved-meditations?studentId=${studentId}`);
      const result = await response.json();
      
      if (result.success) {
        const savedIds: Set<string> = new Set(result.data.map((item: { id: string }) => item.id));
        setSavedItems(savedIds);
        console.log('📚 Loaded saved items:', savedIds.size);
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
    }
  };

  // Fetch meditation resources
  const fetchMeditationResources = async (category?: string) => {
    try {
      console.log('🔄 Fetching meditation resources...', { category, searchQuery });
      setLoading(true);
      const params = new URLSearchParams();
      
      // Handle search
      if (searchQuery) {
        console.log('🔍 Searching for:', searchQuery);
        params.append('search', searchQuery);
        const response = await fetch(`/api/students/meditation/search?${params.toString()}`);
        const result = await response.json();
        
        console.log('📊 Search results:', result);
        
        if (result.success) {
          console.log('✅ Search successful, meditations found:', result.data?.length || 0);
          setMeditationResources(result.data || []);
          
          // Refresh categories to get updated counts (in case new meditations were added)
          fetchCategories();
        } else {
          console.error('❌ Search failed:', result.message);
          toast.error(result.message || 'Failed to search meditation');
        }
      } else {
        // Handle category filtering
        if (category && category !== 'Recommended') {
          console.log('🏷️ Filtering by category:', category);
          
          // Find category ID by name
          const categoryObj = categories?.find(cat => cat.name === category);
          if (categoryObj) {
            params.append('categoryId', categoryObj.id);
            const response = await fetch(`/api/students/meditation?${params.toString()}`);
            const result = await response.json();
            
            console.log('📊 Category filter results:', result);
            
            if (result.success) {
              console.log('✅ Category filter successful, meditations found:', result.data?.length || 0);
              setMeditationResources(result.data || []);
              
              // Refresh categories to get updated counts (in case new meditations were added)
              fetchCategories();
            } else {
              console.error('❌ Category filter failed:', result.message);
              toast.error(result.message || 'Failed to filter by category');
            }
          } else {
            console.error('❌ Category not found:', category);
            toast.error('Category not found');
            setMeditationResources([]);
          }
        } else {
          console.log('📋 Loading all meditations (Recommended tab)');
          // Get all meditation for "Recommended" tab
          const response = await fetch(`/api/students/meditation?limit=20`);
          const result = await response.json();
          
          console.log('📊 All meditations results:', result);
          
          if (result.success) {
            console.log('✅ All meditations loaded:', result.data?.length || 0);
            setMeditationResources(result.data || []);
            
            // Refresh categories to get updated counts (in case new meditations were added)
            fetchCategories();
          } else {
            console.error('❌ Failed to load all meditations:', result.message);
            toast.error(result.message || 'Failed to fetch meditation resources');
          }
        }
      }
    } catch (error) {
      console.error('💥 Error fetching meditation resources:', error);
      toast.error('Failed to fetch meditation resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (meditation: MeditationResource & { categories?: any[] }) => {
    const mediaUrl = meditation.audioUrl || meditation.videoUrl || '';
    const mediaType = meditation.videoUrl ? 'video' : 'audio';
    
    setSelectedCard({
      categories: meditation.categories || [],
      id: meditation.id,
      title: meditation.title,
      description: meditation.description,
      url: mediaUrl,
      duration: formatDuration(meditation.durationSec || 0),
      type: mediaType,
      image: meditation.thumbnailUrl || "https://picsum.photos/seed/meditation/400/400",
      instructor: meditation.instructor
    });
    setShowPlayer(true);
  };

  const toggleSave = async (meditationId: string) => {
    try {
      const studentId = 'student-123'; // Replace with actual student ID from auth
      
      const response = await fetch('/api/student/saved-meditations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meditationId,
          studentId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSavedItems(prev => {
          const newSet = new Set(prev);
          if (result.isSaved) {
            newSet.add(meditationId);
            toast.success('Added to saved items');
          } else {
            newSet.delete(meditationId);
            toast.success('Removed from saved items');
          }
          return newSet;
        });
      } else {
        toast.error(result.message || 'Failed to save meditation');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save meditation');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 mins';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} mins`;
  };

  const getTrackCount = (meditation: MeditationResource) => {
    // This would come from API, for now using a random number
    return Math.floor(Math.random() * 20) + 8;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ChevronLeft className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Back to Self-Help Tools</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Find your inner peace with guided meditation
          </h2>
          <p className="text-gray-600 mb-6">
            Choose from our curated collection of mindfulness practices
          </p>
          
          {/* Search and Show Saves */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <SearchHeader 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
            <button
              onClick={() => router.push('/students/selfhelptools/meditation/saved')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              Show Saves
              {savedItems.size > 0 && (
                <span className="bg-white text-blue-500 text-xs font-bold px-2 py-1 rounded-full">
                  {savedItems.size}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          categories={categories?.map(cat => cat.name) || []}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Meditation Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {meditationResources.map((meditation) => (
              <div key={meditation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Cover Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {meditation.thumbnailUrl ? (
                    <img
                      src={meditation.thumbnailUrl}
                      alt={meditation.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-500 ml-1" />
                      </div>
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer"
                    onClick={() => handleCardClick(meditation)}
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-blue-500 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{meditation.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{meditation.description}</p>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{formatDuration(meditation.durationSec)}</span>
                    <span>{getTrackCount(meditation)} Sessions</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleCardClick(meditation)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => toggleSave(meditation.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        savedItems.has(meditation.id)
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${savedItems.has(meditation.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && meditationResources.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400 ml-1" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meditation found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Player Modal */}
      {showPlayer && selectedCard && (
        <PlayerModal
          card={selectedCard}
          onClose={() => setShowPlayer(false)}
          categories={categories}
        />
      )}
    </div>
  );
}
