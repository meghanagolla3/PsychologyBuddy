import { StudentArticleView } from '@/src/components/admin/library/StudentArticleView';
import StudentLayout from '@/src/components/StudentDashboard/Layout/StudentLayout';

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto">
      <StudentLayout>
      <StudentArticleView articleId={id} />
      </StudentLayout>
    </div>
  );
}
