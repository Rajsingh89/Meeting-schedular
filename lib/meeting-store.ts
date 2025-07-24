import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Meeting {
  id: string
  title: string
  participants: string[]
  startDate: string
  endDate: string
  description?: string
  category: "work" | "personal" | "urgent" | "casual"
  location?: string
  reminderSent?: boolean
}

export interface NotificationSettings {
  browserNotifications: boolean
  soundEnabled: boolean
  reminderMinutes: number[]
  emailReminders: boolean
}

interface MeetingStore {
  meetings: Meeting[]
  notificationSettings: NotificationSettings
  upcomingReminders: string[]
  addMeeting: (meeting: Omit<Meeting, "id">) => void
  updateMeeting: (id: string, meeting: Omit<Meeting, "id">) => void
  deleteMeeting: (id: string) => void
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  markReminderSent: (meetingId: string) => void
  addUpcomingReminder: (meetingId: string) => void
  removeUpcomingReminder: (meetingId: string) => void
}

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      meetings: [],
      notificationSettings: {
        browserNotifications: true,
        soundEnabled: true,
        reminderMinutes: [15, 5],
        emailReminders: false,
      },
      upcomingReminders: [],
      addMeeting: (meeting) =>
        set((state) => ({
          meetings: [
            ...state.meetings,
            {
              ...meeting,
              id: crypto.randomUUID(),
            },
          ],
        })),
      updateMeeting: (id, meeting) =>
        set((state) => ({
          meetings: state.meetings.map((m) => (m.id === id ? { ...meeting, id } : m)),
        })),
      deleteMeeting: (id) =>
        set((state) => ({
          meetings: state.meetings.filter((m) => m.id !== id),
          upcomingReminders: state.upcomingReminders.filter((reminderId) => reminderId !== id),
        })),
      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),
      markReminderSent: (meetingId) =>
        set((state) => ({
          meetings: state.meetings.map((m) => (m.id === meetingId ? { ...m, reminderSent: true } : m)),
        })),
      addUpcomingReminder: (meetingId) =>
        set((state) => ({
          upcomingReminders: [...state.upcomingReminders, meetingId],
        })),
      removeUpcomingReminder: (meetingId) =>
        set((state) => ({
          upcomingReminders: state.upcomingReminders.filter((id) => id !== meetingId),
        })),
    }),
    {
      name: "meeting-storage",
    },
  ),
)
