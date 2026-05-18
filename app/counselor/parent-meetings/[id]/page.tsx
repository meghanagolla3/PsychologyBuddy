'use client';

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

import {
  Mail,
  Calendar,
  User,
  GraduationCap,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  ArrowLeft,
  Pencil,
  Eye,
  Save,
  Download,
} from 'lucide-react';
import { AdminLoader } from '@/src/components/admin/ui/AdminLoader';

type SectionKey =
  | 'consent'
  | 'purpose'
  | 'discussion'
  | 'recommendations'
  | 'notes';

type Mode = 'edit' | 'preview';

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

interface EditableListProps {
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  draft: string;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  color: string;
  inputBorder: string;
  inputBg: string;
  ringColor: string;
}

const EditableList = memo(
  ({
    items,
    setItems,
    draft,
    setDraft,
    color,
    inputBorder,
    inputBg,
    ringColor,
  }: EditableListProps) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setDraft(e.target.value);
      },
      [setDraft]
    );

    const addItem = useCallback(() => {
      if (!draft.trim()) return;

      setItems((prev) => [...prev, draft.trim()]);
      setDraft('');
    }, [draft, setDraft, setItems]);

    const removeItem = useCallback(
      (index: number) => {
        setItems((prev) =>
          prev.filter((_, i) => i !== index)
        );
      },
      [setItems]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addItem();
        }
      },
      [addItem]
    );

    return (
      <>
        <ul className="space-y-2 mb-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-2 text-sm text-slate-700 group"
            >
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full ${color} shrink-0`}
              />

              <span className="flex-1">
                {item}
              </span>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-rose-500 hover:bg-rose-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a point..."
            className={`flex-1 px-3 py-3 text-sm rounded-[15px] border ${inputBorder} ${inputBg} focus:outline-none focus:ring-2 ${ringColor}`}
          />

          <button
            type="button"
            onClick={addItem}
            className="p-2 rounded-md text-emerald-600 hover:bg-emerald-50"
          >
            <Check className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setDraft('')}
            className="p-2 rounded-md text-rose-500 hover:bg-rose-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </>
    );
  }
);

EditableList.displayName = 'EditableList';

export default function ParentMeetingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [meeting, setMeeting] =
    useState<Meeting | null>(null);

  const [mode, setMode] =
    useState<Mode>('edit');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'preview') {
      setMode('preview');
    }
  }, [searchParams]);

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

  const [isCompleting, setIsCompleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [
    draftDiscussion,
    setDraftDiscussion,
  ] = useState('');

  const [draftRec, setDraftRec] =
    useState('');

  const [draftNote, setDraftNote] =
    useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handlePurposeChange =
    useCallback(
      (
        e: React.ChangeEvent<HTMLTextAreaElement>
      ) => {
        setPurpose(e.target.value);
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

  const handleSaveDraft =
    useCallback(async () => {
      try {
        if (!meeting?.id) {
          return;
        }

        setIsSaving(true);

        const response = await fetch(
          `/api/counselor/parent-meetings/${meeting.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              purpose,
              discussion: discussion.join('\n'),
              recommendations: recommendations.join('\n'),
              notes: notes.join('\n'),
            }),
          }
        );

        const result =
          await response.json();

        if (result.success) {
          alert(
            'Meeting details saved successfully'
          );
        } else {
          alert('Failed to save: ' + result.message);
        }
      } catch (error) {
        console.error('Save error:', error);
        alert('Could not save meeting details');
      } finally {
        setIsSaving(false);
      }
    }, [
      meeting,
      purpose,
      discussion,
      recommendations,
      notes,
    ]);

  const handleDownload = async () => {
    const originalMode = mode;

    try {
      setDownloading(true);

      // Step 1: Save form data if in edit mode
      if (mode === 'edit') {
        await handleSaveDraft();
      }

      // Small delay to ensure save completes
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: Switch to preview mode for capture
      setMode("preview");

      // Wait for DOM to fully render
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error("Could not create print iframe");

      // Step 4: Copy styles
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        doc.head.appendChild(style.cloneNode(true));
      });

      // Step 5: Copy content
      const content = document.getElementById("meeting-details-content");
      if (!content) throw new Error("Content not found");
      
      const clone = content.cloneNode(true) as HTMLElement;
      doc.body.appendChild(clone);

      // Step 6: Add print-specific styles
      const printStyle = doc.createElement('style');
      printStyle.textContent = `
        @page { size: A4; margin: 15mm; }
        body { background: white !important; padding: 0 !important; margin: 0 !important; }
        #meeting-details-content { width: 100% !important; border: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
        .no-print { display: none !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      `;
      doc.head.appendChild(printStyle);

      // Step 7: Wait for resources and print
      await new Promise(resolve => setTimeout(resolve, 1000));
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Step 8: Cleanup and restore mode
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        if (originalMode !== "preview") {
          setMode(originalMode);
        }
      }, 2000);

    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCompleteSession = useCallback(async () => {
    try {
      if (!meeting?.id) {
        alert('Meeting not found');
        return;
      }

      setIsCompleting(true);

      // First save any unsaved changes
      await handleSaveDraft();

      // Then update meeting status to COMPLETED
      const response = await fetch(
        `/api/counselor/parent-meetings/${meeting.id}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Session completed successfully!');
        router.push('/counselor/parent-meetings?tab=Completed');
      } else {
        alert('Failed to complete session: ' + result.message);
      }
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Could not complete session');
    } finally {
      setIsCompleting(false);
    }
  }, [meeting, handleSaveDraft, router]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AdminLoader size="lg" message="Loading meeting details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-8xl px-5 py-3">
        <button 
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meetings
        </button>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Parent Meeting Details</h1>
            <p className="text-sm text-[#64748B]">
              {meeting?.studentName} • {meeting?.studentEmail}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-[16px] bg-[#E2E8F0] p-1">
              <button
                onClick={() => setMode("edit")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-[13px] px-4 py-1.5 text-[14px] font-medium transition-colors",
                  mode === "edit"
                    ? "bg-[#3B82F6] text-[#FFFFFF] shadow-sm"
                    : "text-[#64748B] hover:text-[#1E293B]"
                )}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => setMode("preview")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[13px] px-4 py-1.5 text-[14px] font-medium transition-colors",
                  mode === "preview"
                    ? "bg-[#3B82F6] text-[#FFFFFF] shadow-sm"
                    : "text-[#64748B] hover:text-[#1E293B]"
                )}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            </div>

            {mode === 'edit' && (
              <button 
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-[13px] border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-[14px] font-medium text-[#1E293B] hover:bg-[#E2E8F0] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1E293B] border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" /> Save as Draft
                  </>
                )}
              </button>
            )}

            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-[13px] border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-[14px] font-medium text-[#1E293B] hover:bg-[#E2E8F0] disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1E293B] border-t-transparent" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" /> Download
                </>
              )}
            </button>
          </div>
        </div>

      <main id="meeting-details-content" className={`mx-auto max-w-6xl px-4 py-4 space-y-3 ${mode === 'edit' ? 'pb-14' : 'pb-4'}`}>
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
          {mode === 'edit' ? (
            <textarea
              value={purpose}
              onChange={
                handlePurposeChange
              }
              rows={4}
              className="w-full px-8 py-3 text-[16px] rounded-[16px] border border-[#B8D8C4] bg-[#EEFEF4] focus:outline-none focus:ring-2 focus:ring-[#B8D8C4]"
            />
          ) : (
            <div className="bg-[#EEFEF4] border border-[#B8D8C4] rounded-[16px] p-5">
              <p className="text-sm text-slate-700">
                {purpose}
              </p>
            </div>
          )}
        </SectionShell>

        <SectionShell
          k="discussion"
          title="Discussion Summary"
          isOpen={open.discussion}
          onToggle={toggle}
          number={2}
          numberBg="bg-[#3496D0]"
        >
          {mode === 'edit' ? (
            <EditableList
              items={discussion}
              setItems={setDiscussion}
              draft={draftDiscussion}
              setDraft={
                setDraftDiscussion
              }
              color="bg-[#3496D0]"
              inputBorder="border-[#3496D0]/30"
              inputBg="bg-[#3496D0]/10"
              ringColor="focus:ring-[#3496D0]/30"
            />
          ) : (
            <BulletList
              items={discussion}
              color="bg-[#3496D0]"
            />
          )}
        </SectionShell>

        <SectionShell
          k="recommendations"
          title="Recommendations"
          isOpen={open.recommendations}
          onToggle={toggle}
          number={3}
          numberBg="bg-[#6A63E9]"
        >
          {mode === 'edit' ? (
            <EditableList
              items={recommendations}
              setItems={
                setRecommendations
              }
              draft={draftRec}
              setDraft={setDraftRec}
              color="bg-[#6A63E9]"
              inputBorder="border-[#6A63E9]/30"
              inputBg="bg-[#6A63E9]/10"
              ringColor="focus:ring-[#6A63E9]/30"
            />
          ) : (
            <BulletList
              items={recommendations}
              color="bg-[#6A63E9]"
            />
          )}
        </SectionShell>

        <SectionShell
          k="notes"
          title="Counselor Notes"
          isOpen={open.notes}
          onToggle={toggle}
          number={4}
          numberBg="bg-[#EB941A]"
        >
          {mode === 'edit' ? (
            <EditableList
              items={notes}
              setItems={setNotes}
              draft={draftNote}
              setDraft={setDraftNote}
              color="bg-[#EB941A]"
              inputBorder="border-[#EB941A]/30"
              inputBg="bg-[#EB941A]/10"
              ringColor="focus:ring-[#EB941A]/30"
            />
          ) : (
            <BulletList
              items={notes}
              color="bg-amber-500"
            />
          )}
        </SectionShell>

        
      </main>

      {mode === 'edit' && (
       
          <div className="flex justify-center">
            <button 
              onClick={handleCompleteSession}
              disabled={isCompleting}
              className="inline-flex items-center gap-1.5 rounded-[13px] bg-[#3B82F6] px-6 py-2.5 text-[14px] font-medium text-[#FFFFFF] hover:bg-[#3B82F6E6] disabled:opacity-50 shadow-sm"
            >
              {isCompleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Completing Session...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Complete Session
                </>
              )}
            </button>
          </div>
      )}
      </div>
    </div>
  );
}