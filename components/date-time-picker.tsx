"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  value: Date
  onChange: (date: Date) => void
  label: string
  icon: React.ReactNode
  minDate?: Date
}

export function DateTimePicker({ value, onChange, label, icon, minDate }: DateTimePickerProps) {
  const [dateValue, setDateValue] = useState("")
  const [timeValue, setTimeValue] = useState("")

  useEffect(() => {
    setDateValue(format(value, "yyyy-MM-dd"))
    setTimeValue(format(value, "HH:mm"))
  }, [value])

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate)
    const [year, month, day] = newDate.split("-").map(Number)
    const [hours, minutes] = timeValue.split(":").map(Number)
    const updatedDate = new Date(year, month - 1, day, hours, minutes)
    onChange(updatedDate)
  }

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    const [year, month, day] = dateValue.split("-").map(Number)
    const [hours, minutes] = newTime.split(":").map(Number)
    const updatedDate = new Date(year, month - 1, day, hours, minutes)
    onChange(updatedDate)
  }

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        const displayTime = format(new Date(2000, 0, 1, hour, minute), "h:mm a")
        times.push({ value: timeString, display: displayTime })
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()
  const minDateString = minDate ? format(minDate, "yyyy-MM-dd") : undefined

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            min={minDateString}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Clock className="h-4 w-4 mr-2" />
                {format(value, "h:mm a")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="start">
              <div className="max-h-60 overflow-y-auto">
                {timeOptions.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => handleTimeChange(time.value)}
                    className={`w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground ${
                      timeValue === time.value ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    {time.display}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
