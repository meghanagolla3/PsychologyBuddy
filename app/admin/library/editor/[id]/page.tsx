import { Metadata } from 'next';
import ArticleEditor from '@/src/components/admin/library/ArticleEditor';

// Add page-level debugging
console.log('📄 EditArticlePage.tsx file loaded - you should see this immediately');
console.log('✅ ArticleEditor imported successfully:', typeof ArticleEditor);

export const metadata: Metadata = {
  title: 'Edit Article - Content Management',
  description: 'Edit article content and blocks',
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  console.log('🚀 EditArticlePage component function called');
  
  const { id } = await params;
  
  // Debug: Log the ID from params
  console.log('EditArticlePage received id:', id);
  console.log('🔍 About to render ArticleEditor with articleId:', id);
  
  return (
    <div className="container mx-auto ">
      <ArticleEditor articleId={id} />
    </div>
  );
}
