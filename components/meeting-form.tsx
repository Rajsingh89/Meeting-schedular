"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calendar, Clock, Users, FileText, AlertCircle, MapPin, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateTimePicker } from "./date-time-picker"
import { useMeetingStore, type Meeting } from "@/lib/meeting-store"

interface MeetingFormProps {
  editingId?: string | null
  onClose: () => void
}

const categoryColors = {
  work: "bg-blue-500",
  personal: "bg-green-500",
  urgent: "bg-red-500",
  casual: "bg-purple-500",
}

const categoryLabels = {
  work: "Work",
  personal: "Personal",
  urgent: "Urgent",
  casual: "Casual",
}

export function MeetingForm({ editingId, onClose }: MeetingFormProps) {
  const { meetings, addMeeting, updateMeeting } = useMeetingStore()
  const [formData, setFormData] = useState({
    title: "",
    participants: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 60 * 1000),
    description: "",
    category: "work" as const,
    location: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (editingId) {
      const meeting = meetings.find((m) => m.id === editingId)
      if (meeting) {
        setFormData({
          title: meeting.title,
          participants: meeting.participants.join(", "),
          startDate: new Date(meeting.startDate),
          endDate: new Date(meeting.endDate),
          description: meeting.description || "",
          category: meeting.category,
          location: meeting.location || "",
        })
      }
    }
  }, [editingId, meetings])

  const checkTimeConflict = (start: Date, end: Date, excludeId?: string) => {
    return meetings.some((meeting) => {
      if (excludeId && meeting.id === excludeId) return false

      const meetingStart = new Date(meeting.startDate)
      const meetingEnd = new Date(meeting.endDate)

      return (
        (start >= meetingStart && start < meetingEnd) ||
        (end > meetingStart && end <= meetingEnd) ||
        (start <= meetingStart && end >= meetingEnd)
      )
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError("Meeting title is required")
      return
    }

    if (!formData.participants.trim()) {
      setError("At least one participant is required")
      return
    }

    if (formData.startDate >= formData.endDate) {
      setError("End time must be after start time")
      return
    }

    if (checkTimeConflict(formData.startDate, formData.endDate, editingId || undefined)) {
      setError("This time slot conflicts with an existing meeting")
      return
    }

    const meetingData: Omit<Meeting, "id"> = {
      title: formData.title.trim(),
      participants: formData.participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      location: formData.location.trim() || undefined,
    }

    if (editingId) {
      updateMeeting(editingId, meetingData)
    } else {
      addMeeting(meetingData)
    }

    onClose()
  }

  const handleStartDateChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date,
      endDate: prev.endDate <= date ? new Date(date.getTime() + 60 * 60 * 1000) : prev.endDate,
    }))
  }

  const handleEndDateChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      endDate: date,
    }))
  }

  const addQuickDuration = (minutes: number) => {
    const newEndDate = new Date(formData.startDate.getTime() + minutes * 60 * 1000)
    setFormData((prev) => ({
      ...prev,
      endDate: newEndDate,
    }))
  }

  return (
    <div className="relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl -z-10" />

      <form onSubmit={handleSubmit} className="space-y-8 p-6">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-5 w-5 text-blue-600" />
                Meeting Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter an engaging meeting title..."
                required
                className="h-12 text-lg border-2 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="participants" className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-5 w-5 text-green-600" />
                Participants
              </Label>
              <Input
                id="participants"
                value={formData.participants}
                onChange={(e) => setFormData((prev) => ({ ...prev, participants: e.target.value }))}
                placeholder="John Doe, Jane Smith, team@company.com..."
                required
                className="h-12 text-lg border-2 focus:border-green-500 transition-all duration-200"
              />
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Separate multiple participants with commas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Tag className="h-5 w-5 text-purple-600" />
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-12 border-2 focus:border-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${categoryColors[key as keyof typeof categoryColors]}`}
                          />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="flex items-center gap-2 text-base font-semibold">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Conference Room A, Zoom, etc."
                  className="h-12 border-2 focus:border-orange-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Schedule Details
              </h3>

              <div className="space-y-4">
                <DateTimePicker
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  label="Start Date & Time"
                  icon={<Calendar className="h-4 w-4" />}
                  minDate={new Date()}
                />

                <DateTimePicker
                  value={formData.endDate}
                  onChange={handleEndDateChange}
                  label="End Date & Time"
                  icon={<Clock className="h-4 w-4" />}
                  minDate={formData.startDate}
                />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quick Duration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuickDuration(15)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      15 min
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuickDuration(30)}
                      className="hover:bg-green-50 hover:border-green-300"
                    >
                      30 min
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuickDuration(60)}
                      className="hover:bg-purple-50 hover:border-purple-300"
                    >
                      1 hour
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuickDuration(120)}
                      className="hover:bg-orange-50 hover:border-orange-300"
                    >
                      2 hours
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-base font-semibold">
            Description & Agenda
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Add meeting agenda, objectives, or any additional notes..."
            rows={4}
            className="border-2 focus:border-blue-500 transition-all duration-200 resize-none"
          />
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} className="px-8 py-3 h-auto bg-transparent">
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8 py-3 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {editingId ? "Update Meeting" : "Schedule Meeting"}
          </Button>
        </div>
      </form>
    </div>
  )
}
