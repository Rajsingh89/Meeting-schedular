"use client"

import { MeetingScheduler } from "@/components/meeting-scheduler"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Meeting Scheduler
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Schedule and manage your meetings with style. Never miss an important meeting again with our intelligent
            reminder system.
          </p>
        </div>
        <MeetingScheduler />
      </div>
    </div>
  )
}
