"use client"

import { format, isToday, isTomorrow, isYesterday, differenceInMinutes } from "date-fns"
import { Calendar, Clock, Users, Edit, Trash2, FileText, MapPin, BellRing } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMeetingStore } from "@/lib/meeting-store"

interface MeetingListProps {
  onEdit: (id: string) => void
}

const categoryColors = {
  work: "bg-blue-500",
  personal: "bg-green-500",
  urgent: "bg-red-500",
  casual: "bg-purple-500",
}

const categoryGradients = {
  work: "from-blue-500/20 to-blue-600/20",
  personal: "from-green-500/20 to-green-600/20",
  urgent: "from-red-500/20 to-red-600/20",
  casual: "from-purple-500/20 to-purple-600/20",
}

export function MeetingList({ onEdit }: MeetingListProps) {
  const { meetings, deleteMeeting } = useMeetingStore()

  const sortedMeetings = [...meetings].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "EEEE, MMMM d")
  }

  const getTimeStatus = (startDate: Date, endDate: Date) => {
    const now = new Date()
    const minutesUntilStart = differenceInMinutes(startDate, now)

    if (now < startDate) {
      if (minutesUntilStart <= 15) return { status: "starting-soon", color: "bg-orange-500", pulse: true }
      return { status: "upcoming", color: "bg-blue-500", pulse: false }
    }
    if (now >= startDate && now <= endDate) return { status: "ongoing", color: "bg-green-500", pulse: true }
    return { status: "completed", color: "bg-gray-500", pulse: false }
  }

  if (meetings.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
            <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">No meetings scheduled</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Your calendar is clear! Click "Schedule Meeting" to add your first meeting and start organizing your time
            effectively.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {sortedMeetings.map((meeting) => {
        const startDate = new Date(meeting.startDate)
        const endDate = new Date(meeting.endDate)
        const timeStatus = getTimeStatus(startDate, endDate)
        const minutesUntilStart = differenceInMinutes(startDate, new Date())

        return (
          <Card
            key={meeting.id}
            className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
          >
            {/* Category color bar */}
            <div className={`h-1 bg-gradient-to-r ${categoryGradients[meeting.category]}`} />

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${categoryColors[meeting.category]} shadow-lg`} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {meeting.title}
                    </h3>
                    <div className={`flex items-center gap-1 ${timeStatus.pulse ? "animate-pulse" : ""}`}>
                      <div className={`w-2 h-2 rounded-full ${timeStatus.color}`} />
                      <Badge variant="secondary" className="text-xs font-medium capitalize">
                        {timeStatus.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{getDateLabel(startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>
                        {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                      </span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    {minutesUntilStart > 0 && minutesUntilStart <= 60 && (
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <BellRing className="h-4 w-4 animate-pulse" />
                        <span className="font-medium">Starts in {minutesUntilStart}min</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(meeting.id)}
                    className="hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMeeting(meeting.id)}
                    className="hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div className="flex flex-wrap gap-2">
                  {meeting.participants.map((participant, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300"
                    >
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>

              {meeting.description && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{meeting.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
