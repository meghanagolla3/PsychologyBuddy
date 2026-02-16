'use client';

import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';

interface Article {
  id: string;
  title: string;
  description: string;
  readTime: string | null;
  thumbnailUrl: string | null;
  status: string;
  categories: Array<{
    category: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
  admin: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface CourseGridProps {
  selectedCategory?: string;
  showSaves?: boolean;
}

export default function CourseGrid({ selectedCategory = 'all', showSaves = false }: CourseGridProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        let response;
        
        // Fetch saved articles if showSaves is true
        if (showSaves) {
          const studentId = localStorage.getItem('studentId') || null;
          response = await fetch(`/api/student/saved-articles?studentId=${studentId}`);
        } else {
          response = await fetch('/api/student/library');
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const result = await response.json();
        
        if (result.success) {
          let filteredArticles = result.data;
          
          // Only sort and filter if not showing saved articles
          if (!showSaves) {
            // Sort by rating (highest first)
            filteredArticles.sort((a: any, b: any) => {
              // If articles have rating data, sort by rating
              if (a.averageRating !== undefined && b.averageRating !== undefined) {
                return b.averageRating - a.averageRating;
              }
              // Fallback: sort by creation date (newest first)
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            
            // Filter by selected category if not "all"
            if (selectedCategory !== 'all') {
              filteredArticles = filteredArticles.filter((article: Article) => 
                article.categories.some((cat: any) => 
                  cat.category.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                  cat.category.id === selectedCategory
                )
              );
            }
          }
          
          setArticles(filteredArticles);
        } else {
          setError(result.message || 'Failed to load articles');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching articles:', err);
        
        if (errorMessage.includes('Authentication required')) {
          setError('Please log in to view articles.');
        } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
          setError('You do not have permission to view articles.');
        } else {
          setError('Failed to load articles. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory, showSaves]);

  // Transform article data to match CourseCard props
  const transformArticleToCourse = (article: Article, index: number) => {
    // Get the first category name or use a default
    const category = article.categories.length > 0 
      ? article.categories[0].category.name 
      : 'General';
    
    // Map category to color (you can enhance this mapping)
    const colorMap: Record<string, string> = {
      'Stress Management': 'purple',
      'Emotional Intelligence': 'pink',
      'Mindfulness': 'blue',
      'Self-Growth': 'green',
      'Wellness': 'indigo',
      'Social Skill': 'orange',
      'Resilience': 'teal',
      'Communication': 'red',
    };
    
    const color = colorMap[category] || 'blue';
    
    return {
      id: article.id,
      title: article.title,
      category,
      time: article.readTime ? `${article.readTime} mins` : '5 mins',
      description: article.description,
      color,
      image: article.thumbnailUrl || `https://picsum.photos/400/300?random=${index + 1}`,
      delay: index,
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-3xl"></div>
            <div className="bg-white p-6 rounded-b-3xl border border-slate-100">
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          {showSaves 
            ? 'No saved articles yet. Start exploring and save articles you like!' 
            : 'No articles available at the moment.'
          }
        </div>
        <p className="text-gray-400">
          {showSaves 
            ? 'Articles you save will appear here for easy access.' 
            : 'Check back later for new content!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, index) => (
        <CourseCard 
          key={article.id} 
          {...transformArticleToCourse(article, index)} 
        />
      ))}
    </div>
  );
}
