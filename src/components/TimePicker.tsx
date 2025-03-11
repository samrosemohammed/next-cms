"use client";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
interface TimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}
export const TimePicker = ({ date, setDate }: TimePickerProps) => {
  // Get hours and minutes from the date
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Format hours and minutes to have leading zeros if needed
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  const [hoursValue, setHoursValue] = useState(formattedHours);
  const [minutesValue, setMinutesValue] = useState(formattedMinutes);

  // Update the time when the inputs change
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ensure the value is between 0 and 23
    if (
      value === "" ||
      (Number.parseInt(value) >= 0 && Number.parseInt(value) <= 23)
    ) {
      setHoursValue(value);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ensure the value is between 0 and 59
    if (
      value === "" ||
      (Number.parseInt(value) >= 0 && Number.parseInt(value) <= 59)
    ) {
      setMinutesValue(value);
    }
  };

  // Apply the time to the date
  const handleApply = () => {
    const newDate = new Date(date);
    newDate.setHours(Number.parseInt(hoursValue) || 0);
    newDate.setMinutes(Number.parseInt(minutesValue) || 0);
    setDate(newDate);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Select time</span>
      </div>
      <div className="flex gap-2">
        <div className="grid gap-1">
          <Label htmlFor="hours" className="text-xs">
            Hours
          </Label>
          <Input
            id="hours"
            value={hoursValue}
            onChange={handleHoursChange}
            className="w-16"
            placeholder="00"
            maxLength={2}
          />
        </div>
        <div className="flex items-end pb-2">
          <span className="text-xl">:</span>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="minutes" className="text-xs">
            Minutes
          </Label>
          <Input
            id="minutes"
            value={minutesValue}
            onChange={handleMinutesChange}
            className="w-16"
            placeholder="00"
            maxLength={2}
          />
        </div>
      </div>
      <Button onClick={handleApply} className="mt-2">
        Apply
      </Button>
    </div>
  );
};
