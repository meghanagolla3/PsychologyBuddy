import { Metadata } from 'next';
import { ArticleList } from '@/src/components/admin/library/ArticleList';

export const metadata: Metadata = {
  title: 'Psychoeducation Library - Admin',
  description: 'Manage psychoeducation articles and content',
};

export default function LibraryPage() {
  return <ArticleList />;
}
