'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Clock, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  thumbnailUrl?: string;
  description: string;
  readTime?: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
  categories?: Array<{ id: string; name: string }>;
  moods?: Array<{ id: string; name: string }>;
  goals?: Array<{ id: string; name: string }>;
}

interface ArticleBlock {
  id: string;
  type: 'section' | 'image' | 'list' | 'takeaways' | 'reflection' | 'link' | 'divider';
  order: number;
  content: any;
}

interface BlockContent {
  section?: { title: string; text: string };
  image?: { src: string; alt: string };
  list?: { title: string; items: string[] };
  takeaways?: { points: string[] };
  reflection?: { title: string; content: string };
  link?: { title: string; url: string; description?: string };
  divider?: {};
}

export function ArticlePreview({ articleId }: { articleId: string }) {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);

  useEffect(() => {
    fetchArticle();
    fetchBlocks();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json();
      if (data.success) {
        setArticle(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/blocks`);
      const data = await response.json();
      if (data.success) {
        setBlocks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    }
  };

  const renderBlock = (block: ArticleBlock) => {
    const content = block.content as BlockContent;

    switch (block.type) {
      case 'section':
        return (
          <div className="prose max-w-none">
            {content.section?.title && (
              <h2 className="text-2xl font-bold mb-4">{content.section.title}</h2>
            )}
            {content.section?.text && (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {content.section.text}
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="my-8">
            {content.image?.src && (
              <img
                src={content.image.src}
                alt={content.image.alt || ''}
                className="w-full rounded-lg shadow-md"
              />
            )}
            {content.image?.alt && (
              <p className="text-sm text-gray-500 mt-2 italic">{content.image.alt}</p>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="my-6">
            {content.list?.title && (
              <h3 className="text-xl font-semibold mb-4">{content.list.title}</h3>
            )}
            <ul className="space-y-2">
              {(content.list?.items || []).map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'takeaways':
        return (
          <div className="my-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Takeaways</h3>
            <ul className="space-y-2">
              {(content.takeaways?.points || []).map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-blue-800">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'reflection':
        return (
          <div className="my-8 bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">
              {content.reflection?.title || 'Reflection'}
            </h3>
            <div className="text-purple-800 italic">
              {content.reflection?.content}
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="my-6">
            <a
              href={content.link?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{content.link?.title}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            {content.link?.description && (
              <p className="text-gray-600 mt-2 text-sm">{content.link.description}</p>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className="my-12 flex items-center justify-center">
            <div className="w-full border-t border-gray-300">
              <div className="flex justify-center">
                <div className="bg-white px-4">
                  <div className="w-8 h-px bg-gray-400"></div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading preview...</div>;
  }

  if (!article) {
    return <div className="flex justify-center py-8">Article not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin/library">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>
        </Link>
        <Link href={`/admin/library/editor/${articleId}`}>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Article
          </Button>
        </Link>
      </div>

      {/* Article Preview Card */}
      <Card className="mb-8">
        <CardContent className="p-8">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                {article.status}
              </Badge>
              {article.readTime && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {article.readTime} min read
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            
            {article.subtitle && (
              <h2 className="text-xl text-gray-600 mb-6">{article.subtitle}</h2>
            )}

            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {article.author}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(article.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {article.thumbnailUrl && (
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {article.description}
            </p>

            {/* Labels */}
            <div className="flex flex-wrap gap-2 mb-6">
              {article.categories?.map((category) => (
                <Badge key={category.id} variant="outline">
                  {category.name}
                </Badge>
              ))}
              {article.moods?.map((mood) => (
                <Badge key={mood.id} variant="outline">
                  {mood.name}
                </Badge>
              ))}
              {article.goals?.map((goal) => (
                <Badge key={goal.id} variant="outline">
                  {goal.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            {blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <div key={block.id}>
                  {renderBlock(block)}
                </div>
              ))}
          </div>

          {/* Empty State */}
          {blocks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No content blocks yet</p>
              <p className="text-sm">
                This article doesn't have any content blocks. 
                <Link href={`/admin/library/editor/${articleId}`}>
                  <Button variant="link" className="p-0 h-auto">
                    Edit the article
                  </Button>
                  {' '}to add content.
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
