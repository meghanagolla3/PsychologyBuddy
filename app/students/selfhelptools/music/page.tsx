'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Heart, Play } from 'lucide-react';
import { toast } from 'sonner';
import SearchHeader from '@/src/components/StudentDashboard/SelfHelpTools/MusicTherapy/SearchHeader';
import FilterTabs from '@/src/components/StudentDashboard/SelfHelpTools/MusicTherapy/FilterTabs';
import { PlayerModal } from '@/src/components/StudentDashboard/SelfHelpTools/MusicTherapy/PlayerModal';
import { MusicCardProps, CardProps } from '@/src/components/StudentDashboard/SelfHelpTools/MusicTherapy/MusicCard';

interface MusicResource {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  artist?: string;
  album?: string;
  coverImage?: string;
  categories?: any[];
  school?: {
    id: string;
    name: string;
  };
}

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Recommended');
  const [musicResources, setMusicResources] = useState<MusicResource[]>([]);
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

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    fetchSavedItems();
  }, []);

  // Fetch music resources on component mount
  useEffect(() => {
    fetchMusicResources();
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    fetchMusicResources(activeTab);
  }, [activeTab, searchQuery]);

  // Fetch saved music
  const fetchSavedItems = async () => {
    try {
      // For now, use a hardcoded student ID. In a real app, this would come from auth context
      const studentId = 'student-123'; // Replace with actual student ID from auth
      const response = await fetch(`/api/student/saved-music?studentId=${studentId}`);
      const result = await response.json();
      
      if (result.success) {
        const savedIds = new Set(result.data.map((item: { id: string }) => item.id) as string[]);
        setSavedItems(savedIds);
        console.log('📚 Loaded saved music items:', savedIds.size);
      }
    } catch (error) {
      console.error('Error fetching saved music items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/student/music/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data || []);
      } else {
        console.error('Failed to fetch categories:', result.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMusicResources = async (category?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Handle search
      if (searchQuery) {
        params.append('query', searchQuery);
        const response = await fetch(`/api/student/music/search?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setMusicResources(result.data.resources || []);
        } else {
          toast.error(result.message || 'Failed to search music');
        }
      } else {
        // Handle category filtering
        if (category && category !== 'Recommended') {
          params.append('category', category);
          const response = await fetch(`/api/student/music/category?${params.toString()}`);
          const result = await response.json();
          
          if (result.success) {
            setMusicResources(result.data.resources || []);
          } else {
            toast.error(result.message || 'Failed to fetch music by category');
          }
        } else {
          // Get all music for "Recommended" tab
          const response = await fetch(`/api/student/music/resources?limit=20`);
          const result = await response.json();
          
          if (result.success) {
            setMusicResources(result.data.resources || []);
          } else {
            toast.error(result.message || 'Failed to fetch music resources');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching music resources:', error);
      toast.error('Failed to fetch music resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (music: MusicResource & { categories?: any[] }) => {
    console.log('handleCardClick - music data:', music);
    console.log('handleCardClick - coverImage:', music.coverImage);
    
    setSelectedCard({
      categories: music.categories || [],
      id: music.id,
      title: music.title,
      description: music.description,
      url: music.url,
      duration: formatDuration(music.duration),
      tracks: `${getTrackCount(music)} Tracks`,
      coverImage: music.coverImage,
      artist: music.artist,
      album: music.album
    });
    
    console.log('handleCardClick - selectedCard data:', {
      coverImage: music.coverImage,
      title: music.title
    });
    
    setShowPlayer(true);
  };

  const toggleSave = async (musicId: string) => {
    try {
      const studentId = 'student-123'; // Replace with actual student ID from auth
      
      const response = await fetch('/api/student/saved-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          musicId,
          studentId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSavedItems(prev => {
          const newSet = new Set(prev);
          if (result.isSaved) {
            newSet.add(musicId);
            toast.success('Added to saved items');
          } else {
            newSet.delete(musicId);
            toast.success('Removed from saved items');
          }
          return newSet;
        });
      } else {
        toast.error(result.message || 'Failed to save music');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save music');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} mins`;
  };

  const getTrackCount = (music: MusicResource) => {
    // This would come from the API, for now using a random number
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
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Music Therapy</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Relax your mind with soothing sounds
          </h2>
          <p className="text-gray-600 mb-6">
            Choose from our curated collection of therapeutic music
          </p>
          
          {/* Search and Show Saves */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <SearchHeader 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
            <button
              onClick={() => router.push('/students/selfhelptools/music/saved')}
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
          categories={categories.map(cat => cat.name)}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Music Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {musicResources.map((music) => (
              <div key={music.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Cover Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {music.coverImage ? (
                    <img
                      src={music.coverImage}
                      alt={music.title}
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
                    onClick={() => handleCardClick(music)}
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-blue-500 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{music.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{music.description}</p>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{formatDuration(music.duration)}</span>
                    <span>{getTrackCount(music)} Tracks</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleCardClick(music)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => toggleSave(music.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        savedItems.has(music.id)
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${savedItems.has(music.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && musicResources.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400 ml-1" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No music found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Player Modal */}
      {showPlayer && selectedCard && (
        <PlayerModal
          card={selectedCard}
          onClose={() => setShowPlayer(false)} categories={[]}        />
      )}
    </div>
  );
}
