'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface IntakeData {
  basicInfo?: {
    date?: string;
    monthYear?: string;
    place?: string;
    age?: string;
    gender?: string;
    informant?: string;
  };
  complaints?: {
    durationStart?: string;
    durationEnd?: string;
    complaints?: string[];
  };
  factors?: {
    predisposing?: string[];
  };
  familyHistory?: string;
  personalHistory?: {
    text?: string;
  };
  sessionReport?: {
    behaviors?: string[];
    customTags?: string[];
    sessionSummary?: string;
    manualRecommendations?: string;
    recommendations?: string[];
    selectedResources?: Array<{
      id: string;
      name: string;
      type: string;
      duration: string;
    }>;
  };
  sessionReports?: Array<{
    sessionNumber: number;
    sessionId: string;
    report: {
      behavioralTags?: string[];
      summary?: string;
      recommendations?: string[];
      notes?: string;
    };
  }>;
}

interface Session {
  id: string;
  student: {
    firstName: string;
    lastName: string;
    age?: number;
    gender?: string;
    studentId?: string;
    classRef?: {
      id: string;
      name: string;
      grade: string;
      section: string;
    };
  };
}

export default function AdminCompletedSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchIntakeData();
  }, [sessionId]);

  const fetchIntakeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch session data to determine session type
      // Using counselor API as it has proper permissions for ADMIN/SUPERADMIN
      const sessionResponse = await fetch(`/api/counselor/sessions/${sessionId}`);
      const sessionResult = await sessionResponse.json();

      if (!sessionResult.success) {
        throw new Error(sessionResult.message || 'Failed to fetch session data');
      }

      const sessionData = sessionResult.data;
      setSession(sessionData);

      // Check if this is a follow-up session
      if (sessionData.sessionType === 'FOLLOW_UP') {
        // Fetch current follow-up report data
        const currentReportResponse = await fetch(`/api/counselor/sessions/${sessionId}/report`);
        const currentReportResult = await currentReportResponse.json();

        if (!currentReportResult.success) {
          throw new Error(currentReportResult.message || 'Failed to fetch follow-up report data');
        }

        // Fetch ALL previous follow-up session reports in the chain
        const allPreviousReports = [];
        let currentPreviousSessionId = sessionData.previousSessionId;
        let reportTraversalCount = 0;
        const maxReportTraversal = 10; // Prevent infinite loops

        while (currentPreviousSessionId && reportTraversalCount < maxReportTraversal) {
          try {
            // Check if this session is a follow-up session
            const previousSessionResponse = await fetch(`/api/counselor/sessions/${currentPreviousSessionId}`);
            const previousSessionResult = await previousSessionResponse.json();
            
            if (!previousSessionResult.success) {
              break;
            }
            
            const sessionData = previousSessionResult.data;
            
            if (sessionData?.sessionType === 'FOLLOW_UP') {
              // Fetch report if it's a follow-up session
              const previousReportResponse = await fetch(`/api/counselor/sessions/${currentPreviousSessionId}/report`);
              const previousReportResult = await previousReportResponse.json();
              
              if (previousReportResult.success) {
                allPreviousReports.unshift({
                  sessionId: currentPreviousSessionId,
                  report: previousReportResult.data
                });
              }
            } else {
              break; // Stop when we hit an intake session
            }
            
            // Move to the next previous session
            currentPreviousSessionId = sessionData?.previousSessionId;
          } catch (err) {
            break;
          }
          
          reportTraversalCount++;
        }

        // Fetch original intake data by traversing back through session chain
        let originalIntakeData = null;
        let currentSessionId = sessionData.previousSessionId;
        let traversalCount = 0;
        const maxTraversal = 10; // Prevent infinite loops

        while (currentSessionId && traversalCount < maxTraversal) {
          try {
            // First try to get intake data from this session
            const intakeResponse = await fetch(`/api/counselor/sessions/${currentSessionId}/intake`);
            const intakeResult = await intakeResponse.json();
            
            if (intakeResult.success && intakeResult.data) {
              originalIntakeData = intakeResult.data;
              break; // Found the intake data, exit loop
            } else {
              // Get this session's previous session to continue traversal
              const sessionResponse = await fetch(`/api/counselor/sessions/${currentSessionId}`);
              const sessionResult = await sessionResponse.json();
              
              if (sessionResult.success && sessionResult.data?.previousSessionId) {
                currentSessionId = sessionResult.data.previousSessionId;
              } else {
                break; // No more previous sessions in chain
              }
            }
          } catch (err) {
            break; // Failed to check this session
          }
          
          traversalCount++;
        }

        // Collect all session reports for separate display
        const sessionReports = [];
        
        // Always add intake session report as SESSION REPORT 1 if we have previous sessions
        if (sessionData.previousSessionId && originalIntakeData) {
          // Use actual tags from intake session report
          const intakeBehavioralTags = originalIntakeData?.sessionReport?.behaviors || 
                                     originalIntakeData?.sessionReport?.behavioralTags || 
                                     originalIntakeData?.sessionReport?.customTags || [];
          
          // Create a session report from intake data for the original intake session
          const intakeReportFromOriginal = {
            behavioralTags: intakeBehavioralTags, // Use actual tags from intake
            summary: originalIntakeData?.sessionReport?.sessionSummary || originalIntakeData?.sessionReport?.summary || 'Intake session completed - Initial assessment and information gathering',
            recommendations: originalIntakeData?.sessionReport?.recommendations || ['Continue with follow-up sessions as needed'],
            notes: originalIntakeData?.sessionReport?.notes || 'Initial intake session completed. Student information gathered and assessment initiated.'
          };
          sessionReports.push({
            sessionNumber: 1,
            sessionId: 'intake-session',
            report: intakeReportFromOriginal
          });
        }
        
        // Add all previous follow-up session reports
        allPreviousReports.forEach((prevReport, index) => {
          const reportNumber = sessionReports.length + 1;
          sessionReports.push({
            sessionNumber: reportNumber,
            sessionId: prevReport.sessionId,
            report: prevReport.report
          });
        });
        
        // Add current follow-up session report
        const currentSessionNumber = sessionReports.length + 1;
        sessionReports.push({
          sessionNumber: currentSessionNumber,
          sessionId: sessionId,
          report: currentReportResult.data
        });
        
        // Combine original intake data with current follow-up report data
        const followUpData = {
          ...originalIntakeData, // Include all original intake data
          basicInfo: {
            ...(originalIntakeData?.basicInfo || {}),
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            place: originalIntakeData?.basicInfo?.place || sessionData.student?.school?.city || 'Not specified',
            age: originalIntakeData?.basicInfo?.age || sessionData.student?.age?.toString(),
            gender: originalIntakeData?.basicInfo?.gender || sessionData.student?.gender,
            informant: originalIntakeData?.basicInfo?.informant || 'Follow-up Session',
          },
          // Store all session reports for separate rendering
          sessionReports: sessionReports,
          // Keep current session report for backward compatibility
          sessionReport: {
            behaviors: currentReportResult.data.behavioralTags || [],
            customTags: currentReportResult.data.behavioralTags || [],
            sessionSummary: currentReportResult.data.summary || currentReportResult.data.notes || '',
            manualRecommendations: currentReportResult.data.recommendations?.join('\n') || '',
            recommendations: currentReportResult.data.recommendations || [],
            selectedResources: [],
            notes: currentReportResult.data.notes || '',
          },
        };

        setIntakeData(followUpData);
      } else {
        // Fetch intake data for regular sessions
        const intakeResponse = await fetch(`/api/counselor/sessions/${sessionId}/intake`);
        const intakeResult = await intakeResponse.json();

        if (!intakeResult.success) {
          throw new Error(intakeResult.message || 'Failed to fetch intake data');
        }

        setIntakeData(intakeResult.data);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load intake data');
    } finally {
      setLoading(false);
    }
  };

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      if (value.text && typeof value.text === 'string') return value.text;
      return JSON.stringify(value);
    }
    return String(value);
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);

      const element = document.getElementById('intake-preview');
      if (!element) {
        throw new Error('Preview element not found');
      }

      // Ensure A4 layout BEFORE capture
      const originalStyles = {
        width: element.style.width,
        minHeight: element.style.minHeight,
        background: element.style.background,
        padding: element.style.padding,
        boxSizing: element.style.boxSizing,
      };

      element.style.width = '794px';   // A4 width (96 DPI)
      element.style.minHeight = '1123px';
      element.style.background = '#ffffff';
      element.style.padding = '40px';
      element.style.boxSizing = 'border-box';

      // Small delay to ensure styles are applied
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture canvas (NO manual width/height)
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Restore original styles
      Object.assign(element.style, originalStyles);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = 210;
      const pdfHeight = 297;

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;

      // Handle multi-page (IMPORTANT)
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      // File name
      const studentName =
        session?.student?.firstName && session?.student?.lastName
          ? `${session.student.firstName}_${session.student.lastName}` 
          : 'student';

      const date = new Date().toISOString().split('T')[0];
      const filename = `intake_form_${studentName}_${date}.pdf`;

      // Download
      pdf.save(filename);

    } catch (error) {
      console.error('PDF download error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      setError(`Failed to download PDF: ${errorMessage}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-[#64748B]">Loading completed session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!intakeData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-[#64748B]">No intake data found for this session</div>
      </div>
    );
  }

  const basicInfo = intakeData.basicInfo || {};
  const complaints = intakeData.complaints || {};
  const factors = intakeData.factors || {};
  const sessionReport = intakeData.sessionReport || {};
  const isFollowUpSession = (session as any)?.sessionType === 'FOLLOW_UP';

  // Component definitions to match exact preview design
interface RowProps {
  label: string;
  value: string;
}

const SectionTitle = ({ num, title }: { num: string; title: string }) => (
  <div className="mb-3 mt-8 border-b border-[#E2E8F0] pb-2">
    <h3 className="text-sm font-semibold tracking-wide text-[#3B82F6]">
      {num}  {title}
    </h3>
  </div>
);

const Row = ({ label, value }: RowProps) => (
  <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
    <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">{label}</div>
    <div className="text-sm text-[#1E293B]">{value}</div>
  </div>
);

const Bullet = ({ text }: { text: string }) => (
  <li className="flex gap-3 py-1.5">
    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3B82F6]" />
    <span className="text-sm leading-relaxed text-[#1E293B]">{text}</span>
  </li>
);

const formatDuration = () => {
  if (complaints.durationStart && complaints.durationEnd) {
    return `From ${complaints.durationStart} to ${complaints.durationEnd}`;
  }
  return 'Not specified';
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-[13px] border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-[14px] font-medium text-[#1E293B] hover:bg-[#E2E8F0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-[13px] border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-[14px] font-medium text-[#1E293B] hover:bg-[#E2E8F0] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>

        {/* Preview Card - Exact match from intake form */}
        <div id="intake-preview" className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#1E293B]">Counselling Session Report</h1>
          <div className="mt-2 flex flex-wrap gap-x-10 gap-y-1 border-b border-[#E2E8F0] pb-4 text-sm text-[#64748B]">
            <span>Report Date : {basicInfo.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>Period : {basicInfo.monthYear || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <span>Place : {basicInfo.place || 'Not specified'}</span>
          </div>

          {isFollowUpSession ? (
            <>
              {/* Follow-up Session Preview */}
              {intakeData.basicInfo && (
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
                      <div className="text-sm text-[#1E293B]">{basicInfo.age ? `${basicInfo.age} Yrs` : `${session?.student?.age || 'Not specified'} Yrs`}</div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
                      <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">GENDER</div>
                      <div className="text-sm text-[#1E293B]">{basicInfo.gender || session?.student?.gender || 'Not specified'}</div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
                      <div className="text-[11px] font-semibold tracking-wide text-[#64748B]">CLASS</div>
                      <div className="text-sm text-[#1E293B]">
                        {session?.student?.classRef?.name ||
                         session?.student?.classRef?.grade ||
                         'Not specified'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {intakeData.factors && (
                <>
                  <SectionTitle num="02" title="PREDISPOSING & PRECIPITATING FACTORS" />
                  <ul>
                    {intakeData.factors.predisposing && intakeData.factors.predisposing.length > 0 ? (
                      intakeData.factors.predisposing.map((factor, index) => (
                        <Bullet key={index} text={factor} />
                      ))
                    ) : (
                      <Bullet text="Not specified" />
                    )}
                  </ul>
                </>
              )}

              {intakeData.familyHistory !== undefined && (
                <>
                  <SectionTitle num="03" title="FAMILY HISTORY" />
                  <p className="text-sm leading-relaxed text-[#1E293B]">
                    {safeString(intakeData.familyHistory) || 'Not specified'}
                  </p>
                </>
              )}

              {intakeData.personalHistory !== undefined && (
                <>
                  <SectionTitle num="04" title="PERSONAL HISTORY" />
                  <p className="text-sm leading-relaxed text-[#1E293B]">
                    {safeString(intakeData.personalHistory?.text || intakeData.personalHistory) || 'Not specified'}
                  </p>
                </>
              )}

              {intakeData.complaints && (
                <>
                  <SectionTitle num="05" title="CHIEF COMPLAINTS" />
                  <p className="text-sm text-[64748B]">
                    {intakeData.complaints.durationStart && intakeData.complaints.durationEnd 
                      ? `Duration: ${intakeData.complaints.durationStart} — ${intakeData.complaints.durationEnd}`
                      : 'Duration: Not specified'}
                  </p>
                  <p className="mt-3 text-[11px] font-semibold tracking-wide text-[#64748B]">AS PER STUDENT</p>
                  <ul className="mt-2">
                    {intakeData.complaints.complaints && intakeData.complaints.complaints.length > 0 ? (
                      intakeData.complaints.complaints.map((complaint, index) => (
                        <Bullet key={index} text={complaint} />
                      ))
                    ) : (
                      <Bullet text="Not specified" />
                    )}
                  </ul>
                </>
              )}

              {intakeData.sessionReports && intakeData.sessionReports.length > 0 ? (
                intakeData.sessionReports.map((sessionReportData, index) => (
                  <div key={sessionReportData.sessionId}>
                    <SectionTitle 
                      num={`0${6 + index}`} 
                      title={`SESSION REPORT ${sessionReportData.sessionNumber}`} 
                    />
                    <p className="mb-3 text-[11px] font-semibold tracking-wide text-[#64748B]">OBSERVATIONS DURING SESSION</p>
                    <div className="flex flex-wrap gap-2">
                      {sessionReportData.report.behavioralTags && sessionReportData.report.behavioralTags.length > 0 ? (
                        sessionReportData.report.behavioralTags.map((behavior, tagIndex) => (
                          <span
                            key={`${behavior}-${tagIndex}`}
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
                      {sessionReportData.report.summary || sessionReportData.report.notes || 'Not specified'}
                    </p>

                    <p className="mb-2 mt-6 text-[11px] font-semibold tracking-wide text-[#64748B]">
                      RECOMMENDATIONS
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {sessionReportData.report.recommendations && sessionReportData.report.recommendations.length > 0 ? (
                        sessionReportData.report.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-[#1E293B]">
                            {recommendation}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-[#64748B]">Not specified</li>
                      )}
                    </ul>
                  </div>
                ))
              ) : (
                <>
                  <SectionTitle num="06" title="SESSION REPORT" />
                  <p className="mb-3 text-[11px] font-semibold tracking-wide text-[#64748B]">OBSERVATIONS DURING SESSION</p>
                  <div className="flex flex-wrap gap-2">
                    {sessionReport.behaviors && sessionReport.behaviors.length > 0 ? (
                      sessionReport.behaviors.map((behavior) => (
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
                    {sessionReport.sessionSummary || 'Not specified'}
                  </p>

                  <p className="mb-2 mt-6 text-[11px] font-semibold tracking-wide text-[#64748B]">
                    RECOMMENDATIONS
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {sessionReport.recommendations && sessionReport.recommendations.length > 0 ? (
                      sessionReport.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-[#1E293B]">
                          {recommendation}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-[#64748B]">Not specified</li>
                    )}
                  </ul>
                </>
              )}
            </>
          ) : (
            <>
              {/* Intake Session Preview */}
              <SectionTitle num="01" title="BASIC INFORMATION" />
              <div className="grid grid-cols-1 md:grid-cols-2">
                <Row label="STUDENT NAME" value={`${session?.student?.firstName || ''} ${session?.student?.lastName || ''}`.trim() || 'Not specified'} />
                <Row label="STUDENT ID" value={session?.student?.studentId || 'Not specified'} />
                <Row label="AGE" value={basicInfo.age ? `${basicInfo.age} Yrs` : `${session?.student?.age || 'Not specified'} Yrs`} />
                <Row label="GENDER" value={basicInfo.gender || session?.student?.gender || 'Not specified'} />
                <Row label="CLASS" value={
                  session?.student?.classRef?.name ||
                  session?.student?.classRef?.grade + (session?.student?.classRef?.section ? ` - ${session.student.classRef.section}` : '') ||
                  'Not specified'
                } />
                <Row label="INFORMANTS" value={basicInfo.informant || 'Not specified'} />
              </div>

              <SectionTitle num="02" title="PREDISPOSING & PRECIPITATING FACTORS" />
              <ul>
                {factors.predisposing && factors.predisposing.length > 0 ? (
                  factors.predisposing.map((factor, index) => (
                    <Bullet key={index} text={factor} />
                  ))
                ) : (
                  <Bullet text="Not specified" />
                )}
              </ul>

              <SectionTitle num="03" title="FAMILY HISTORY" />
              <p className="text-sm leading-relaxed text-[#1E293B]">
                {safeString(intakeData.familyHistory) || 'Not specified'}
              </p>

              <SectionTitle num="04" title="PERSONAL HISTORY" />
              <p className="text-sm leading-relaxed text-[#1E293B]">
                {safeString(intakeData.personalHistory?.text) || 'Not specified'}
              </p>

              <SectionTitle num="05" title="CHIEF COMPLAINTS" />
              <p className="text-sm text-[64748B]">{formatDuration()}</p>
              <p className="mt-3 text-[11px] font-semibold tracking-wide text-[#64748B]">AS PER STUDENT</p>
              <ul className="mt-2">
                {complaints.complaints && complaints.complaints.length > 0 ? (
                  complaints.complaints.map((complaint, index) => (
                    <Bullet key={index} text={complaint} />
                  ))
                ) : (
                  <Bullet text="Not specified" />
                )}
              </ul>

              <SectionTitle num="06" title="SESSION REPORT" />
              <p className="mb-3 text-[11px] font-semibold tracking-wide text-[#64748B]">OBSERVATIONS DURING SESSION</p>
              <div className="flex flex-wrap gap-2">
                {sessionReport.behaviors && sessionReport.behaviors.length > 0 ? (
                  sessionReport.behaviors.map((behavior) => (
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
                {sessionReport.sessionSummary || 'Not specified'}
              </p>

              <p className="mb-2 mt-6 text-[11px] font-semibold tracking-wide text-[#64748B]">
                RECOMMENDATIONS
              </p>
              <ul className="list-disc list-inside space-y-1">
                {sessionReport.recommendations && sessionReport.recommendations.length > 0 ? (
                  sessionReport.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-[#1E293B]">
                      {recommendation}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#64748B]">Not specified</li>
                )}
              </ul>
            </>
          )}

          <div className="mt-8 border-t border-[#E2E8F0]" />
        </div>
      </div>
    </div>
  );
}
