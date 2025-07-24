"use client"

import { useState } from "react"
import { Plus, Settings, Bell, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MeetingForm } from "./meeting-form"
import { MeetingList } from "./meeting-list"
import { NotificationSettings } from "./notification-settings"
import { NotificationManager } from "./notification-manager"
import { useMeetingStore } from "@/lib/meeting-store"

export function MeetingScheduler() {
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const meetings = useMeetingStore((state) => state.meetings)

  const handleEdit = (id: string) => {
    setEditingMeeting(id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMeeting(null)
  }

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const upcomingMeetings = filteredMeetings.filter((m) => new Date(m.startDate) > new Date()).length
  const todayMeetings = filteredMeetings.filter((m) => {
    const today = new Date()
    const meetingDate = new Date(m.startDate)
    return meetingDate.toDateString() === today.toDateString()
  }).length

  return (
    <>
      <NotificationManager />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-4xl font-bold mb-2">Your Meetings</h2>
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>{meetings.length} total meetings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>{upcomingMeetings} upcoming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>{todayMeetings} today</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl" />
        </div>

        {/* Search and Filter Bar */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search meetings by title or participants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <Button variant="outline" className="h-12 px-6 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Form Modal */}
        {showForm && (
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="text-2xl font-bold">
                {editingMeeting ? "Edit Meeting" : "Schedule New Meeting"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MeetingForm editingId={editingMeeting} onClose={handleCloseForm} />
            </CardContent>
          </Card>
        )}

        {/* Notification Settings Modal */}
        {showSettings && (
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-green-600" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <NotificationSettings onClose={() => setShowSettings(false)} />
            </CardContent>
          </Card>
        )}

        {/* Meeting List */}
        <MeetingList onEdit={handleEdit} />
      </div>
    </>
  )
}
