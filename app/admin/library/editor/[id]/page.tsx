import { Metadata } from 'next';
import ArticleEditor from '@/src/components/admin/library/ArticleEditor';

export const metadata: Metadata = {
  title: 'Edit Article - Content Management',
  description: 'Edit article content and blocks',
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Debug: Log the ID from params
  console.log('EditArticlePage received id:', id);
  
  return (
    <div className="container mx-auto ">
      <ArticleEditor articleId={id} />
    </div>
  );
}
