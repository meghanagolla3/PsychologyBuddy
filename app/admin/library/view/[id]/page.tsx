import { Metadata } from 'next';
import { StudentArticleView } from '@/src/components/content-management/library/StudentArticleView';

export const metadata: Metadata = {
  title: 'Article View',
  description: 'Student-facing article view',
};

export default async function ViewArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto py-6">
      <StudentArticleView articleId={id} />
    </div>
  );
}
