"use client"

import { useEffect, useRef } from "react"
import { useMeetingStore } from "@/lib/meeting-store"
import { differenceInMinutes, isBefore, addMinutes } from "date-fns"

export function NotificationManager() {
  const {
    meetings,
    notificationSettings,
    upcomingReminders,
    markReminderSent,
    addUpcomingReminder,
    removeUpcomingReminder,
  } = useMeetingStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Request notification permission on mount
    if (notificationSettings.browserNotifications && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }

    // Create audio context for notification sound
    if (notificationSettings.soundEnabled) {
      // Create a simple notification sound using Web Audio API
      const createNotificationSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }

      audioRef.current = { play: createNotificationSound } as any
    }

    // Check for upcoming meetings every minute
    intervalRef.current = setInterval(() => {
      checkUpcomingMeetings()
    }, 60000) // Check every minute

    // Initial check
    checkUpcomingMeetings()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [meetings, notificationSettings])

  const checkUpcomingMeetings = () => {
    const now = new Date()

    meetings.forEach((meeting) => {
      const meetingStart = new Date(meeting.startDate)

      // Skip past meetings
      if (isBefore(meetingStart, now)) return

      notificationSettings.reminderMinutes.forEach((reminderMinutes) => {
        const reminderTime = addMinutes(meetingStart, -reminderMinutes)
        const minutesUntilReminder = differenceInMinutes(reminderTime, now)

        // If it's time for a reminder (within 1 minute window)
        if (minutesUntilReminder <= 0 && minutesUntilReminder > -1) {
          const reminderId = `${meeting.id}-${reminderMinutes}`

          // Check if we haven't already sent this reminder
          if (!upcomingReminders.includes(reminderId)) {
            sendNotification(meeting, reminderMinutes)
            addUpcomingReminder(reminderId)

            // Remove reminder after sending
            setTimeout(() => {
              removeUpcomingReminder(reminderId)
            }, 60000)
          }
        }
      })
    })
  }

  const sendNotification = (meeting: any, minutesUntil: number) => {
    const title = `Meeting Reminder: ${meeting.title}`
    const body = `Your meeting "${meeting.title}" starts in ${minutesUntil} minute${minutesUntil !== 1 ? "s" : ""}\nParticipants: ${meeting.participants.join(", ")}`

    // Browser notification
    if (
      notificationSettings.browserNotifications &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: meeting.id,
        requireInteraction: true,
        actions: [
          { action: "join", title: "Join Meeting" },
          { action: "snooze", title: "Snooze 5min" },
        ],
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close()
      }, 10000)
    }

    // Play notification sound
    if (notificationSettings.soundEnabled && audioRef.current) {
      try {
        audioRef.current.play()
      } catch (error) {
        console.log("Could not play notification sound:", error)
      }
    }

    // Mark reminder as sent
    markReminderSent(meeting.id)
  }

  return null // This component doesn't render anything
}
