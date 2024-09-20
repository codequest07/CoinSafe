import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

const SavingsCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full overflow-x-hidden">
      <main className="p-4 flex justify-center items-center flex-col">
        <div className="w-full bg-[#13131340] p-6 rounded-lg text-white shadow-lg">
          {" "}
          {/* Make sure it's full width */}
          {/* Top Bar: Savings Streak and Days */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-white">Savings streak</p>
            <div className="flex items-center space-x-2">
              <span className="bg-[#F3B42324] text-[#F1F1F1] px-3 py-1 rounded-full text-sm">
                1000 days 🔥
              </span>
            </div>
          </div>
          {/* Calendar */}
          <div className="w-full flex items-center justify-center">
            {" "}
            {/* Ensures full width for the calendar */}
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full mx-10 text-white"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavingsCalendar;
