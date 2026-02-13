import { Metadata } from 'next';
import { ArticlePreview } from '@/src/components/content-management/library/ArticlePreview';

export const metadata: Metadata = {
  title: 'Preview Article - Content Management',
  description: 'Preview article before publishing',
};

export default async function PreviewArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto py-6">
      <ArticlePreview articleId={id} />
    </div>
  );
}
