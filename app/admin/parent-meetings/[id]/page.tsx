'use client';

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { AdminHeader } from '@/src/components/admin/layout/AdminHeader';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
  Mail,
  Calendar,
  User,
  GraduationCap,
  Clock,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Eye,
  Download,
} from 'lucide-react';

type SectionKey =
  | 'consent'
  | 'purpose'
  | 'discussion'
  | 'recommendations'
  | 'notes';

interface Meeting {
  id: string;
  studentName: string;
  studentEmail: string;
  counselorName: string;
  counselorEmail: string;
  date: string;
  time: string;
  purpose: string;
  level: string;
  studentClass?: string;
  status:
    | 'SCHEDULED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'PENDING'
    | 'IN_PROGRESS';

  parentName: string;
  parentEmail: string;
  parentId?: string;

  requestedBy: 'COUNSELOR' | 'PARENT';

  notes?: string;
  discussion?: string;
  recommendations?: string;

  createdAt: string;
  updatedAt: string;
}

interface SectionShellProps {
  k: SectionKey;
  title: string;
  isOpen: boolean;
  onToggle: (k: SectionKey) => void;
  number?: number;
  numberBg?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}

const SectionShell = memo(
  ({
    k,
    title,
    isOpen,
    onToggle,
    number,
    numberBg,
    icon,
    right,
    children,
  }: SectionShellProps) => {
    return (
      <section className="bg-white rounded-[22px] border border-slate-200">
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2.5">
            {number !== undefined ? (
              <span
                className={`w-6 h-6 rounded-full ${numberBg} text-white text-xs font-semibold flex items-center justify-center`}
              >
                {number}
              </span>
            ) : (
              icon
            )}

            <h2 className="text-[16px] font-medium text-[#3A3A3A]">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {right}

            <button
              type="button"
               onClick={() => onToggle(k)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {isOpen && (
          <div className="px-7 pb-4">
            {children}
          </div>
        )}
      </section>
    );
  }
);

SectionShell.displayName = 'SectionShell';

interface BulletListProps {
  items: string[];
  color: string;
}

const BulletList = memo(
  ({ items, color }: BulletListProps) => {
    return (
      <ul className="space-y-2 px-4">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-2 p-1 text-sm text-slate-700"
          >
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full ${color} shrink-0`}
            />

            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
);

BulletList.displayName = 'BulletList';

export default function AdminParentMeetingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [open, setOpen] = useState<
    Record<SectionKey, boolean>
  >({
    consent: true,
    purpose: true,
    discussion: true,
    recommendations: true,
    notes: true,
  });

  const [purpose, setPurpose] =
    useState('');

  const [discussion, setDiscussion] =
    useState<string[]>([]);

  const [
    recommendations,
    setRecommendations,
  ] = useState<string[]>([]);

  const [notes, setNotes] =
    useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const fetchMeeting = async () => {
      try {
        setLoading(true);

        const resolvedParams =
          await params;

        const response = await fetch(
          `/api/counselor/parent-meetings/${resolvedParams.id}`
        );

        if (!response.ok) return;

        const result =
          await response.json();

        if (!active) return;

        if (result.success) {
          const data = result.data;

          setMeeting(data);

          setPurpose(data.purpose || '');

          // Handle discussion - check if it's a string or already parsed
          let discussionArray = [];
          if (data.discussion && typeof data.discussion === 'string' && data.discussion.trim()) {
            discussionArray = data.discussion
              .split('\n')
              .filter((x: string) => x.trim());
          } else if (Array.isArray(data.discussion)) {
            discussionArray = data.discussion;
          }
          setDiscussion(discussionArray);

          // Handle recommendations - check if it's a string or already parsed
          let recommendationsArray = [];
          if (data.recommendations && typeof data.recommendations === 'string' && data.recommendations.trim()) {
            recommendationsArray = data.recommendations
              .split('\n')
              .filter((x: string) => x.trim());
          } else if (Array.isArray(data.recommendations)) {
            recommendationsArray = data.recommendations;
          }
          setRecommendations(recommendationsArray);

          // Handle notes - check if it's a string or already parsed
          let notesArray = [];
          if (data.notes && typeof data.notes === 'string' && data.notes.trim()) {
            notesArray = data.notes
              .split('\n')
              .filter((x: string) => x.trim());
          } else if (Array.isArray(data.notes)) {
            notesArray = data.notes;
          }
          setNotes(notesArray);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMeeting();

    return () => {
      active = false;
    };
  }, [params]);

  const toggle = useCallback(
    (k: SectionKey) => {
      setOpen((prev) => ({
        ...prev,
        [k]: !prev[k],
      }));
    },
    []
  );

  const info = useMemo(() => {
    if (!meeting) return [];

    return [
      {
        icon: <User className="w-4 h-4" />,
        label: 'Parent Name',
        value: meeting.parentName || 'N/A',
      },
      {
        icon: <Mail className="w-4 h-4" />,
        label: 'Email Id',
        value:
          meeting.parentEmail || 'N/A',
      },
      {
        icon: (
          <Calendar className="w-4 h-4" />
        ),
        label: 'Meeting Date Time',
        value: `${meeting.date} - ${meeting.time}`,
      },
      {
        icon: (
          <GraduationCap className="w-4 h-4" />
        ),
        label: 'Student Name',
        value: meeting.studentName,
      },
      {
        icon: <User className="w-4 h-4" />,
        label: 'Class/Batch',
        value: meeting.studentClass || meeting.level || 'N/A',
      },
      {
        icon: <Clock className="w-4 h-4" />,
        label: 'Duration',
        value: '30 mins',
      },
    ];
  }, [meeting]);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Wait for DOM to fully render
      await new Promise((resolve) => setTimeout(resolve, 800));

      const element = document.getElementById("admin-meeting-content");

      if (!element) {
        throw new Error("Report element not found");
      }

      // Ensure A4 layout BEFORE capture
      element.style.width = "794px";   // A4 width (96 DPI)
      element.style.minHeight = "1123px";
      element.style.background = "#ffffff";
      element.style.padding = "40px";
      element.style.boxSizing = "border-box";

      // Capture canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          // IMPORTANT: html2canvas crashes on oklch/lab colors.
          // We must strip them from the cloned document before it tries to parse them.
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach(style => {
            if (style.textContent) {
              // Remove variables and rules using oklch/lab/lch
              style.textContent = style.textContent
                .replace(/oklch\([^)]+\)/g, '#ffffff') 
                .replace(/lab\([^)]+\)/g, '#ffffff')
                .replace(/lch\([^)]+\)/g, '#ffffff');
            }
          });
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;

      // Handle multi-page
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      // File name
      const studentName = meeting?.studentName ? meeting.studentName.replace(/\s+/g, '_') : "student";
      const date = new Date().toISOString().split("T")[0];
      const filename = `meeting_report_${studentName}_${date}.pdf`;

      // Download
      pdf.save(filename);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to download PDF report");
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Parent Meeting Details"
        subtitle={`${meeting?.studentName} • ${meeting?.studentEmail}`}
        showSchoolFilter={false}
        showTimeFilter={false}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-[13px] border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-[14px] font-medium text-[#1E293B] hover:bg-[#E2E8F0] disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1E293B] border-t-transparent" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" /> Download
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-8xl px-6 py-4">
        <button 
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meetings
        </button>

      <main id="admin-meeting-content" className="mx-auto max-w-6xl px-4 py-4 space-y-3 pb-10">
        <section className="bg-[#FEFEFE] rounded-[12px] border border-[#E5E5E5] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {info.map((item) => (
              <div key={item.label}>
                <div className="flex items-center gap-1.5 text-[16px] text-[#939393] mb-2">
                  <span className="text-[#939393]">
                    {item.icon}
                  </span>

                  {item.label}
                </div>

                <div className="text-[16px] font-medium text-[#3A3A3A]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>
         
        <SectionShell
          k="purpose"
          title="Meeting Purpose"
          isOpen={open.purpose}
          onToggle={toggle}
          number={1}
          numberBg="bg-[#16A249]"
        >
          <div className="bg-[#EEFEF4] border border-[#B8D8C4] rounded-[16px] p-5">
            <p className="text-sm text-slate-700">
              {purpose}
            </p>
          </div>
        </SectionShell>

        <SectionShell
          k="discussion"
          title="Discussion Summary"
          isOpen={open.discussion}
          onToggle={toggle}
          number={2}
          numberBg="bg-[#3496D0]"
        >
          <BulletList
            items={discussion}
            color="bg-[#3496D0]"
          />
        </SectionShell>

        <SectionShell
          k="recommendations"
          title="Recommendations"
          isOpen={open.recommendations}
          onToggle={toggle}
          number={3}
          numberBg="bg-[#6A63E9]"
        >
          <BulletList
            items={recommendations}
            color="bg-[#6A63E9]"
          />
        </SectionShell>

        <SectionShell
          k="notes"
          title="Internal Notes"
          isOpen={open.notes}
          onToggle={toggle}
          number={4}
          numberBg="bg-[#EB941A]"
        >
          <BulletList
            items={notes}
            color="bg-[#EB941A]"
          />
        </SectionShell>
      </main>
      </div>
    </div>
  );
}
