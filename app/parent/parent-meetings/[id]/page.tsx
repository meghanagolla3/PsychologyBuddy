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
  ArrowLeft,
  Pencil,
  Eye,
  Save,
  Download,
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

const EditableList = memo(function EditableList({
  items,
  setItems,
  draft,
  setDraft,
  color,
  inputBorder,
  inputBg,
  ringColor,
}: {
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  draft: string;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  color: string;
  inputBorder: string;
  inputBg: string;
  ringColor: string;
}) {
  const handleAdd = useCallback(() => {
    if (draft.trim()) {
      setItems([...items, draft.trim()]);
      setDraft('');
    }
  }, [draft, items, setItems, setDraft]);

  const handleRemove = useCallback(
    (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    },
    [items, setItems]
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          className={`flex-1 px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} text-sm focus:outline-none focus:ring-2 ${ringColor}`}
          placeholder="Type and press Enter to add..."
        />
        <button
          type="button"
          onClick={handleAdd}
          className={`px-4 py-2 rounded-lg ${color} text-white text-sm font-medium hover:opacity-90`}
        >
          Add
        </button>
      </div>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200"
          >
            <span className="text-sm text-slate-700">{item}</span>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-slate-400 hover:text-red-500"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

EditableList.displayName = 'EditableList';

const BulletList = memo(function BulletList({
  items,
  color,
}: {
  items: string[];
  color: string;
}) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400 italic">No items added</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
          <span className="text-sm text-slate-700">{item}</span>
        </li>
      ))}
    </ul>
  );
});

BulletList.displayName = 'BulletList';

const SectionShell = memo(function SectionShell({
  k,
  title,
  isOpen,
  onToggle,
  number,
  numberBg,
  children,
  icon,
}: {
  k: SectionKey;
  title: string;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
  number?: number;
  numberBg?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(k)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {number && (
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-white ${numberBg}`}
            >
              {number}
            </span>
          )}
          {icon && <span>{icon}</span>}
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        </div>
        <span className="text-slate-400">
          {isOpen ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </button>
      {isOpen && <div className="px-4 pb-4 pt-2">{children}</div>}
    </section>
  );
});

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

  const [meeting, setMeeting] = useState<Meeting | null>(null);

  const [mode, setMode] = useState<Mode>('edit');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'preview') {
      setMode('preview');
    }
  }, [searchParams]);

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

  const [draftDiscussion, setDraftDiscussion] = useState('');
  const [draftRecommendation, setDraftRecommendation] = useState('');
  const [draftNote, setDraftNote] = useState('');

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
        label: 'Date',
        value: meetingDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        label: 'Time',
        value: meeting.time,
        icon: <Clock className="w-4 h-4" />,
      },
      {
        label: 'Student',
        value: meeting.studentName,
        icon: <User className="w-4 h-4" />,
      },
      {
        label: 'Counselor',
        value: meeting.counselorName,
        icon: <GraduationCap className="w-4 h-4" />,
      },
      {
        label: 'Duration',
        value: '30 mins',
      },
    ];
  }, [meeting]);

  const handleDownload = useCallback(() => {
    alert('Download functionality coming soon!');
  }, []);

  const handleSaveDraft = useCallback(async () => {
    try {
      if (!meeting?.id) {
        return;
      }

      const response = await fetch(
        `/api/parent/parent-meetings/${meeting.id}`,
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

      const result = await response.json();

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

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-slate-100"
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
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              rows={3}
              placeholder="Enter the purpose of this meeting..."
            />
          ) : (
            <p className="text-sm text-slate-700">{purpose || 'No purpose specified'}</p>
          )}
        </SectionShell>

        <SectionShell
          k="discussion"
          title="Discussion Points"
          isOpen={open.discussion}
          onToggle={toggle}
          number={2}
          numberBg="bg-blue-500"
        >
          {mode === 'edit' ? (
            <EditableList
              items={discussion}
              setItems={setDiscussion}
              draft={draftDiscussion}
              setDraft={setDraftDiscussion}
              color="bg-blue-500"
              inputBorder="border-blue-200"
              inputBg="bg-blue-50/30"
              ringColor="focus:ring-blue-300"
            />
          ) : (
            <BulletList
              items={discussion}
              color="bg-blue-500"
            />
          )}
        </SectionShell>

        <SectionShell
          k="recommendations"
          title="Recommendations"
          isOpen={open.recommendations}
          onToggle={toggle}
          number={3}
          numberBg="bg-purple-500"
        >
          {mode === 'edit' ? (
            <EditableList
              items={recommendations}
              setItems={setRecommendations}
              draft={draftRecommendation}
              setDraft={setDraftRecommendation}
              color="bg-purple-500"
              inputBorder="border-purple-200"
              inputBg="bg-purple-50/30"
              ringColor="focus:ring-purple-300"
            />
          ) : (
            <BulletList
              items={recommendations}
              color="bg-purple-500"
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
    </div>
  );
}
