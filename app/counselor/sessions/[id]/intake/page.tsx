'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Plus, ChevronUp, SquarePen, Check, X, Save, ArrowLeft, Download, Eye, BookOpen, Dumbbell, Lightbulb, Heart, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------------- Field ---------------- */
interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

const Field = ({ label, children, className }: FieldProps) => (
  <div className={className}>
    <label className="mb-1.5 block text-[14px] font-medium tracking-wide text-[#64748B]">
      {label}
    </label>
    {children}
  </div>
);

const inputBase =
  "w-full rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-md text-[#1E293B] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]";

/* ---------------- Chip ---------------- */
interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  variant?: "pill" | "tag";
}

const Chip = ({ label, selected, onClick, onRemove, variant = "pill" }: ChipProps) => {
  if (variant === "tag") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#E2E8F0] px-2.5 py-1 text-m  text-[#1E293B]">
        {label}
        {onRemove && (
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
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[15px] border px-4 py-1.5 text-md font-medium transition-colors",
        selected
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
  showEdit?: boolean;
}

const SectionCard = ({ number, title, children, showEdit }: SectionCardProps) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-[32px] border border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B82F6] text-md font-semibold text-[#FFFFFF]">
            {number}
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B]">{title}</h2>
        </div>
        <div className="flex items-center gap-3 text-[#64748B]"> 
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-md p-1 transition-colors hover:bg-[#E2E8F0]"
            aria-label="Toggle section"
          >
            <ChevronUp className={cn("h-4 w-4 transition-transform", !open && "rotate-180")} />
          </button>
          {showEdit && (
            <button className="rounded-md p-1 transition-colors hover:bg-[#E2E8F0]" aria-label="Edit section">
              <SquarePen className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {open && <div className="px-6 pb-6 pt-0">{children}</div>}
    </div>
  );
};

/* ---------------- Data ---------------- */
const informants = ["Parent", "Self", "Siblings", "Friend", "Guardian"];
const behaviors = [
  
];
const recommendationOptions = [
  "Mood Journal",
  "Breathing Exercise",
  "Thought Reframing",
  "Gratitude Log",
  "Progressive Relaxation",
  "Worry Time Box",
  "Emotion Wheel",
  "Body Scan",
];

const resourceIcons = {
  book: BookOpen,
  exercise: Dumbbell,
  prompt: Lightbulb,
};

const resourceTypes = [
  { id: "articles", label: "Psycho Education Articles", icon: BookOpen },
  { id: "meditation", label: "Meditation", icon: Heart },
  { id: "music", label: "Music Therapy", icon: Music },
];


export default function IntakeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  
  // New state for the EditView design
  const [selectedInformant, setSelectedInformant] = useState("Parent");
  const [activeComplaintTab, setActiveComplaintTab] = useState<"student" | "informant">("student");
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>(["Mild anxiety"]);
  const [selectedRecs, setSelectedRecs] = useState<string[]>(["Mood Journal", "Breathing Exercise"]);
  const [recommendations, setRecommendations] = useState<string[]>([
    "Journaling : Mood Journal",
    "Exercise : Breathing Exercise",
    "Exercise : Breathing Reflection",
  ]);

  // Form input states
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    place: '',
    age: '',
    gender: '',
    durationStart: '',
    durationEnd: '',
    complaints: [] as string[],
    predisposingFactors: [] as string[],
    familyHistory: '',
    personalHistory: '',
    sessionSummary: '',
    manualRecommendations: '',
    customTags: [] as string[],
  });

  // Current input values for dynamic fields
  const [currentComplaint, setCurrentComplaint] = useState('');
  const [currentPredisposingFactor, setCurrentPredisposingFactor] = useState('');
  const [currentCustomTag, setCurrentCustomTag] = useState('');

  // Resource selection state
  const [selectedResourceType, setSelectedResourceType] = useState<string>("");
  const [resourceSearchQuery, setResourceSearchQuery] = useState("");
  const [selectedResources, setSelectedResources] = useState<{ id: string; name: string; type: string; duration: string }[]>([]);
  const [availableResources, setAvailableResources] = useState<Record<string, { id: string; name: string; duration: string }[]>>({});
  const [loadingResources, setLoadingResources] = useState(false);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const addArrayItem = (field: 'complaints' | 'predisposingFactors' | 'customTags', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'complaints' | 'predisposingFactors' | 'customTags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const isFormValid = () => {
    return true; // Simplified for the new design
  };

  // Helper function to safely convert any value to string
  const safeString = (value: any): string => {
    console.log('safeString called with:', value, typeof value);
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      console.log('Processing object in safeString:', value);
      console.log('Object keys:', Object.keys(value));
      console.log('value.text:', value.text);
      console.log('typeof value.text:', typeof value.text);
      if (value.text) {
        if (typeof value.text === 'string') {
          console.log('Returning value.text as string:', value.text);
          return value.text;
        } else if (typeof value.text === 'object' && Object.keys(value.text).length === 0) {
          console.log('value.text is empty object, returning empty string');
          return '';
        } else if (typeof value.text === 'object') {
          console.log('value.text is object, converting to JSON');
          return JSON.stringify(value.text);
        } else {
          console.log('value.text is neither string nor object, converting to string');
          return String(value.text);
        }
      }
      if (Object.keys(value).length === 0) {
        console.log('Empty object detected, returning empty string');
        return '';
      }
      console.log('Returning JSON.stringify of object');
      return JSON.stringify(value);
    }
    return String(value);
  };

  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      
      console.log('Fetching resources...');
      
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
      
      console.log('Final resources by type:', resourcesByType);
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

  // Load resources when component mounts
  useEffect(() => {
    fetchResources();
  }, []);

  /* ---------------- Preview Components ---------------- */
  interface RowProps {
    label: string;
    value: string;
  }

  const Row = ({ label, value }: RowProps) => (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
      <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">{label}</div>
      <div className="text-sm text-[#1E293B]">{value}</div>
    </div>
  );

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

  const PreviewView = () => {
    // Debug logging - check for any object values that shouldn't be rendered
    console.log('PreviewView formData:', formData);
    console.log('Complaints:', formData.complaints);
    console.log('Predisposing factors:', formData.predisposingFactors);
    console.log('PersonalHistory type:', typeof formData.personalHistory, formData.personalHistory);
    console.log('FamilyHistory type:', typeof formData.familyHistory, formData.familyHistory);
    console.log('SessionSummary type:', typeof formData.sessionSummary, formData.sessionSummary);
    
    // Check if any value is an object that could cause the error
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        console.error(`Found object value in formData.${key}:`, value);
      }
    });
    
    // Format duration for display
    const formatDuration = () => {
      if (formData.durationStart && formData.durationEnd) {
        return `Duration: ${formData.durationStart} — ${formData.durationEnd}`;
      }
      return 'Duration: Not specified';
    };
    
    return (
      <div id="intake-preview" className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1E293B]">Counselling Session Report</h1>
        <div className="mt-2 flex flex-wrap gap-x-10 gap-y-1 border-b border-[#E2E8F0] pb-4 text-sm text-[#64748B]">
          <span>Report Date : {formData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>Period : {formData.monthYear || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <span>Place : {formData.place || session?.student?.school?.city || 'Not specified'}</span>
        </div>

        <SectionTitle num="01" title="BASIC INFORMATION" />
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Row label="STUDENT NAME" value={`${session?.student?.firstName || ''} ${session?.student?.lastName || ''}`.trim() || 'Not specified'} />
          <Row label="STUDENT ID" value={session?.student?.studentId || 'Not specified'} />
          <Row label="AGE" value={formData.age ? `${formData.age} Yrs` : `${session?.student?.age || 'Not specified'} Yrs`} />
          <Row label="GENDER" value={formData.gender || session?.student?.gender || 'Not specified'} />
          <Row label="CLASS" value={
            session?.student?.classRef?.name ||
            session?.student?.classRef?.className ||
            session?.student?.classRef?.grade ||
            session?.student?.class ||
            'Not specified'
          } />
          <Row label="INFORMANTS" value={selectedInformant} />
        </div>

        

        <SectionTitle num="02" title="PREDISPOSING & PRECIPITATING FACTORS" />
        <ul>
          {formData.predisposingFactors.length > 0 ? (
            formData.predisposingFactors.map((factor, index) => (
              <Bullet key={index} text={factor} />
            ))
          ) : (
            <Bullet text="Not specified" />
          )}
        </ul>

        <SectionTitle num="03" title="FAMILY HISTORY" />
        <p className="text-sm leading-relaxed text-[#1E293B]">
          {formData.familyHistory || 'Not specified'}
        </p>

        <SectionTitle num="04" title="PERSONAL HISTORY" />
        <p className="text-sm leading-relaxed text-[#1E293B]">
          {safeString(formData.personalHistory) || 'Not specified'}
        </p>

        <SectionTitle num="05" title="CHIEF COMPLAINTS" />
        <p className="text-sm text-[#64748B]">{formatDuration()}</p>
        <p className="mt-3 text-[11px] font-semibold tracking-wide text-[#64748B]">AS PER STUDENT</p>
        <ul className="mt-2">
          {formData.complaints.length > 0 ? (
            formData.complaints.map((complaint, index) => (
              <Bullet key={index} text={complaint} />
            ))
          ) : (
            <Bullet text="Not specified" />
          )}
        </ul>

        <SectionTitle num="06" title="SESSION REPORT" />
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
        

        {/* Manual Recommendations */}
        {formData.manualRecommendations && (
          <div>
            
            <p className="text-sm leading-relaxed text-[#1E293B] whitespace-pre-wrap">
              {safeString(formData.manualRecommendations)}
            </p>
          </div>
        )}
        
        {/* <p className="text-sm mt-3 leading-relaxed text-foreground">
          {selectedResources.length > 0 ? selectedResources.map(r => r.name).join(', ') : 'Not specified'}
        </p> */}

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
    );
  };

  // Load session data
  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      // Load session details
      const sessionResponse = await fetch(`/api/counselor/sessions/${sessionId}`);
      const sessionResult = await sessionResponse.json();
      
      if (sessionResult.success) {
        console.log('Session data received:', sessionResult.data);
        console.log('Student data:', sessionResult.data.student);
        console.log('All student fields:', Object.keys(sessionResult.data.student || {}));
        console.log('ClassRef data:', sessionResult.data.student?.classRef);
        console.log('Student class:', sessionResult.data.student?.class);
        console.log('Student section:', sessionResult.data.student?.section);
        setSession(sessionResult.data);
        
        // Load intake data if it exists
        await loadIntakeData();
      } else {
        setError('Failed to load session data');
      }
    } catch (err) {
      console.error('Error loading session data:', err);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const loadIntakeData = async () => {
    try {
      const intakeResponse = await fetch(`/api/counselor/sessions/${sessionId}/intake`);
      const intakeResult = await intakeResponse.json();
      
      if (intakeResult.success && intakeResult.data) {
        console.log('Intake data loaded:', intakeResult.data);
        
        // Update form data with saved values (map backend structure to frontend)
        const intake = intakeResult.data;
        console.log('Loading intake data structure:', intake);
        
        setFormData(prev => {
          const newFormData = {
            ...prev,
            date: intake.basicInfo?.date || prev.date,
            monthYear: intake.basicInfo?.monthYear || prev.monthYear,
            place: safeString(intake.basicInfo?.place),
            age: safeString(intake.basicInfo?.age),
            gender: safeString(intake.basicInfo?.gender),
            durationStart: safeString(intake.complaints?.durationStart),
            durationEnd: safeString(intake.complaints?.durationEnd),
            complaints: intake.complaints?.complaints || [],
            predisposingFactors: intake.factors?.predisposing || [],
            familyHistory: safeString(intake.familyHistory),
            personalHistory: safeString(intake.personalHistory),
            sessionSummary: safeString(intake.sessionReport?.sessionSummary),
            manualRecommendations: safeString(intake.sessionReport?.manualRecommendations || ''),
            customTags: intake.sessionReport?.customTags || [],
          };
          console.log('Setting formData with:', newFormData);
          console.log('personalHistory type:', typeof newFormData.personalHistory, newFormData.personalHistory);
          return newFormData;
        });
        
        // Update other state
        if (intake.basicInfo?.informant) {
          setSelectedInformant(intake.basicInfo.informant);
        }
        if (intake.sessionReport?.behaviors) {
          setSelectedBehaviors(intake.sessionReport.behaviors);
        }
        if (intake.sessionReport?.selectedResources) {
          setSelectedResources(intake.sessionReport.selectedResources);
        }
      } else {
        console.log('No intake data found, using defaults');
      }
    } catch (err) {
      console.error('Error loading intake data:', err);
      // Don't set error here, just continue with defaults
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Collect all form data
      const intakeData = {
        sessionId,
        basicInfo: {
          date: formData.date,
          monthYear: formData.monthYear,
          place: formData.place,
          age: formData.age || session?.student?.age,
          gender: formData.gender || session?.student?.gender,
          informant: selectedInformant,
        },
        chiefComplaints: {
          durationStart: formData.durationStart,
          durationEnd: formData.durationEnd,
          complaints: formData.complaints,
        },
        predisposingFactors: formData.predisposingFactors,
        familyHistory: formData.familyHistory,
        personalHistory: formData.personalHistory,
        sessionReport: {
          behaviors: selectedBehaviors,
          customTags: formData.customTags,
          sessionSummary: formData.sessionSummary,
          manualRecommendations: formData.manualRecommendations,
          recommendations: selectedResources.map(r => `${r.name} (${r.type} • ${r.duration})`),
          selectedResources: selectedResources,
        },
        status: 'DRAFT'
      };
      
      console.log('Saving intake data:', intakeData);
      
      // Send to API
      const response = await fetch(`/api/counselor/sessions/${sessionId}/intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(intakeData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Intake saved successfully');
        // You could add a success toast here
      } else {
        throw new Error(result.message || 'Failed to save intake');
      }
      
    } catch (err) {
      console.error('Save draft error:', err);
      setError('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const completeIntake = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Collect all form data
      const intakeData = {
        sessionId,
        basicInfo: {
          date: formData.date,
          monthYear: formData.monthYear,
          place: formData.place,
          age: formData.age || session?.student?.age,
          gender: formData.gender || session?.student?.gender,
          informant: selectedInformant,
        },
        chiefComplaints: {
          durationStart: formData.durationStart,
          durationEnd: formData.durationEnd,
          complaints: formData.complaints,
        },
        predisposingFactors: formData.predisposingFactors,
        familyHistory: formData.familyHistory,
        personalHistory: formData.personalHistory,
        sessionReport: {
          behaviors: selectedBehaviors,
          customTags: formData.customTags,
          sessionSummary: formData.sessionSummary,
          manualRecommendations: formData.manualRecommendations,
          recommendations: selectedResources.map(r => `${r.name} (${r.type} • ${r.duration})`),
          selectedResources: selectedResources,
        },
        status: 'DRAFT'
      };
      
      console.log('Saving intake data for preview:', intakeData);
      
      // Send to API
      const response = await fetch(`/api/counselor/sessions/${sessionId}/intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(intakeData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Intake saved successfully, switching to preview');
        // Switch to preview mode after successful save
        setMode('preview');
      } else {
        throw new Error(result.message || 'Failed to save intake');
      }
      
    } catch (err) {
      console.error('Save intake error:', err);
      setError('Failed to save intake');
    } finally {
      setSaving(false);
    }
  };

  const submitIntake = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Collect all form data with COMPLETED status
      const intakeData = {
        sessionId,
        basicInfo: {
          date: formData.date,
          monthYear: formData.monthYear,
          place: formData.place,
          age: formData.age || session?.student?.age,
          gender: formData.gender || session?.student?.gender,
          informant: selectedInformant,
        },
        chiefComplaints: {
          durationStart: formData.durationStart,
          durationEnd: formData.durationEnd,
          complaints: formData.complaints,
        },
        predisposingFactors: formData.predisposingFactors,
        familyHistory: formData.familyHistory,
        personalHistory: formData.personalHistory,
        sessionReport: {
          behaviors: selectedBehaviors,
          customTags: formData.customTags,
          sessionSummary: formData.sessionSummary,
          manualRecommendations: formData.manualRecommendations,
          recommendations: selectedResources.map(r => `${r.name} (${r.type} • ${r.duration})`),
          selectedResources: selectedResources,
        },
        status: 'COMPLETED'
      };
      
      console.log('Submitting intake with COMPLETED status:', intakeData);
      console.log('Current session status before submit:', session?.status);
      
      // Send to API
      const response = await fetch(`/api/counselor/sessions/${sessionId}/intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(intakeData),
      });
      
      const result = await response.json();
      
      console.log('API response:', result);
      
      if (result.success) {
        console.log('Intake completed successfully');
        // Show success message and redirect
        alert('Intake form submitted successfully! Session status has been updated to COMPLETED. Redirecting to sessions list...');
        // Redirect to sessions list
        setTimeout(() => {
          router.push('/counselor/sessions');
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to submit intake');
      }
      
      console.error('Submit intake error:', err);
      setError('Failed to submit intake');
    } finally {
      setSaving(false);
    }
  };

  const downloadPDF = async () => {
    const originalMode = mode;

    try {
      setDownloading(true);

      // Step 1: Save data first if in edit mode
      if (mode === 'edit') {
        await saveDraft();
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
      const content = document.getElementById("intake-preview");
      if (!content) throw new Error("Content not found");
      
      const clone = content.cloneNode(true) as HTMLElement;
      doc.body.appendChild(clone);

      // Step 6: Add print-specific styles
      const printStyle = doc.createElement('style');
      printStyle.textContent = `
        @page { size: A4; margin: 15mm; }
        body { background: white !important; padding: 0 !important; margin: 0 !important; }
        #intake-preview { width: 100% !important; border: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
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
      if (originalMode !== "preview") {
        setMode(originalMode);
      }
    } finally {
      setDownloading(false);
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-[#64748B]">Loading intake form...</div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-[#EF4444]">{error}</div>
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
            <h1 className="text-2xl font-bold text-[#1E293B]">Session Intake</h1>
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
              <Download className="h-3.5 w-3.5" /> {downloading ? 'Preparing...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Form Content - Conditional Rendering */}
        {mode === "edit" && (
          <div className="space-y-5">
          {/* 1. Basic Information */}
          <SectionCard number={1} title="Basic Information" showEdit>
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-4">
              <Field label="DATE">
                <div className="relative">
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className={cn(inputBase, "pr-8")} 
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                </div>
              </Field>
              <Field label="MONTH/YEAR">
                <input 
                  type="text" 
                  value={formData.monthYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthYear: e.target.value }))}
                  placeholder="Month Year"
                  className={inputBase} 
                />
              </Field>
              <Field label="PLACE">
                <input 
                  type="text" 
                  value={formData.place}
                  onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
                  placeholder="Enter place"
                  className={inputBase} 
                />
              </Field>
              <Field label="AGE">
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                  className={inputBase} 
                />
              </Field>

              <Field label="STUDENT NAME" className="md:col-span-2">
                <input 
                  type="text" 
                  value={`${session?.student?.firstName || ''} ${session?.student?.lastName || ''}`.trim() || 'Not specified'}
                  readOnly 
                  className={cn(inputBase, "bg-[#E2E8F0] cursor-not-allowed")} 
                />
              </Field>
              <Field label="STUDENT ID">
                <input 
                  type="text" 
                  value={session?.student?.studentId || 'Not specified'}
                  readOnly 
                  className={cn(inputBase, "bg-[#E2E8F0] cursor-not-allowed")} 
                />
              </Field>
              <Field label="GENDER">
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className={cn(inputBase, "appearance-none bg-no-repeat pr-8")}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </Field>

              <Field label="CLASS">
                <input 
                  type="text" 
                  value={
                    session?.student?.classRef?.name ||
                    session?.student?.classRef?.className ||
                    session?.student?.classRef?.grade ||
                    session?.student?.classRef?.gradeLevel ||
                    session?.student?.class ||
                    session?.student?.className ||
                    session?.student?.grade ||
                    session?.student?.gradeLevel ||
                    'Not specified'
                  }
                  readOnly 
                  className={cn(inputBase, "bg-[#E2E8F0] cursor-not-allowed")} 
                />
              </Field>
              {/* <Field label="SECTION">
                <input 
                  type="text" 
                  value={
                    session?.student?.classRef?.section ||
                    session?.student?.classRef?.sectionName ||
                    session?.student?.classRef?.division ||
                    session?.student?.section ||
                    session?.student?.sectionName ||
                    session?.student?.division ||
                    'Not specified'
                  }
                  readOnly 
                  className={cn(inputBase, "bg-[#E2E8F0] cursor-not-allowed")} 
                />
              </Field> */}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-[15px] font-semibold tracking-wide text-[#64748B]">
                INFORMANTS
              </label>
              <div className="flex flex-wrap gap-2">
                {informants.map((i) => (
                  <Chip key={i} label={i} selected={selectedInformant === i} onClick={() => setSelectedInformant(i)} />
                ))}
              </div>
            </div>
          </SectionCard>

          

          {/* 3. Predisposing & Precipitating */}
          <SectionCard number={2} title="Predisposing & Precipitating factors">
            <div className="space-y-2">
              {formData.predisposingFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={factor} 
                    readOnly 
                    className={cn(inputBase, "bg-[#E2E8F0] cursor-not-allowed")} 
                  />
                  <button
                    onClick={() => removeArrayItem('predisposingFactors', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={currentPredisposingFactor}
                  onChange={(e) => setCurrentPredisposingFactor(e.target.value)}
                  placeholder="Predisposing factor" 
                  className={inputBase} 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('predisposingFactors', currentPredisposingFactor);
                      setCurrentPredisposingFactor('');
                    }
                  }}
                />
              </div>
                <button 
                  onClick={() => {
                    addArrayItem('predisposingFactors', currentPredisposingFactor);
                    setCurrentPredisposingFactor('');
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-md font-medium text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Point
                </button>
            </div>
          </SectionCard>

          {/* 4. Family history */}
          <SectionCard number={4} title="Family history">
            <textarea
              rows={4}
              value={formData.familyHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
              placeholder="The student lives in a nuclear family with both parents and one younger siblings."
              className={cn(inputBase, "resize-none")}
            />
          </SectionCard>

          {/* 5. Personal History */}
          <SectionCard number={3} title="Personal History">
            <textarea
              rows={4}
              value={formData.personalHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, personalHistory: e.target.value }))}
              placeholder="Enter personal history details..."
              className={cn(inputBase, "resize-none")}
            />
          </SectionCard>

          {/* 2. Chief Complaints */}

          <SectionCard number={5} title="Chief Complaints">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="DURATION - START DATE">
                <div className="relative">
                  <input 
                    type="date" 
                    value={formData.durationStart}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationStart: e.target.value }))}
                    className={cn(inputBase, "pr-8")} 
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                </div>
              </Field>
              <Field label="DURATION - END DATE">
                <div className="relative">
                  <input 
                    type="date" 
                    value={formData.durationEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationEnd: e.target.value }))}
                    className={cn(inputBase, "pr-8")} 
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                </div>
              </Field>
            </div>

            <div className="mt-4 mb-3 inline-flex rounded-lg bg-[#E2E8F0] p-1">
              {(["student", "informant"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveComplaintTab(tab)}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
                    activeComplaintTab === tab
                      ? "bg-card text-foreground shadow-sm"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  )}
                >
                  {tab === "student" ? "As per Student" : "As per Informant"}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {formData.complaints.map((complaint, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={complaint} 
                    readOnly 
                    className={cn(inputBase, "bg-[#E2E8F0] cursor-not-allowed")} 
                  />
                  <button
                    onClick={() => removeArrayItem('complaints', index)}
                    className="text-[#EF4444] hover:text-[#DC2626]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={currentComplaint}
                  onChange={(e) => setCurrentComplaint(e.target.value)}
                  placeholder="Complaint as reported by the informant" 
                  className={cn(inputBase, "mt-4")} 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('complaints', currentComplaint);
                      setCurrentComplaint('');
                    }
                  }}
                />
              </div>
                <button 
                  onClick={() => {
                    addArrayItem('complaints', currentComplaint);
                    setCurrentComplaint('');
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#065CC6] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5 text-[#065CC6]" /> Add Point
                </button>
            </div>
          </SectionCard>

          {/* 6. Session Report */}
          <SectionCard number={6} title="Session Report">
            <p className="mb-2 text-sm font-medium text-[#1E293B]">Observations during Session</p>
            
            <div className="mt-3">
              {/* <p className="mb-2 text-xs font-medium text-[#64748B]">Custom tags:</p> */}
              <div className="flex flex-wrap gap-2">
                {formData.customTags.map((tag, index) => (
                  <div key={tag} className="flex items-center gap-1">
                    <Chip
                      label={tag}
                      selected={selectedBehaviors.includes(tag)}
                  onClick={() => toggle(selectedBehaviors, tag, setSelectedBehaviors)}
                    />
                    <button
                      onClick={() => removeArrayItem('customTags', index)}
                      className="text-[#64748B] hover:text-[#1E293B] ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input 
                  type="text" 
                  value={currentCustomTag}
                  onChange={(e) => setCurrentCustomTag(e.target.value)}
                  placeholder="Add a Custom tag" 
                  className={cn(inputBase, "max-w-xs")} 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('customTags', currentCustomTag);
                      setCurrentCustomTag('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    addArrayItem('customTags', currentCustomTag);
                    setCurrentCustomTag('');
                  }}
                  className="inline-flex items-center gap-1 rounded-[16px] bg-[#3B82F6] px-3 py-1 text-md font-medium text-[#FFFFFF] hover:bg-[#3B82F6E6]"
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

            {/* Recommended Resources */}
            <div className="space-y-3">
              <p className="mb-2 mt-6 text-sm font-medium text-[#1E293B]">Recommended Resources</p>
              
              

              {/* Step 1: Select Resource Type */}
              <Select value={selectedResourceType} onValueChange={(value) => {
                setSelectedResourceType(value);
                setResourceSearchQuery("");
              }}>
                <SelectTrigger className={inputBase}>
                  <SelectValue placeholder="Select resource type..." />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Step 2: Select Specific Resource */}
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
                                  const typeLabel = resourceTypes.find(t => t.id === selectedResourceType)?.label || selectedResourceType;
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
                              <span className="text-xs text-[#64748B]">{resource.duration}</span>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* Selected Resources Display */}
              {selectedResources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-[#64748B]">Selected resources:</p>
                  <div className="space-y-1">
                    {selectedResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between rounded-lg border border-[#3B82F64D] bg-[#3B82F60D] px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1E293B] truncate">{resource.name}</p>
                          <p className="text-xs text-[#64748B]">{resource.type} • {resource.duration}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => setSelectedResources(selectedResources.filter(r => r.id !== resource.id))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Recommendations Text Area */}
              <div className="mt-4 space-y-2">
                {/* <p className="text-sm font-medium text-foreground">Additional Recommendations</p> */}
                <textarea
                  rows={4}
                  value={formData.manualRecommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, manualRecommendations: e.target.value }))}
                  placeholder="Enter additional recommendations, suggestions, or notes for the student..."
                  className={cn(inputBase, "resize-none")}
                />
              </div>
      
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

        {mode === "preview" && (
          <div className="space-y-5">
            <PreviewView />
            
            {/* Submit Button */}
            <div className="mt-6">
              <button 
                onClick={submitIntake}
                disabled={saving}
                className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Submitting...' : 'Submit Intake Form'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
