'use client';

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { ParentLayout } from '@/src/components/parent/layout/ParentLayout';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
  ChevronUp,
  ChevronDown,
  Download,
  User,
  Mail,
  Calendar,
  Clock,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';

type Mode = 'edit' | 'preview';

interface Meeting {
  id: string;
  counselorId: string;
  studentId: string;
  parentName: string;
  date: string;
  time: string;
  purpose: string;
  level: string;
  status: string;
  discussion?: string;
  recommendations?: string;
  notes?: string;
  counselorName: string;
  counselorEmail: string;
  studentName: string;
  studentEmail: string;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
}

type SectionKey = 'purpose' | 'discussion' | 'recommendations' | 'notes';

const BulletList = memo(
  ({ items, color }: { items: string[]; color: string }) => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-slate-400 italic px-4">No details provided</p>;
    }
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
  }: {
    k: SectionKey;
    title: string;
    isOpen: boolean;
    onToggle: (k: SectionKey) => void;
    number?: number;
    numberBg?: string;
    icon?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
  }) => {
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


export default function ParentMeetingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [meeting, setMeeting] = useState<Meeting | null>(null);


  const [open, setOpen] = useState<
    Record<SectionKey, boolean>
  >({
    purpose: true,
    discussion: true,
    recommendations: true,
    notes: true,
  });

  const toggle = useCallback(
    (key: SectionKey) => {
      setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    []
  );

  const [purpose, setPurpose] = useState('');
  const [discussion, setDiscussion] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchMeeting = async () => {
      try {
        setLoading(true);

        const resolvedParams = await params;

        const response = await fetch(
          `/api/parent/parent-meetings/${resolvedParams.id}`
        );

        if (!response.ok) return;

        const result = await response.json();

        if (!active) return;

        if (result.success) {
          const data = result.data;

          setMeeting(data);

          setPurpose(data.purpose || '');

          let discussionArray = [];
          if (data.discussion && typeof data.discussion === 'string' && data.discussion.trim()) {
            discussionArray = data.discussion
              .split('\n')
              .filter((x: string) => x.trim());
          } else if (Array.isArray(data.discussion)) {
            discussionArray = data.discussion;
          }
          setDiscussion(discussionArray);

          let recommendationsArray = [];
          if (data.recommendations && typeof data.recommendations === 'string' && data.recommendations.trim()) {
            recommendationsArray = data.recommendations
              .split('\n')
              .filter((x: string) => x.trim());
          } else if (Array.isArray(data.recommendations)) {
            recommendationsArray = data.recommendations;
          }
          setRecommendations(recommendationsArray);

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

  const info = useMemo(() => {
    if (!meeting) return [];

    const meetingDate = new Date(meeting.date);

    return [
      {
        icon: <User className="w-4 h-4" />,
        label: 'Parent Name',
        value: meeting.parentName || 'N/A',
      },
      {
        icon: <Mail className="w-4 h-4" />,
        label: 'Email Id',
        value: meeting.studentEmail || 'N/A',
      },
      {
        icon: <Calendar className="w-4 h-4" />,
        label: 'Meeting Date',
        value: new Date(meeting.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      },
      {
        icon: <Clock className="w-4 h-4" />,
        label: 'Meeting Time',
        value: meeting.time,
      },
      {
        icon: <GraduationCap className="w-4 h-4" />,
        label: 'Student Name',
        value: meeting.studentName,
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

      const element = document.getElementById("parent-meeting-content");

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
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach(style => {
            if (style.textContent) {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (    <ParentLayout>
      <div className="min-h-screen ">
        <header className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[32px] font-bold text-[#3A3A3A]">Meeting Details</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-[#707D8F]">
                <span>{meeting?.studentName}</span>
                <span>·</span>
                <span>{meeting?.studentEmail}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-[#2D85F2] hover:bg-[#2D85F2]/90 text-white rounded-[12px] px-6 py-2.5 shadow-sm shadow-[#2D85F2]/20 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Report
                </>
              )}
            </button>
          </div>
          
          <button 
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#707D8F] hover:text-[#3A3A3A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Meetings
          </button>
        </header>

        <main id="parent-meeting-content" className="mx-auto max-w-7xl px-4 space-y-4 pb-20">
          {/* Summary Card */}
          <section className="bg-[#FEFEFE] rounded-[24px] border border-[#D5DAE0] p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {info.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center gap-2 text-[#707D8F]">
                    {item.icon}
                    <span className="text-xs font-medium uppercase tracking-wider">{item.label}</span>
                  </div>
                  <div className="text-base font-semibold text-[#3A3A3A]">
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
              <p className="text-sm text-slate-700">{purpose || 'No purpose specified'}</p>
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
            title="Counselor Notes"
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
    </ParentLayout>
  );
}
