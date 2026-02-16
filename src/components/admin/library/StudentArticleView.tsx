'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, User, Bookmark, BookmarkCheck, ArrowLeft, CheckCircle2, Edit2 } from 'lucide-react';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  bulletPoints: string[];
  image: string | null;
}

interface KeyTakeaway {
  id: string;
  text: string;
}

export const StudentArticleView = ({ articleId }: { articleId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [article, setArticle] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);
  
  // Initialize isSaved state with a safer approach
  const [isSaved, setIsSaved] = useState(false);
  
  // Get URL params for fallback
  const articleTitle = searchParams.get("title") || "";
  const articleCategory = searchParams.get("category") || "";
  const readTime = searchParams.get("readTime") || "5";
  const introText = searchParams.get("intro") || "";
  const headerImage = searchParams.get("headerImage") || null;
  const authorName = searchParams.get("author") || "";
  
  useEffect(() => {
    console.log('🔄 ArticleView useEffect triggered:', { articleId });
    if (articleId) {
      fetchArticle(articleId);
      fetchBlocks(articleId);
      // Check save status immediately without delay
      checkIfArticleIsSaved(articleId);
    }
  }, [articleId]);

  // Add a second effect to ensure save check runs
  useEffect(() => {
    if (articleId) {
      // Run save check after component is fully mounted
      const timer = setTimeout(() => {
        console.log('🔄 Second save check triggered');
        checkIfArticleIsSaved(articleId);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [articleId]);

  const fetchArticle = async (articleId: string) => {
    try {
      console.log('🔍 Fetching article with ID:', articleId);
      // Try student endpoint first, fallback to regular endpoint
      const response = await fetch(`/api/student/library/${articleId}`);
      let data = await response.json();
      
      if (!response.ok || !data.success) {
        // Fallback to regular article endpoint
        console.log('🔄 Trying regular article endpoint...');
        const fallbackResponse = await fetch(`/api/articles/${articleId}`);
        data = await fallbackResponse.json();
      }
      
      console.log('📄 Article response:', data);
      if (data.success) {
        console.log('🖼️ Article thumbnailUrl:', data.data.thumbnailUrl);
        console.log('🖼️ Full article data:', JSON.stringify(data.data, null, 2));
        setArticle(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (articleId: string) => {
    try {
      console.log('🔍 Fetching blocks for article:', articleId);
      
      // Fetch all block types from their dedicated endpoints
      const [sectionsRes, bulletListsRes, imagesRes, takeawaysRes, reflectionsRes, linksRes] = await Promise.all([
        fetch(`/api/articles/${articleId}/blocks/sections`),
        fetch(`/api/articles/${articleId}/blocks/bullet-lists`),
        fetch(`/api/articles/${articleId}/blocks/images`),
        fetch(`/api/articles/${articleId}/blocks/key-takeaways`),
        fetch(`/api/articles/${articleId}/blocks/reflections`),
        fetch(`/api/articles/${articleId}/blocks/links`)
      ]);

      const allBlocks = [];
      
      // Process sections
      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        const sectionsArray = sectionsData.data || sectionsData;
        console.log('📝 Sections loaded:', sectionsArray.length, sectionsArray);
        allBlocks.push(...sectionsArray.map((s: any) => ({
          ...s,
          type: 'section'
        })));
      }

      // Process bullet-lists
      if (bulletListsRes.ok) {
        const bulletListsData = await bulletListsRes.json();
        const bulletListsArray = bulletListsData.data || bulletListsData;
        console.log('📝 Bullet-lists loaded:', bulletListsArray.length, bulletListsArray);
        allBlocks.push(...bulletListsArray.map((bl: any) => ({
          ...bl,
          type: 'bullet-list'
        })));
      }

      // Process images
      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        const imagesArray = imagesData.data || imagesData;
        console.log('🖼️ Images loaded:', imagesArray.length, imagesArray);
        allBlocks.push(...imagesArray.map((img: any) => ({
          ...img,
          type: 'image'
        })));
      }

      // Process key-takeaways
      if (takeawaysRes.ok) {
        const takeawaysData = await takeawaysRes.json();
        const takeawaysArray = takeawaysData.data || takeawaysData;
        console.log('⭐ Key-takeaways loaded:', takeawaysArray.length, takeawaysArray);
        allBlocks.push(...takeawaysArray.map((kt: any) => ({
          ...kt,
          type: 'key-takeaways'
        })));
      }

      // Process reflections
      if (reflectionsRes.ok) {
        const reflectionsData = await reflectionsRes.json();
        const reflectionsArray = reflectionsData.data || reflectionsData;
        console.log('🤔 Reflections loaded:', reflectionsArray.length, reflectionsArray);
        allBlocks.push(...reflectionsArray.map((ref: any) => ({
          ...ref,
          type: 'reflection'
        })));
      }

      // Process links
      if (linksRes.ok) {
        const linksData = await linksRes.json();
        const linksArray = linksData.data || linksData;
        console.log('🔗 Links loaded:', linksArray.length, linksArray);
        allBlocks.push(...linksArray.map((link: any) => ({
          ...link,
          type: 'link'
        })));
      }

      setBlocks(allBlocks);
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    }
  };

  const checkIfArticleIsSaved = async (articleId: string) => {
    try {
      const studentId = localStorage.getItem('studentId') || null;
      console.log('🔍 Checking if article is saved:', { articleId, studentId });
      
      const response = await fetch(`/api/articles/${articleId}/save/check?studentId=${studentId}`);
      console.log('📡 Save check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('� Save check response data:', data);
        setIsSaved(data.isSaved || false);
      } else {
        console.error('❌ Save check failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to check saved status:', error);
    }
  };

  const handleRating = async (rating: number) => {
    try {
      setUserRating(rating);
      setHasRated(true);
      
      // Get student ID from localStorage or context
      const studentId = localStorage.getItem('studentId') || 'anonymous';
      
      // Save rating to API
      await fetch(`/api/articles/${articleId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, studentId })
      });
      
      console.log('✅ Rating saved:', rating);
    } catch (error) {
      console.error('❌ Failed to save rating:', error);
    }
  };

  const handleUndoRating = async () => {
    try {
      setUserRating(0);
      setHasRated(false);
      
      // Get student ID from localStorage or context
      const studentId = localStorage.getItem('studentId') || 'anonymous';
      
      // Remove rating from API
      await fetch(`/api/articles/${articleId}/rate`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      
      console.log('🔄 Rating removed');
    } catch (error) {
      console.error('❌ Failed to remove rating:', error);
    }
  };

  const handleSaveArticle = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || null;
      console.log('💾 Save button clicked:', { articleId, studentId, isSaved, currentUIState: isSaved ? 'Saved' : 'Save' });
      
      if (isSaved) {
        // Unsave article
        console.log('🗑️ Unsaving article...');
        const response = await fetch(`/api/articles/${articleId}/save`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId })
        });
        
        console.log('📝 Unsave response status:', response.status);
        const result = await response.json();
        console.log('📝 Unsave response body:', result);
        
        if (response.ok) {
          setIsSaved(false);
          console.log('✅ Article unsaved successfully, UI state updated to false');
        } else {
          console.error('❌ Failed to unsave article:', response.status);
        }
      } else {
        // Save article
        console.log('💾 Saving article...');
        const response = await fetch(`/api/articles/${articleId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId })
        });
        
        console.log('📝 Save response status:', response.status);
        const result = await response.json();
        console.log('📝 Save response body:', result);
        
        if (response.ok) {
          setIsSaved(true);
          console.log('✅ Article saved successfully, UI state updated to true');
        } else if (response.status === 409) {
          // Article already saved - update UI state immediately
          setIsSaved(true);
          console.log('🔄 Article was already saved, updating UI state to true immediately');
        } else {
          console.error('❌ Failed to save article:', response.status);
        }
      }
    } catch (error) {
      console.error('❌ Failed to save/unsave article:', error);
    }
  };

  const handleBackToLibrary = () => {
    router.push('/students/content/library');
  };

  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'section':
        return (
          <div key={block.id} className="bg-white rounded-[32px] shadow-sm p-8">
            {block.title && (
              <h2 className="text-[20px] font-bold text-[#2F3D43] mb-4">{block.title}</h2>
            )}
            {block.content && (
              <p className="text-[#655E61] leading-relaxed text-[16px]">{block.content}</p>
            )}
          </div>
        );

      case 'bullet-list':
        return (
          <div key={block.id} className="bg-white rounded-[32px] shadow-sm p-8">
            {block.title && (
              <h2 className="text-[20px] font-bold text-[#2F3D43] mb-6">{block.title}</h2>
            )}
            {block.items && block.items.length > 0 && (
              <ul className="space-y-4">
                {block.items.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span className="text-[#655E61] text-[16px] leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="bg-white rounded-[32px] shadow-sm p-8">
            {block.src && (
              <img
                src={block.src}
                alt={block.altText || ''}
                className="w-full rounded-lg object-cover"
              />
            )}
            {block.altText && (
              <p className="text-sm text-gray-500 mt-4 text-center italic">{block.altText}</p>
            )}
          </div>
        );

      case 'key-takeaways':
        return (
          <div key={block.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[32px] p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center">
                <Star className="h-5 w-5 text-[#f59f0a] fill-[#f59f0a]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Key Takeaways</h3>
            </div>
            <ul className="space-y-4">
              {(block.items || []).map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                  <span className="text-[#655E61] text-[16px] leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'reflection':
        return (
          <div key={block.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-[32px] p-8 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Edit2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reflect & Think</h3>
            </div>
            <div className="bg-white/70 rounded-lg p-6 border border-purple-100">
              <p className="text-[#655E61] text-[16px] leading-relaxed italic text-center">{block.content}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-muted-foreground mb-2">Article not found</p>
            <p className="text-sm text-muted-foreground">The article you're trying to view doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = article?.categories?.[0]?.category?.name || article?.categories?.[0]?.name || articleCategory || "General";
  const finalHeaderImage = article?.thumbnailUrl || headerImage || null;
  
  console.log('🎨 Rendering article with:', {
    title: article?.title,
    categories: article?.categories,
    categoryName: categoryName,
    thumbnailUrl: article?.thumbnailUrl,
    headerImage: finalHeaderImage
  });
 
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-[1154px] mx-auto px-4 py-8">
        <button
                    onClick={() => router.push('/students/content/library')}
                    className="flex cursor-pointer items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 sm:mb-9 transition-colors"
                  >
                    <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="text-[14px] sm:text-[16px]">Back to Library</span>
                  </button>
        {/* Article Header */}
        <div className="bg-linear-to-r from-[#EC2C92] to-[#FF64B7] h-[208px] rounded-[16px] shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            {/* <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {article?.authorName?.[0] || authorName?.[0] || 'A'}
              </span>
            </div> */}
            {/* <div>
              <p className="text-sm text-gray-600">Written by</p>
              <p className="font-semibold text-gray-900">{article?.authorName || authorName || 'Anonymous'}</p>
            </div> */}
            <Badge variant="secondary" className="bg-white/20 text-[10px] text-white border-white/50 font-base">
              {categoryName}
            </Badge>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white " />
              <span className='text-white text-[12px]'>{article?.readTime || readTime || 5} min read</span>
            </div>
          </div>
          
          <h1 className="text-[32px] font-bold text-white mb-2 leading-tight">
            {article?.title || 'Untitled Article'}
          </h1>
          
          <p className="text-[14px] text-[#F5F5F5] mb-6 leading-relaxed">
            {article?.description || introText || 'No description available.'}
          </p>
          
          <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <User className="h-4 w-4" />
                    <span>{article?.author || 'Unknown Author'}</span>
                  </div>
                  
                </div>
                <div className="flex items-center gap-2 ">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveArticle}
                    className={`flex items-center gap-2 ${
                      isSaved 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-white hover:text-gray-800'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
        </div>

        {/* Article Content */}
        <div className="space-y-8">
          {blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => renderBlock(block))}
        </div>

        {/* Rating Section */}
        <div className="bg-background px-6 pb-8">
          <div className="max-w-3xl mx-auto">
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">How helpful was this article?</h3>
                <p className="text-sm text-muted-foreground mb-4">Your feedback helps us improve</p>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= (userRating || 0) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                      onClick={() => !hasRated && handleRating(star)}
                    />
                  ))}
                </div>
                <div className="flex justify-center gap-4">
                  <Badge variant="outline" className="text-xs">
                    {hasRated ? 'Thank you for your feedback!' : 'Click to rate this article'}
                  </Badge>
                  {hasRated && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleUndoRating}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Undo Rating
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
}
