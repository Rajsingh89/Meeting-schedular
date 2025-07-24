"use client"

import { useState } from "react"
import { Bell, Volume2, Mail, Clock, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useMeetingStore } from "@/lib/meeting-store"

interface NotificationSettingsProps {
  onClose: () => void
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { notificationSettings, updateNotificationSettings } = useMeetingStore()
  const [settings, setSettings] = useState(notificationSettings)

  const handleSave = () => {
    updateNotificationSettings(settings)
    onClose()
  }

  const toggleReminderTime = (minutes: number) => {
    const newReminders = settings.reminderMinutes.includes(minutes)
      ? settings.reminderMinutes.filter((m) => m !== minutes)
      : [...settings.reminderMinutes, minutes].sort((a, b) => b - a)

    setSettings((prev) => ({ ...prev, reminderMinutes: newReminders }))
  }

  const reminderOptions = [5, 10, 15, 30, 60, 120, 1440] // minutes

  return (
    <div className="space-y-8">
      {/* Browser Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Browser Notifications</h3>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="browser-notifications" className="text-base font-medium">
                Enable browser notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">Get desktop notifications for upcoming meetings</p>
            </div>
            <Switch
              id="browser-notifications"
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, browserNotifications: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Sound Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Sound Alerts</h3>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-enabled" className="text-base font-medium">
                Play notification sound
              </Label>
              <p className="text-sm text-muted-foreground mt-1">Play a gentle chime when reminders are triggered</p>
            </div>
            <Switch
              id="sound-enabled"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Email Reminders */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Email Reminders</h3>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-reminders" className="text-base font-medium">
                Send email reminders
              </Label>
              <p className="text-sm text-muted-foreground mt-1">Receive email notifications for upcoming meetings</p>
            </div>
            <Switch
              id="email-reminders"
              checked={settings.emailReminders}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailReminders: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Reminder Timing */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Reminder Timing</h3>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose when you want to be reminded before your meetings start
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {reminderOptions.map((minutes) => {
              const isSelected = settings.reminderMinutes.includes(minutes)
              const label =
                minutes >= 1440
                  ? `${minutes / 1440} day${minutes / 1440 > 1 ? "s" : ""}`
                  : minutes >= 60
                    ? `${minutes / 60} hour${minutes / 60 > 1 ? "s" : ""}`
                    : `${minutes} min${minutes > 1 ? "s" : ""}`

              return (
                <Button
                  key={minutes}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleReminderTime(minutes)}
                  className={`h-auto py-3 ${isSelected ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-100 hover:border-orange-300"}`}
                >
                  {label}
                </Button>
              )
            })}
          </div>
          {settings.reminderMinutes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-700">
              <p className="text-sm font-medium mb-2">Active reminders:</p>
              <div className="flex flex-wrap gap-2">
                {settings.reminderMinutes
                  .sort((a, b) => b - a)
                  .map((minutes) => {
                    const label =
                      minutes >= 1440
                        ? `${minutes / 1440} day${minutes / 1440 > 1 ? "s" : ""}`
                        : minutes >= 60
                          ? `${minutes / 60} hour${minutes / 60 > 1 ? "s" : ""}`
                          : `${minutes} min${minutes > 1 ? "s" : ""}`

                    return (
                      <Badge
                        key={minutes}
                        variant="secondary"
                        className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      >
                        {label} before
                      </Badge>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onClose} className="px-8 bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
