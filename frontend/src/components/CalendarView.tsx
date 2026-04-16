"use client";

import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import moment from "moment";
import { scheduleService, Schedule } from "@/services/scheduleService";
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { EventDetailsModal } from "./EventDetailsModal";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  refresh?: number;
  onSelectEvent?: (schedule: Schedule) => void;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Schedule;
}

export function CalendarView({
  refresh = 0,
  onSelectEvent,
}: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, [refresh]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // Fetch schedules for current month
      const startDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1,
      );
      const endDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0,
      );
      endDate.setHours(23, 59, 59, 999);

      const schedules = await scheduleService.getSchedules(
        startDate.toISOString(),
        endDate.toISOString(),
      );

      const calendarEvents: CalendarEvent[] = schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.task.title,
        start: new Date(schedule.startTime),
        end: new Date(schedule.endTime),
        resource: schedule,
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventStyleRects = (event: CalendarEvent) => {
    const { resource } = event;
    let backgroundColor = "#4f46e5"; // default indigo

    switch (resource.status) {
      case "COMPLETED":
        backgroundColor = "#10b981";
        break;
      case "IN_PROGRESS":
        backgroundColor = "#3b82f6";
        break;
      case "DELAYED":
        backgroundColor = "#ef4444";
        break;
      case "CANCELLED":
        backgroundColor = "#9ca3af";
        break;
      default:
        backgroundColor = "#f59e0b";
    }

    return { style: { backgroundColor } };
  };

  const handleNavigate = (date: Date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">📅 Lịch Biểu Tháng</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setMonth(prev.getMonth() - 1);
              handleNavigate(prev);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[150px] text-center">
            {format(selectedDate, "MMMM yyyy", {
              locale: vi,
            })}
          </span>
          <button
            onClick={() => {
              const next = new Date(selectedDate);
              next.setMonth(next.getMonth() + 1);
              handleNavigate(next);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .rbc-today {
          background-color: #eef2ff;
        }
        .rbc-off-range-bg {
          background-color: #fafafa;
        }
        .rbc-event {
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .rbc-event-label {
          font-size: 0.75rem;
        }
        .rbc-toolbar {
          margin-bottom: 0;
          padding: 0;
          flex-wrap: nowrap;
          display: none;
        }
        .rbc-toolbar button {
          color: inherit;
          font-weight: 500;
        }
        .rbc-toolbar-label {
          font-size: 1rem;
          font-weight: 600;
        }
        .rbc-month-view,
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .rbc-date-cell {
          padding: 4px 2px;
          text-align: right;
          font-size: 0.875rem;
        }
        .rbc-date-cell > a {
          color: inherit;
          text-decoration: none;
        }
        .rbc-date-cell.rbc-now > a {
          font-weight: bold;
          color: #4f46e5;
        }
        .rbc-day-bg {
          min-height: 100px;
        }
        .rbc-cell-selection {
          background-color: transparent;
        }
      `}</style>

      <div style={{ height: "600px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={(event) => {
            setSelectedEvent(event.resource);
            onSelectEvent?.(event.resource);
          }}
          onNavigate={handleNavigate}
          date={selectedDate}
          view="month"
          onView={() => {}}
          views={["month"]}
          eventPropGetter={getEventStyleRects}
          popup
          style={{ height: "100%" }}
        />
      </div>

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onReschedule={() => {
          setSelectedEvent(null);
          fetchSchedules();
        }}
      />

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-gray-600">Đang chờ</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-gray-600">Đang tiến hành</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-600">Hoàn thành</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-600">Bị trễ</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded bg-gray-500"></div>
          <span className="text-gray-600">Đã hủy</span>
        </div>
      </div>

      {/* Event Details */}
      {events.length === 0 && (
        <div className="mt-8 text-center py-8 text-gray-500">
          <Clock size={32} className="mx-auto mb-2 opacity-30" />
          <p>Không có sự kiện nào cho tháng này</p>
        </div>
      )}
    </div>
  );
}
