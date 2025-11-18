"use client";

import { api } from "~/trpc/react";
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from "date-fns";

export function ContactCalendar() {
  const { data: stats, isLoading } = api.contact.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">Loading calendar...</p>
      </div>
    );
  }

  if (!stats || !stats.contactsByDate) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">No contact data available</p>
      </div>
    );
  }

  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  const days = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Get max contacts in a single day for color scaling
  const maxContacts = Math.max(...Object.values(stats.contactsByDate), 1);

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    const intensity = Math.min(count / maxContacts, 1);
    if (intensity < 0.2) return "bg-green-200";
    if (intensity < 0.4) return "bg-green-400";
    if (intensity < 0.6) return "bg-green-600";
    if (intensity < 0.8) return "bg-green-700";
    return "bg-green-800";
  };

  // Group days by month
  const months: Record<string, typeof days> = {};
  days.forEach((day) => {
    const monthKey = format(day, "MMM yyyy");
    if (!months[monthKey]) {
      months[monthKey] = [];
    }
    months[monthKey]!.push(day);
  });

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Contact Calendar - {format(now, "yyyy")}</h3>
      <div className="space-y-4">
        {Object.entries(months).map(([month, monthDays]) => (
          <div key={month}>
            <h4 className="mb-2 text-sm font-medium text-gray-700">{month}</h4>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {monthDays.map((day, idx) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const count = stats.contactsByDate[dateKey] ?? 0;
                const isToday = isSameDay(day, now);
                const isFuture = day > now;

                return (
                  <div
                    key={day.toISOString()}
                    className={`relative flex h-8 items-center justify-center rounded text-xs ${
                      isFuture ? "bg-gray-50" : getColor(count)
                    } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                    title={`${format(day, "MMM d")}: ${count} contact${count !== 1 ? "s" : ""}`}
                  >
                    {format(day, "d")}
                    {count > 0 && (
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gray-100"></div>
          <span>No contacts</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-200"></div>
          <span>Few</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-600"></div>
          <span>Many</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-800"></div>
          <span>Most ({maxContacts})</span>
        </div>
      </div>
    </div>
  );
}

