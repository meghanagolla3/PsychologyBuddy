"use client";

import React, { useEffect, useState, use } from "react";
import SummaryModal from "@/src/components/StudentDashboard/ChatBuddy/SummaryModal";

interface SummaryPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function SummaryPage({ params }: SummaryPageProps) {
  const { sessionId } = use(params) as { sessionId: string };


  const [summary, setSummary] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const fetchSummary = async () => {
      const res = await fetch(`/api/students/summary/${sessionId}`, {
        cache: "no-store",
        headers: {
          'x-user-id': 'student1' // In production, get from auth context
        }
      });



      const data = await res.json();

      if (data.success) {

        setSummary(data.data);

      }

      setLoading(false);

    };



    fetchSummary();

  }, [sessionId]);



  if (loading) {

    return <div className="p-10 text-center">Loading summary...</div>;

  }



  if (!summary) {

    return <div className="p-10 text-center">Summary not found</div>;

  }



  return (

    <SummaryModal

      isOpen={true}

      summary={{

        mainTopic: summary.mainTopic,

        conversationStart: summary.conversationStart,

        conversationAbout: summary.conversationAbout,

        reflection: summary.reflection,

        createdAt: summary.createdAt

      }}

      onClose={() => window.location.href = "/students/chat"}

      onImport={() =>

        window.location.href = `/students/chat?import=${encodeURIComponent(

          summary.reflection

        )}`

      }

    />

  );

}

