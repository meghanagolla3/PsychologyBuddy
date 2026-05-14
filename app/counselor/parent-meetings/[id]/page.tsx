'use client';

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

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
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <header className="flex items-center justify-between px-4 py-3">
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

            <h2 className="text-sm font-semibold text-slate-800">
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
          <div className="px-4 pb-4">
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
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-2 text-sm text-slate-700"
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
            className={`flex-1 px-3 py-2 text-sm rounded-lg border ${inputBorder} ${inputBg} focus:outline-none focus:ring-2 ${ringColor}`}
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
        value: meeting.level || 'N/A',
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
      }
    }, [
      meeting,
      purpose,
      discussion,
      recommendations,
      notes,
    ]);

  const handleDownload = useCallback(() => {
    const lines: string[] = [];

    lines.push(
      'Parent - Meeting Details',
      ''
    );

    info.forEach((item) => {
      lines.push(
        `${item.label}: ${item.value}`
      );
    });

    lines.push(
      '',
      'Meeting Purpose',
      purpose
    );

    lines.push('', 'Discussion');

    discussion.forEach((d) =>
      lines.push(`• ${d}`)
    );

    lines.push('', 'Recommendations');

    recommendations.forEach((r) =>
      lines.push(`• ${r}`)
    );

    lines.push('', 'Notes');

    notes.forEach((n) =>
      lines.push(`• ${n}`)
    );

    const blob = new Blob(
      [lines.join('\n')],
      {
        type: 'text/plain',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;
    a.download =
      'meeting-details.txt';

    a.click();

    URL.revokeObjectURL(url);
  }, [
    info,
    purpose,
    discussion,
    recommendations,
    notes,
  ]);

  const handleCompleteSession = useCallback(async () => {
    try {
      if (!meeting?.id) {
        alert('Meeting not found');
        return;
      }

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
    }
  }, [meeting, handleSaveDraft, router]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-base font-semibold text-slate-800 flex-1">
            Parent - Meeting Details
          </h1>
        </div>

        <div className="mx-auto max-w-2xl px-4 pb-3 flex flex-wrap items-center gap-2">
          {mode === 'edit' && (
            <>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border ${
                  mode === 'edit'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode('preview')
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border ${
                  mode === 'preview'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border bg-white text-slate-700 border-slate-300"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border bg-white text-slate-700 border-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </header>

      <main className={`mx-auto max-w-2xl px-4 py-4 space-y-3 ${mode === 'edit' ? 'pb-28' : 'pb-4'}`}>
        <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {info.map((item) => (
              <div key={item.label}>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <span className="text-slate-400">
                    {item.icon}
                  </span>

                  {item.label}
                </div>

                <div className="text-sm font-medium text-slate-800">
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
          numberBg="bg-emerald-500"
        >
          {mode === 'edit' ? (
            <textarea
              value={purpose}
              onChange={
                handlePurposeChange
              }
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-200 bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          ) : (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3">
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
          numberBg="bg-sky-500"
        >
          {mode === 'edit' ? (
            <EditableList
              items={discussion}
              setItems={setDiscussion}
              draft={draftDiscussion}
              setDraft={
                setDraftDiscussion
              }
              color="bg-sky-500"
              inputBorder="border-sky-200"
              inputBg="bg-sky-50/30"
              ringColor="focus:ring-sky-300"
            />
          ) : (
            <BulletList
              items={discussion}
              color="bg-sky-500"
            />
          )}
        </SectionShell>

        <SectionShell
          k="recommendations"
          title="Recommendations"
          isOpen={open.recommendations}
          onToggle={toggle}
          number={3}
          numberBg="bg-violet-500"
        >
          {mode === 'edit' ? (
            <EditableList
              items={recommendations}
              setItems={
                setRecommendations
              }
              draft={draftRec}
              setDraft={setDraftRec}
              color="bg-violet-500"
              inputBorder="border-violet-200"
              inputBg="bg-violet-50/30"
              ringColor="focus:ring-violet-300"
            />
          ) : (
            <BulletList
              items={recommendations}
              color="bg-violet-500"
            />
          )}
        </SectionShell>

        <SectionShell
          k="notes"
          title="Counselor Notes"
          isOpen={open.notes}
          onToggle={toggle}
          number={4}
          numberBg="bg-amber-500"
        >
          {mode === 'edit' ? (
            <EditableList
              items={notes}
              setItems={setNotes}
              draft={draftNote}
              setDraft={setDraftNote}
              color="bg-amber-500"
              inputBorder="border-amber-200"
              inputBg="bg-amber-50/30"
              ringColor="focus:ring-amber-300"
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
        <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-2xl px-4 py-3 flex justify-end">
            <button 
              onClick={handleCompleteSession}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Complete Session
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}