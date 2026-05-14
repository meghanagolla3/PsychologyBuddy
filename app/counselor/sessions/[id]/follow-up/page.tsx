'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronUp, Check, X, Save, ArrowLeft, Lock, Download, Eye, SquarePen, Plus } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/* ---------------- Field ---------------- */
interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  readOnly?: boolean;
}

const Field = ({ label, children, className, readOnly = false }: FieldProps) => (
  <div className={className}>
    <label className="mb-1.5 block text-[14px] font-medium tracking-wide text-[#64748B]">
      {label}
      {readOnly && <Lock className="inline h-3 w-3 ml-1 text-gray-400" />}
    </label>
    {children}
  </div>
);

const inputBase =
  "w-full rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-md text-[#1E293B] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]";

const inputReadOnly =
  "w-full rounded-[16px] border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2.5 text-md text-[#64748B] placeholder:text-[#94A3B8]";

/* ---------------- Chip ---------------- */
interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  variant?: "pill" | "tag";
  readOnly?: boolean;
}

const Chip = ({ label, selected, onClick, onRemove, variant = "pill", readOnly = false }: ChipProps) => {
  if (variant === "tag") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#E2E8F0] px-2.5 py-1 text-m  text-[#1E293B]">
        {label}
        {onRemove && !readOnly && (
          <button onClick={onRemove} className="text-[#64748B] hover:text-[#1E293B]">
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={readOnly}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[15px] border px-4 py-1.5 text-md font-medium transition-colors",
        readOnly
          ? "border-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] cursor-not-allowed"
          : selected
          ? "border-[#3B82F6] bg-[#3B82F6] text-[#FFFFFF]"
          : "border-[#E2E8F0] bg-[#F1F5F9] text-[#1E293B] hover:bg-[#E2E8F0]"
      )}
    >
      {selected && <Check className="h-3 w-3" />}
      {label}
    </button>
  );
};

/* ---------------- SectionCard ---------------- */
interface SectionCardProps {
  number: number;
  title: string;
  children: ReactNode;
  readOnly?: boolean;
}

const SectionCard = ({ number, title, children, readOnly = false }: SectionCardProps) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-[32px] border border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-md font-semibold",
            readOnly ? "bg-[#94A3B8] text-[#FFFFFF]" : "bg-[#3B82F6] text-[#FFFFFF]"
          )}>
            {number}
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B]">{title}</h2>
          {readOnly && <Lock className="h-4 w-4 text-gray-400" />}
        </div>
        <div className="flex items-center gap-3 text-[#64748B]"> 
          <button
            onClick={() => setOpen((o) => !o)}
            className={cn(open && "rotate-180", "transition-transform")}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

export default function FollowUpSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [previousIntake, setPreviousIntake] = useState<any>(null);
  const [previousReports, setPreviousReports] = useState<any[]>([]);
  const [reportCount, setReportCount] = useState(1);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  // Editable intake data state
  const [intakeData, setIntakeData] = useState({
    basicInfo: {
      date: '',
      monthYear: '',
      place: '',
      age: '',
      gender: ''
    },
    complaints: {
      durationStart: '',
      durationEnd: '',
      complaints: [] as string[]
    },
    factors: {
      predisposing: [] as string[]
    },
    familyHistory: '',
    personalHistory: ''
  });

  // New report data
  const [formData, setFormData] = useState({
    behavioralTags: [] as string[],
    sessionSummary: '',
    manualRecommendations: '',
    customTags: [] as string[],
  });

  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Resource management state
  const [selectedResources, setSelectedResources] = useState<Array<{id: string, name: string, type: string, duration: string}>>([]);
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [availableResources, setAvailableResources] = useState<Record<string, Array<{id: string, name: string, duration: string}>>>({
    articles: [],
    meditation: [],
    music: []
  });
  const [loadingResources, setLoadingResources] = useState(false);

  const predefinedTags = [
    'Anxiety', 'Depression', 'Anger Management', 'Social Skills',
    'Self-Esteem', 'Family Issues', 'Academic Stress', 'Peer Relationships',
    'Emotional Regulation', 'Coping Skills', 'Communication', 'Behavioral Issues'
  ];

  const safeString = (val: any) => (typeof val === 'string' ? val : '');

  // Preview components - same as intake page
  const SectionTitle = ({ num, title }: { num: string; title: string }) => (
    <div className="mb-3 mt-8 border-b border-[#E2E8F0] pb-2">
      <h3 className="text-sm font-semibold tracking-wide text-[#3B82F6]">
        {num}  {title}
      </h3>
    </div>
  );

  const Bullet = ({ text }: { text: string }) => (
    <li className="flex gap-3 py-1.5">
      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3B82F6]" />
      <span className="text-sm leading-relaxed text-[#1E293B]">{text}</span>
    </li>
  );

  // Load resources when component mounts
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      
      // Fetch resources individually to handle errors separately
      const [articlesResponse, meditationResponse, musicResponse] = await Promise.allSettled([
        fetch('/api/admin/articles?limit=20'),
        fetch('/api/meditation/resources?limit=20&status=PUBLISHED'),
        fetch('/api/admin/music/resources?limit=20&status=PUBLISHED')
      ]);
      
      // Extract responses and handle errors
      const articlesOk = articlesResponse.status === 'fulfilled' ? articlesResponse.value : null;
      const meditationOk = meditationResponse.status === 'fulfilled' ? meditationResponse.value : null;
      const musicOk = musicResponse.status === 'fulfilled' ? musicResponse.value : null;
      
      // Parse JSON responses individually
      const [articlesData, meditationData, musicData] = await Promise.all([
        articlesOk?.json().catch(() => ({ success: false, data: [] })) || { success: false, data: [] },
        meditationOk?.json().catch(() => ({ success: false, data: [] })) || { success: false, data: [] },
        musicOk?.json().catch(() => ({ success: false, data: { resources: [] } })) || { success: false, data: { resources: [] } }
      ]);
      
      const resourcesByType: Record<string, { id: string; name: string; duration: string }[]> = {
        articles: [],
        meditation: [],
        music: []
      };
      
      // Process articles
      if (articlesData.success && articlesData.data) {
        resourcesByType.articles = articlesData.data.map((article: any) => ({
          id: article.id,
          name: article.title,
          duration: article.readTime ? `${article.readTime} min read` : 'Read time varies'
        }));
      }
      
      // Process meditation resources
      if (meditationData.success && meditationData.data) {
        resourcesByType.meditation = meditationData.data.map((resource: any) => ({
          id: resource.id,
          name: resource.title,
          duration: resource.format || 'Meditation'
        }));
      }
      
      // Process music resources
      if (musicData.success && musicData.data?.resources) {
        resourcesByType.music = musicData.data.resources.map((resource: any) => ({
          id: resource.id,
          name: resource.title,
          duration: resource.duration ? `${Math.ceil(resource.duration / 60)} min` : 'Duration varies'
        }));
      }
      
      setAvailableResources(resourcesByType);
    } catch (error) {
      console.error('Error fetching resources:', error);
      // Set empty arrays on error
      setAvailableResources({
        articles: [],
        meditation: [],
        music: []
      });
    } finally {
      setLoadingResources(false);
    }
  };

  // Load session data
  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading session data for:', sessionId);
      const sessionResponse = await fetch(`/api/counselor/sessions/${sessionId}`);
      const sessionResult = await sessionResponse.json();
      
      console.log('Session result:', sessionResult);
      
      if (sessionResult.success) {
        const sessionData = sessionResult.data;
        setSession(sessionData);
        
        console.log('Session data:', sessionData);
        console.log('Previous session:', sessionData.previousSession);
        
        // Load previous session intake data
        if (sessionData.previousSession?.id) {
          console.log('Loading previous session data via link...');
          await loadPreviousSessionData(sessionData.previousSession.id, sessionData.studentId);
        } else {
          console.log('No previous session link found, searching for first completed session...');
          // Find the student's first completed session to get intake data
          await loadFirstCompletedSessionData(sessionData.studentId);
        }
        
        // Load current report data
        await loadReportData();
      }
    } catch (err) {
      console.error('Error loading session data:', err);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousSessionData = async (previousSessionId: string, studentId: string) => {
    try {
      console.log('Loading intake data from previous session:', previousSessionId);
      // Load intake data from the first completed session
      const intakeResponse = await fetch(`/api/counselor/sessions/${previousSessionId}/intake`);
      const intakeResult = await intakeResponse.json();
      
      console.log('Intake result:', intakeResult);
      
      if (intakeResult.success && intakeResult.data) {
        console.log('Intake data structure (other path):', JSON.stringify(intakeResult.data, null, 2));
        console.log('Personal history value (other path):', intakeResult.data.personalHistory);
        console.log('Personal history type (other path):', typeof intakeResult.data.personalHistory);
        
        setPreviousIntake(intakeResult.data);
        
        // Handle personal history - it might be stored differently
        let personalHistoryValue = '';
        if (intakeResult.data.personalHistory) {
          if (typeof intakeResult.data.personalHistory === 'string') {
            personalHistoryValue = intakeResult.data.personalHistory;
          } else if (typeof intakeResult.data.personalHistory === 'object') {
            // Check if it has a 'text' field (JSON format)
            if (intakeResult.data.personalHistory.text) {
              personalHistoryValue = intakeResult.data.personalHistory.text;
            } else {
              personalHistoryValue = JSON.stringify(intakeResult.data.personalHistory);
            }
          } else {
            personalHistoryValue = String(intakeResult.data.personalHistory);
          }
        }
        
        console.log('Processed personal history (other path):', personalHistoryValue);
        
        // Populate editable intake data state
        setIntakeData({
          basicInfo: {
            date: intakeResult.data.basicInfo?.date || '',
            monthYear: intakeResult.data.basicInfo?.monthYear || '',
            place: intakeResult.data.basicInfo?.place || '',
            age: intakeResult.data.basicInfo?.age || '',
            gender: intakeResult.data.basicInfo?.gender || ''
          },
          complaints: {
            durationStart: intakeResult.data.complaints?.durationStart || '',
            durationEnd: intakeResult.data.complaints?.durationEnd || '',
            complaints: intakeResult.data.complaints?.complaints || []
          },
          factors: {
            predisposing: intakeResult.data.factors?.predisposing || []
          },
          familyHistory: intakeResult.data.familyHistory || '',
          personalHistory: personalHistoryValue
        });
        console.log('Previous intake set:', intakeResult.data);
      }

      console.log('Loading all completed sessions for student:', studentId);
      // Load all previous completed sessions for this student
      const allSessionsResponse = await fetch(`/api/counselor/sessions?studentId=${studentId}&status=COMPLETED`);
      const allSessionsResult = await allSessionsResponse.json();
      
      console.log('All sessions result:', allSessionsResult);
      
      if (allSessionsResult.success) {
        const completedSessions = allSessionsResult.data || [];
        console.log('Completed sessions:', completedSessions);
        // We'll set report count after loading actual reports
        
        // Load reports for all completed sessions for this student only
        const reports = [];
        for (const sess of completedSessions) {
          // Double-check this session belongs to the current student
          if (sess.studentId !== studentId) {
            console.log('Skipping session - belongs to different student:', sess.studentId, 'Current student:', studentId);
            continue;
          }
          
          try {
            console.log('Loading report for session:', sess.id, 'Student:', sess.studentId);
            
            // For INTAKE sessions, the report is stored in the intake data
            if (sess.sessionType === 'INTAKE' && sess.id === previousSessionId) {
              // Use the intake data we already loaded
              if (intakeResult.success && intakeResult.data && intakeResult.data.sessionReport) {
                const sessionReport = intakeResult.data.sessionReport;
                reports.push({
                  behavioralTags: sessionReport.behaviors || [],
                  summary: sessionReport.sessionSummary || '',
                  recommendations: sessionReport.manualRecommendations ? sessionReport.manualRecommendations.split('\n').filter((r: string) => r.trim()) : [],
                  sessionId: sess.id,
                  sessionDate: sess.scheduledAt,
                  sessionType: sess.sessionType,
                  studentId: sess.studentId
                });
                console.log('Added intake session report for student:', studentId);
              }
            } else {
              // For FOLLOW_UP sessions, load from report API
              const reportResponse = await fetch(`/api/counselor/sessions/${sess.id}/report`);
              const reportResult = await reportResponse.json();
              
              if (reportResult.success && reportResult.data) {
                // Verify the report also belongs to this student
                if (reportResult.data.studentId === studentId || !reportResult.data.studentId) {
                  reports.push({
                    ...reportResult.data,
                    sessionId: sess.id,
                    sessionDate: sess.scheduledAt,
                    sessionType: sess.sessionType,
                    studentId: sess.studentId
                  });
                  console.log('Added follow-up report for student:', studentId);
                } else {
                  console.log('Skipping report - belongs to different student:', reportResult.data.studentId);
                }
              }
            }
          } catch (err) {
            console.error('Error loading report for session', sess.id, err);
          }
        }
        
        console.log('Previous reports loaded:', reports);
        // Sort by date
        reports.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
        setPreviousReports(reports);
        // Set report count based on actual number of reports + 1 for new report
        setReportCount(reports.length + 1);
      }
    } catch (err) {
      console.error('Error loading previous session data:', err);
    }
  };

  const loadFirstCompletedSessionData = async (studentId: string) => {
    try {
      console.log('Finding intake session for current student:', studentId);
      
      // Get all completed sessions for this student, sorted by date
      const allSessionsResponse = await fetch(`/api/counselor/sessions?studentId=${studentId}&status=COMPLETED&sortBy=scheduledAt&sortOrder=asc`);
      const allSessionsResult = await allSessionsResponse.json();
      
      console.log('All completed sessions for student:', allSessionsResult);
      
      if (allSessionsResult.success && allSessionsResult.data && allSessionsResult.data.length > 0) {
        const completedSessions = allSessionsResult.data;
        console.log('Completed sessions found:', completedSessions.length);
        console.log('Current session ID:', sessionId);
        
        // Find the INTAKE session (first session type for this student)
        const intakeSession = completedSessions.find((sess: any) => sess.sessionType === 'INTAKE');
        console.log('Found intake session:', intakeSession);
        
        let targetSession = intakeSession || completedSessions[0]; // Fallback to first session if no INTAKE found
        
        // Make sure we're not loading from the current session itself
        if (targetSession.id === sessionId) {
          console.log('Target session is current session, looking for previous one...');
          const currentIndex = completedSessions.findIndex((sess: any) => sess.id === sessionId);
          if (currentIndex > 0) {
            targetSession = completedSessions[currentIndex - 1];
          } else {
            console.log('No previous session found');
            return;
          }
        }
        
        console.log('Loading intake data from session:', targetSession);
        
        // Load intake data from the target session
        const intakeResponse = await fetch(`/api/counselor/sessions/${targetSession.id}/intake`);
        const intakeResult = await intakeResponse.json();
        
        console.log('Intake result:', intakeResult);
        
        if (intakeResult.success && intakeResult.data) {
          console.log('Intake data structure:', JSON.stringify(intakeResult.data, null, 2));
          console.log('Personal history value:', intakeResult.data.personalHistory);
          console.log('Personal history type:', typeof intakeResult.data.personalHistory);
          
          // Verify this intake belongs to the current student
          if (intakeResult.data.studentId === studentId || !intakeResult.data.studentId) {
            setPreviousIntake(intakeResult.data);
            
            // Handle personal history - it might be stored differently
            let personalHistoryValue = '';
            if (intakeResult.data.personalHistory) {
              if (typeof intakeResult.data.personalHistory === 'string') {
                personalHistoryValue = intakeResult.data.personalHistory;
              } else if (typeof intakeResult.data.personalHistory === 'object') {
                // Check if it has a 'text' field (JSON format)
                if (intakeResult.data.personalHistory.text) {
                  personalHistoryValue = intakeResult.data.personalHistory.text;
                } else {
                  personalHistoryValue = JSON.stringify(intakeResult.data.personalHistory);
                }
              } else {
                personalHistoryValue = String(intakeResult.data.personalHistory);
              }
            }
            
            console.log('Processed personal history:', personalHistoryValue);
            
            // Populate editable intake data state
            setIntakeData({
              basicInfo: {
                date: intakeResult.data.basicInfo?.date || '',
                monthYear: intakeResult.data.basicInfo?.monthYear || '',
                place: intakeResult.data.basicInfo?.place || '',
                age: intakeResult.data.basicInfo?.age || '',
                gender: intakeResult.data.basicInfo?.gender || ''
              },
              complaints: {
                durationStart: intakeResult.data.complaints?.durationStart || '',
                durationEnd: intakeResult.data.complaints?.durationEnd || '',
                complaints: intakeResult.data.complaints?.complaints || []
              },
              factors: {
                predisposing: intakeResult.data.factors?.predisposing || []
              },
              familyHistory: intakeResult.data.familyHistory || '',
              personalHistory: personalHistoryValue
            });
            console.log('Previous intake set successfully for student:', studentId);
          } else {
            console.error('Intake data belongs to different student!');
          }
        }
        
        setReportCount(completedSessions.length + 1);
        
        // Load reports for all completed sessions for this student only
        const reports = [];
        for (const sess of completedSessions) {
          // Double-check this session belongs to the current student
          if (sess.studentId !== studentId) {
            console.log('Skipping session - belongs to different student:', sess.studentId, 'Current student:', studentId);
            continue;
          }
          
          try {
            console.log('Loading report for session:', sess.id, 'Student:', sess.studentId);
            
            // For INTAKE sessions, the report is stored in the intake data
            if (sess.sessionType === 'INTAKE' && sess.id === targetSession.id) {
              // Use the intake data we already loaded
              if (intakeResult.success && intakeResult.data && intakeResult.data.sessionReport) {
                const sessionReport = intakeResult.data.sessionReport;
                reports.push({
                  behavioralTags: sessionReport.behaviors || [],
                  summary: sessionReport.sessionSummary || '',
                  recommendations: sessionReport.manualRecommendations ? sessionReport.manualRecommendations.split('\n').filter((r: string) => r.trim()) : [],
                  sessionId: sess.id,
                  sessionDate: sess.scheduledAt,
                  sessionType: sess.sessionType,
                  studentId: sess.studentId
                });
                console.log('Added intake session report for student:', studentId);
              }
            } else {
              // For FOLLOW_UP sessions, load from report API
              const reportResponse = await fetch(`/api/counselor/sessions/${sess.id}/report`);
              const reportResult = await reportResponse.json();
              
              if (reportResult.success && reportResult.data) {
                // Verify the report also belongs to this student
                if (reportResult.data.studentId === studentId || !reportResult.data.studentId) {
                  reports.push({
                    ...reportResult.data,
                    sessionId: sess.id,
                    sessionDate: sess.scheduledAt,
                    sessionType: sess.sessionType,
                    studentId: sess.studentId
                  });
                  console.log('Added follow-up report for student:', studentId);
                } else {
                  console.log('Skipping report - belongs to different student:', reportResult.data.studentId);
                }
              }
            }
          } catch (err) {
            console.error('Error loading report for session', sess.id, err);
          }
        }
        
        console.log('Previous reports loaded:', reports);
        // Sort by date
        reports.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
        setPreviousReports(reports);
        // Set report count based on actual number of reports + 1 for new report
        setReportCount(reports.length + 1);
      } else {
        console.log('No completed sessions found for student');
      }
    } catch (err) {
      console.error('Error loading first completed session data:', err);
    }
  };

  const loadReportData = async () => {
    try {
      const reportResponse = await fetch(`/api/counselor/sessions/${sessionId}/report`);
      const reportResult = await reportResponse.json();
      
      if (reportResult.success && reportResult.data) {
        setFormData({
          behavioralTags: reportResult.data.behavioralTags || [],
          sessionSummary: reportResult.data.summary || '',
          manualRecommendations: reportResult.data.recommendations?.join('\n') || '',
          customTags: [],
        });
      }
    } catch (err) {
      console.error('Error loading report data:', err);
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const reportData = {
        behavioralTags: formData.behavioralTags,
        summary: formData.sessionSummary,
        recommendations: formData.manualRecommendations.split('\n').filter(r => r.trim()),
        notes: '',
      };

      const response = await fetch(`/api/counselor/sessions/${sessionId}/report`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Report saved successfully');
      } else {
        setError(result.message || 'Failed to save report');
      }
    } catch (err) {
      console.error('Save report error:', err);
      setError('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const completeIntake = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Save draft first
      await saveDraft();
      
      // Switch to preview mode after successful save
      setMode('preview');
    } catch (err) {
      console.error('Preview and continue error:', err);
      setError('Failed to save and switch to preview');
    } finally {
      setSaving(false);
    }
  };

  const submitReport = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Save draft first to ensure data is current
      await saveDraft();
      
      // Prepare report data for completion
      const reportData = {
        behavioralTags: formData.behavioralTags,
        summary: formData.sessionSummary,
        recommendations: formData.manualRecommendations.split('\n').filter(r => r.trim()),
        notes: '',
      };
      
      const response = await fetch(`/api/counselor/sessions/${sessionId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Follow-up session completed successfully! Redirecting to sessions list...');
        setTimeout(() => router.push('/counselor/sessions'), 1500);
      } else {
        setError(result.message || 'Failed to complete session');
      }
    } catch (err) {
      console.error('Submit report error:', err);
      setError('Failed to submit report');
    } finally {
      setSaving(false);
    }
  };

  const toggleBehavior = (behavior: string) => {
    setSelectedBehaviors(prev => {
      const newBehaviors = prev.includes(behavior)
        ? prev.filter(b => b !== behavior)
        : [...prev, behavior];
      setFormData(prev => ({ ...prev, behavioralTags: newBehaviors }));
      return newBehaviors;
    });
  };

  const addCustomTag = () => {
    if (newTag.trim() && !formData.customTags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        customTags: [...prev.customTags, newTag.trim()],
        behavioralTags: [...prev.behavioralTags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeCustomTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      customTags: prev.customTags.filter(t => t !== tag),
      behavioralTags: prev.behavioralTags.filter(t => t !== tag)
    }));
  };

  const downloadPDF = async () => {
    const originalMode = mode;

    try {
      setDownloading(true);

      // Step 1: Save form data
      await saveDraft();

      // Small delay to ensure save completes
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: Switch to preview mode
      setMode("preview");

      // Wait for DOM to fully render
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const element = document.getElementById("follow-up-preview");

      if (!element) {
        throw new Error("Preview element not found");
      }

      // Ensure A4 layout BEFORE capture
      element.style.width = "794px";   // A4 width (96 DPI)
      element.style.minHeight = "1123px";
      element.style.background = "#ffffff";
      element.style.padding = "40px";
      element.style.boxSizing = "border-box";

      // Step 3: Capture canvas (NO manual width/height)
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Step 4: Create PDF
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;

      // Step 5: Handle multi-page (IMPORTANT)
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

      // Step 6: File name
      const studentName =
        session?.student?.firstName && session?.student?.lastName
          ? `${session.student.firstName}_${session.student.lastName}`
          : "student";

      const date = new Date().toISOString().split("T")[0];

      const filename = `follow_up_session_${studentName}_${date}.pdf`;

      // Step 7: Download
      pdf.save(filename);

      // Restore mode
      if (originalMode !== "preview") {
        setTimeout(() => setMode(originalMode), 500);
      }
    } catch (error) {
      console.error("PDF download error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      setError(`Failed to download PDF: ${errorMessage}`);

      if (originalMode !== "preview") {
        setMode(originalMode);
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading follow-up session...</div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-8xl px-5 py-3">
        <button 
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </button>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Follow-up Session</h1>
            <p className="text-sm text-[#64748B]">
              {session?.student?.firstName} {session?.student?.lastName} • {session?.student?.studentId}
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
                <SquarePen className="h-3.5 w-3.5" /> Edit
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

            <button 
              onClick={saveDraft}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-[13px] border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-[14px] font-medium text-[#1E293B] hover:bg-[#E2E8F0]"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button 
              onClick={downloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-[13px] border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-[14px] font-medium text-[#1E293B] hover:bg-[#E2E8F0] disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> {downloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content - Conditional Rendering */}
      {mode === "edit" && (
        <div id="follow-up-preview" className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Editable Intake Data */}
          {previousIntake && (
            <>
              <SectionCard number={1} title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Date">
                    <Input
                      value={intakeData.basicInfo.date}
                      onChange={(e) => setIntakeData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, date: e.target.value }
                      }))}
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Month/Year">
                    <Input
                      value={intakeData.basicInfo.monthYear}
                      onChange={(e) => setIntakeData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, monthYear: e.target.value }
                      }))}
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Place">
                    <Input
                      value={intakeData.basicInfo.place}
                      onChange={(e) => setIntakeData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, place: e.target.value }
                      }))}
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Age">
                    <Input
                      value={intakeData.basicInfo.age}
                      onChange={(e) => setIntakeData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, age: e.target.value }
                      }))}
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Gender">
                    <Input
                      value={intakeData.basicInfo.gender}
                      onChange={(e) => setIntakeData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, gender: e.target.value }
                      }))}
                      className={inputBase}
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard number={2} title="Complaints">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Field label="Duration Start">
                    <Input
                      value={intakeData.complaints.durationStart}
                      onChange={(e) => setIntakeData(prev => ({
                        ...prev,
                        complaints: { ...prev.complaints, durationStart: e.target.value }
                      }))}
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Duration End">
                    <Input
                      value={intakeData.complaints.durationEnd}
                      onChange={(e) => setIntakeData(prev => ({
                        ...prev,
                        complaints: { ...prev.complaints, durationEnd: e.target.value }
                      }))}
                      className={inputBase}
                    />
                  </Field>
                </div>
                <Field label="Complaints">
                  <div className="flex flex-wrap gap-2">
                    {intakeData.complaints.complaints.map((complaint: string, idx: number) => (
                      <Chip key={idx} label={complaint} variant="tag" />
                    ))}
                  </div>
                </Field>
              </SectionCard>

              <SectionCard number={3} title="Predisposing & Precipitating Factors">
                <Field label="Factors">
                  <div className="flex flex-wrap gap-2">
                    {intakeData.factors.predisposing.map((factor: string, idx: number) => (
                      <Chip key={idx} label={factor} variant="tag" />
                    ))}
                  </div>
                </Field>
              </SectionCard>

              <SectionCard number={4} title="Family History">
                <Field label="Family History">
                  <textarea
                    value={intakeData.familyHistory}
                    onChange={(e) => setIntakeData(prev => ({
                      ...prev,
                      familyHistory: e.target.value
                    }))}
                    rows={4}
                    className={inputBase}
                  />
                </Field>
              </SectionCard>

              <SectionCard number={5} title="Personal History">
                <Field label="Personal History">
                  <textarea
                    value={intakeData.personalHistory}
                    onChange={(e) => setIntakeData(prev => ({
                      ...prev,
                      personalHistory: e.target.value
                    }))}
                    rows={6}
                    className={inputBase}
                  />
                </Field>
              </SectionCard>

              {/* Previous Session Reports - Read-Only */}
              {previousReports.map((report, index) => (
                <SectionCard 
                  key={report.sessionId} 
                  number={6 + index} 
                  title={`Session Report ${index + 1} (Read-Only) - ${new Date(report.sessionDate).toLocaleDateString()}`} 
                  readOnly
                >
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#64748B]">Behavioral Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {(report.behavioralTags || []).map((tag: string, idx: number) => (
                          <Chip key={idx} label={tag} variant="tag" readOnly />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#64748B]">Session Summary</label>
                      <textarea
                        value={report.summary || ''}
                        readOnly
                        rows={6}
                        className={inputReadOnly}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#64748B]">Recommendations</label>
                      <textarea
                        value={(report.recommendations || []).join('\n')}
                        readOnly
                        rows={4}
                        className={inputReadOnly}
                      />
                    </div>
                  </div>
                </SectionCard>
              ))}
            </>
          )}

          {/* New Session Report */}
          <SectionCard number={previousIntake ? 6 + previousReports.length : 1} title={`Session Report ${reportCount} (New)`}>
            <p className="mb-2 text-sm font-medium text-[#1E293B]">Observations during Session</p>
            
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {formData.customTags.map((tag, index) => (
                  <div key={tag} className="flex items-center gap-1">
                    <Chip
                      label={tag}
                      selected={selectedBehaviors.includes(tag)}
                      onClick={() => toggleBehavior(tag)}
                    />
                    <button
                      onClick={() => removeCustomTag(tag)}
                      className="text-[#64748B] hover:text-[#1E293B] ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  placeholder="Add a Custom tag" 
                  className={cn(inputBase, "max-w-xs")} 
                />
                <button 
                  onClick={addCustomTag}
                  disabled={!newTag.trim()}
                  className="inline-flex items-center gap-1 rounded-[16px] bg-[#3B82F6] px-3 py-1 text-md font-medium text-[#FFFFFF] hover:bg-[#3B82F6E6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>

            <p className="mb-2 mt-6 text-sm font-medium text-[#1E293B]">Session summary / Interpretation</p>
            <textarea
              rows={4}
              value={formData.sessionSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, sessionSummary: e.target.value }))}
              placeholder="Clinical interpretation of the session, themes observed, and student's response..."
              className={cn(inputBase, "resize-none")}
            />

            <p className="mb-2 mt-6 text-sm font-medium text-[#1E293B]">Additional Recommendations</p>
            <textarea
              rows={4}
              value={formData.manualRecommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, manualRecommendations: e.target.value }))}
              placeholder="Specific recommendations for the student, strategies to implement, and follow-up actions..."
              className={cn(inputBase, "resize-none")}
            />

            {/* Recommended Resources */}
            <div className="space-y-3">
              <p className="mb-2 mt-6 text-sm font-medium text-[#1E293B]">Recommended Resources</p>
              
              {/* Resource Type Selection */}
              <select 
                value={selectedResourceType}
                onChange={(e) => {
                  setSelectedResourceType(e.target.value);
                  setResourceSearchQuery("");
                }}
                className={cn(inputBase, "appearance-none bg-no-repeat pr-8")}
              >
                <option value="">Select resource type...</option>
                <option value="articles">📄 Articles</option>
                <option value="meditation">🧘 Meditation</option>
                <option value="music">🎵 Music</option>
              </select>

              {/* Resource Search and Selection */}
              {selectedResourceType && (
                <div className="space-y-2">
                  <Input
                    placeholder="Search resources..."
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    className={inputBase}
                  />
                  <div className="max-h-32 overflow-y-auto border rounded-lg divide-y">
                    {loadingResources ? (
                      <div className="px-3 py-2 text-sm text-[#64748B]">
                        Loading resources...
                      </div>
                    ) : (
                      availableResources[selectedResourceType]
                        ?.filter((r: any) => r.name.toLowerCase().includes(resourceSearchQuery.toLowerCase()))
                        .map((resource: any) => {
                          const isAlreadySelected = selectedResources.some(sr => sr.id === resource.id);
                          return (
                            <div
                              key={resource.id}
                              className={cn(
                                "flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors",
                                isAlreadySelected 
                                  ? "bg-[#E2E8F080] text-[#64748B]" 
                                  : "hover:bg-[#E2E8F04D]"
                              )}
                              onClick={() => {
                                if (!isAlreadySelected) {
                                  const typeLabel = selectedResourceType.charAt(0).toUpperCase() + selectedResourceType.slice(1);
                                  setSelectedResources([...selectedResources, {
                                    id: resource.id,
                                    name: resource.name,
                                    type: typeLabel,
                                    duration: resource.duration
                                  }]);
                                }
                              }}
                            >
                              <span>{resource.name}</span>
                              <span className="text-xs text-[#64748B] ml-2">({resource.duration})</span>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* Selected Resources Display */}
              {selectedResources.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-[#64748B]">Selected resources:</p>
                  <div className="space-y-1">
                    {selectedResources.map((resource, index) => (
                      <div key={resource.id} className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded text-sm">
                        <div>
                          <span className="text-[#1E293B]">{resource.name}</span>
                          <span className="text-xs text-[#64748B] ml-2">({resource.type} • {resource.duration})</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedResources(selectedResources.filter((_, i) => i !== index));
                          }}
                          className="text-[#64748B] hover:text-[#1E293B]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <button 
            onClick={completeIntake}
            disabled={saving}
            className="w-full rounded-xl bg-[#3B82F6] py-3.5 text-sm font-semibold text-[#FFFFFF] shadow-sm transition-colors hover:bg-[#3B82F6E6] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Preview and Continue'}
          </button>
        </div>
      )}

      {/* Preview Mode */}
      {mode === "preview" && (
        <div id="follow-up-preview" className="max-w-6xl mx-auto px-6 py-8 space-y-6 bg-white">
          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-10 shadow-sm">
            <h1 className="text-3xl font-bold text-[#1E293B]">Counselling Session Report</h1>
            <div className="mt-2 flex flex-wrap gap-x-10 gap-y-1 border-b border-[#E2E8F0] pb-4 text-sm text-[#64748B]">
              <span>Report Date : {intakeData.basicInfo.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>Period : {intakeData.basicInfo.monthYear || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <span>Place : {intakeData.basicInfo.place || session?.student?.school?.city || 'Not specified'}</span>
            </div>

            {/* Editable Intake Data in Preview */}
            {previousIntake && (
              <>
                <SectionTitle num="01" title="BASIC INFORMATION" />
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
                    <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">STUDENT NAME</div>
                    <div className="text-sm text-[#1E293B]">{`${session?.student?.firstName || ''} ${session?.student?.lastName || ''}`.trim() || 'Not specified'}</div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
                    <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">STUDENT ID</div>
                    <div className="text-sm text-[#1E293B]">{session?.student?.studentId || 'Not specified'}</div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
                    <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">AGE</div>
                    <div className="text-sm text-[#1E293B]">{intakeData.basicInfo.age ? `${intakeData.basicInfo.age} Yrs` : `${session?.student?.age || 'Not specified'} Yrs`}</div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
                    <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">GENDER</div>
                    <div className="text-sm text-[#1E293B]">{intakeData.basicInfo.gender || session?.student?.gender || 'Not specified'}</div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
                    <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">CLASS</div>
                    <div className="text-sm text-[#1E293B]">
                      {session?.student?.classRef?.name ||
                       session?.student?.classRef?.className ||
                       session?.student?.classRef?.grade ||
                       session?.student?.class ||
                       'Not specified'}
                    </div>
                  </div>
                </div>

                <SectionTitle num="02" title="PREDISPOSING & PRECIPITATING FACTORS" />
                <ul>
                  {intakeData.factors.predisposing.length > 0 ? (
                    intakeData.factors.predisposing.map((factor, index) => (
                      <Bullet key={index} text={factor} />
                    ))
                  ) : (
                    <Bullet text="Not specified" />
                  )}
                </ul>

                <SectionTitle num="03" title="FAMILY HISTORY" />
                <p className="text-sm leading-relaxed text-[#1E293B]">
                  {intakeData.familyHistory || 'Not specified'}
                </p>

                <SectionTitle num="04" title="PERSONAL HISTORY" />
                <p className="text-sm leading-relaxed text-[#1E293B]">
                  {intakeData.personalHistory || 'Not specified'}
                </p>

                <SectionTitle num="05" title="CHIEF COMPLAINTS" />
                <p className="text-sm text-[#64748B]">
                  {intakeData.complaints.durationStart && intakeData.complaints.durationEnd 
                    ? `Duration: ${intakeData.complaints.durationStart} — ${intakeData.complaints.durationEnd}`
                    : 'Duration: Not specified'}
                </p>
                <p className="mt-3 text-[11px] font-semibold tracking-wide text-[#64748B]">AS PER STUDENT</p>
                <ul className="mt-2">
                  {intakeData.complaints.complaints.length > 0 ? (
                    intakeData.complaints.complaints.map((complaint, index) => (
                      <Bullet key={index} text={complaint} />
                    ))
                  ) : (
                    <Bullet text="Not specified" />
                  )}
                </ul>

                {/* Previous Session Reports */}
                {previousReports.map((report, index) => (
                  <div key={report.sessionId}>
                    <SectionTitle num={`0${6 + index}`} title={`SESSION REPORT ${index + 1} (READ-ONLY) - ${new Date(report.sessionDate).toLocaleDateString()}`} />
                    <p className="mb-3 text-[11px] font-semibold tracking-wide text-[#64748B]">OBSERVATIONS DURING SESSION</p>
                    <div className="flex flex-wrap gap-2">
                      {(report.behavioralTags || []).length > 0 ? (
                        (report.behavioralTags || []).map((behavior: string) => (
                          <span
                            key={behavior}
                            className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1E293B]"
                          >
                            {behavior}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-md border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#64748B]">
                          Not specified
                        </span>
                      )}
                    </div>

                    <p className="mb-2 mt-6 text-[11px] font-semibold tracking-wide text-[#64748B]">
                      SESSION SUMMARY / INTERPRETATION
                    </p>
                    <p className="text-sm leading-relaxed text-[#1E293B]">
                      {report.summary || 'Not specified'}
                    </p>

                    <p className="mb-2 mt-6 text-[11px] font-semibold tracking-wide text-[#64748B]">
                      MANAGEMENT PLAN/RECOMMENDATION
                    </p>
                    <p className="text-sm leading-relaxed text-[#1E293B] whitespace-pre-wrap">
                      {(report.recommendations || []).join('\n') || 'Not specified'}
                    </p>
                  </div>
                ))}
              </>
            )}

            {/* Current Session Report */}
            <SectionTitle num={`0${6 + previousReports.length}`} title={`SESSION REPORT ${reportCount}`} />
            <p className="mb-3 text-[11px] font-semibold tracking-wide text-[#64748B]">OBSERVATIONS DURING SESSION</p>
            <div className="flex flex-wrap gap-2">
              {selectedBehaviors.length > 0 ? (
                selectedBehaviors.map((behavior) => (
                  <span
                    key={behavior}
                    className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#1E293B]"
                  >
                    {behavior}
                  </span>
                ))
              ) : (
                <span className="rounded-md border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#64748B]">
                  Not specified
                </span>
              )}
            </div>

            <p className="mb-2 mt-6 text-[11px] font-semibold tracking-wide text-[#64748B]">
              SESSION SUMMARY / INTERPRETATION
            </p>
            <p className="text-sm leading-relaxed text-[#1E293B]">
              {safeString(formData.sessionSummary) || 'Not specified'}
            </p>

            <p className="mb-2 mt-6 text-[11px] font-semibold tracking-wide text-[#64748B]">
              MANAGEMENT PLAN/RECOMMENDATION
            </p>
            <p className="text-sm leading-relaxed text-[#1E293B] whitespace-pre-wrap">
              {formData.manualRecommendations || 'Not specified'}
            </p>

            <div className="mt-2 rounded-xl bg-[#E2E8F099] p-5">
              <ul>
                {selectedResources.length > 0 ? (
                  selectedResources.map((resource, index) => (
                    <li key={index} className="flex gap-3 py-1.5">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#64748B]" />
                      <div className="flex-1">
                        <span className="text-sm leading-relaxed text-[#1E293B]">{resource.name}</span>
                        <span className="text-xs text-[#64748B] ml-2">({resource.type} • {resource.duration})</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="flex gap-3 py-1.5">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#64748B]" />
                    <span className="text-sm leading-relaxed text-[#1E293B]">No resources selected</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-8 border-t border-[#E2E8F0]" />
          </div>
          {/* Complete Session Button */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={submitReport}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-[13px] bg-[#3B82F6] px-6 py-2.5 text-[14px] font-medium text-[#FFFFFF] hover:bg-[#3B82F6E6] disabled:opacity-50 shadow-sm"
            >
              {saving ? (
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
        </div>
      )}

    </div>
  )
}
