import { CounselorLayout } from '@/src/components/counselor/layout/CounselorLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CounselorLayout>{children}</CounselorLayout>;
}
