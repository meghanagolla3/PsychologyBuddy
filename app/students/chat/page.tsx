'use client'

import { Suspense } from 'react'
import StudentLayout from "../../../src/components/StudentDashboard/Layout/StudentLayout";
import ChatInterface from '../../../src/components/StudentDashboard/ChatBuddy/ChatInterface';

function ChatPageContent() {
  return (
    <StudentLayout title="Chat">
      <ChatInterface />
    </StudentLayout>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading chat...</h1>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
