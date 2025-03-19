"use client";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export const TimePicker = ({ date, setDate }: TimePickerProps) => {
  // Get hours and minutes from the date
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;

  // Format hours and minutes to have leading zeros if needed
  const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  const [hoursValue, setHoursValue] = useState(formattedHours);
  const [minutesValue, setMinutesValue] = useState(formattedMinutes);
  const [period, setPeriod] = useState(isPM ? "PM" : "AM");

  // Update the time when the inputs change
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ensure the value is between 1 and 12
    if (
      value === "" ||
      (Number.parseInt(value) >= 1 && Number.parseInt(value) <= 12)
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

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  // Apply the time to the date
  const handleApply = () => {
    let newHours = Number.parseInt(hoursValue) % 12;
    if (period === "PM") {
      newHours += 12;
    }
    const newDate = new Date(date);
    newDate.setHours(newHours);
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
        <div className="grid gap-1">
          <Label htmlFor="period" className="text-xs">
            Period
          </Label>

          <Select onValueChange={handlePeriodChange} value={period}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select AM/PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Period</SelectLabel>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleApply} className="mt-2">
        Apply
      </Button>
    </div>
  );
};
