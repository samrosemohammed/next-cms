import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "./TimePicker";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}
export const DatePicker = ({ date, setDate }: DatePickerProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal sm:w-[240px]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                const newDate = date ? new Date(date) : new Date();
                newDate.setFullYear(selectedDate.getFullYear());
                newDate.setMonth(selectedDate.getMonth());
                newDate.setDate(selectedDate.getDate());
                setDate(newDate);
                setIsCalendarOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal sm:w-[240px]",
              !date && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {date ? format(date, "p") : <span>Pick a time</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <TimePicker
            setDate={(newTime) => {
              setDate(newTime);
              setIsTimePickerOpen(false);
            }}
            date={date || new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
