"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, X, Plus } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, startOfDay } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import "react-day-picker/dist/style.css";

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Event {
    id: string;
    name: string;
    deadline: string;
    location?: string;
}

interface Task {
    id: string;
    title: string;
    created_at: string;
    completed: boolean;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState("");
    const [newItemType, setNewItemType] = useState<"task" | "event">("task");
    const [newItemTime, setNewItemTime] = useState("");

    // New state for enhanced features
    const [taskType, setTaskType] = useState<"big" | "medium" | "small">("medium");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [eventType, setEventType] = useState<"hackathon" | "internship" | "course" | "other">("hackathon");

    useEffect(() => {
        if (isOpen) {
            fetchAllData();
        }
    }, [isOpen]);

    const fetchAllData = async () => {
        try {
            const mockUserId = "00000000-0000-0000-0000-000000000000";

            // Fetch events
            const { data: eventsData, error: eventsError } = await supabase
                .from("events")
                .select("*")
                .eq("user_id", mockUserId);

            if (eventsError) throw eventsError;
            setEvents(eventsData || []);

            // Fetch tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from("todos")
                .select("*")
                .eq("user_id", mockUserId);

            if (tasksError) throw tasksError;
            setTasks(tasksData || []);
        } catch (err) {
            console.error("Error fetching calendar data:", err);
        }
    };

    const handleAddItem = async () => {
        if (!newItemTitle.trim() || !selectedDate) return;

        try {
            const mockUserId = "00000000-0000-0000-0000-000000000000";

            if (newItemType === "task") {
                const { error } = await supabase.from("todos").insert({
                    title: newItemTitle,
                    type: taskType, // Use selected task type
                    user_id: mockUserId,
                    completed: false,
                    created_at: selectedDate.toISOString(),
                });

                if (error) throw error;
            } else {
                // Build time range string if provided
                let timeRange = "";
                if (startTime && endTime) {
                    timeRange = `${startTime} - ${endTime}`;
                } else if (startTime) {
                    timeRange = startTime;
                }

                const { error } = await supabase.from("events").insert({
                    name: newItemTitle,
                    type: eventType,
                    deadline: endDate ? endDate.toISOString() : selectedDate.toISOString(),
                    user_id: mockUserId,
                    location: timeRange || newItemTime || null,
                });

                if (error) throw error;
            }

            // Reset form
            setNewItemTitle("");
            setNewItemTime("");
            setTaskType("medium");
            setStartTime("");
            setEndTime("");
            setEndDate(undefined);
            setEventType("hackathon");
            setShowAddForm(false);

            // Refresh data
            await fetchAllData();
        } catch (err) {
            console.error("Error adding item:", err);
        }
    };

    // Get dates with events/tasks
    const eventDates = events.map((e) => startOfDay(new Date(e.deadline)));
    const taskDates = tasks.map((t) => startOfDay(new Date(t.created_at)));

    // Get events/tasks for selected date
    const selectedDateEvents = selectedDate
        ? events.filter((e) => isSameDay(new Date(e.deadline), selectedDate))
        : [];
    const selectedDateTasks = selectedDate
        ? tasks.filter((t) => isSameDay(new Date(t.created_at), selectedDate))
        : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-6 w-6 text-blue-400" />
                        <h2 className="text-2xl font-bold text-slate-50">Calendar & Schedule</h2>
                    </div>
                    <p className="text-sm text-slate-400">View and manage your tasks and events</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div className="bg-slate-800/50 rounded-lg p-4">
                        <style jsx global>{`
              .rdp {
                --rdp-cell-size: 40px;
                --rdp-accent-color: #8b5cf6;
                --rdp-background-color: rgba(139, 92, 246, 0.1);
                margin: 0;
              }
              .rdp-months {
                justify-content: center;
              }
              .rdp-month {
                color: #e2e8f0;
              }
              .rdp-caption {
                color: #f1f5f9;
                font-weight: 600;
              }
              .rdp-head_cell {
                color: #94a3b8;
                font-weight: 500;
                font-size: 0.875rem;
              }
              .rdp-cell {
                position: relative;
              }
              .rdp-day {
                color: #cbd5e1;
                border-radius: 0.375rem;
              }
              .rdp-day:hover:not(.rdp-day_selected) {
                background-color: rgba(148, 163, 184, 0.1);
              }
              .rdp-day_selected {
                background-color: #8b5cf6 !important;
                color: white !important;
              }
              .rdp-day_today {
                font-weight: bold;
                color: #60a5fa;
              }
              .has-event::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: #ef4444;
              }
              .has-task::before {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-8px);
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: #3b82f6;
              }
            `}</style>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiers={{
                                hasEvent: eventDates,
                                hasTask: taskDates,
                            }}
                            modifiersClassNames={{
                                hasEvent: "has-event",
                                hasTask: "has-task",
                            }}
                        />
                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span>Hackathon</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span>Task</span>
                            </div>
                        </div>
                    </div>

                    {/* Selected Date Details */}
                    <div className="bg-slate-800/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-slate-50 mb-4">
                            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                        </h3>

                        {/* Events List */}
                        {selectedDateEvents.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-red-400 mb-2">🔴 Hackathons</h4>
                                <div className="space-y-2">
                                    {selectedDateEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="p-2 rounded bg-red-500/10 border border-red-500/20"
                                        >
                                            <p className="text-sm text-slate-200">{event.name}</p>
                                            {event.location && (
                                                <p className="text-xs text-slate-400 mt-1">{event.location}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tasks List */}
                        {selectedDateTasks.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-blue-400 mb-2">🔵 Tasks</h4>
                                <div className="space-y-2">
                                    {selectedDateTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="p-2 rounded bg-blue-500/10 border border-blue-500/20"
                                        >
                                            <p className="text-sm text-slate-200">{task.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add New Item */}
                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Item
                            </button>
                        ) : (
                            <div className="space-y-3 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newItemTitle}
                                    onChange={(e) => setNewItemTitle(e.target.value)}
                                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                                />

                                {/* Type Selection */}
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-slate-300">
                                        <input
                                            type="radio"
                                            value="task"
                                            checked={newItemType === "task"}
                                            onChange={() => setNewItemType("task")}
                                            className="text-purple-600"
                                        />
                                        Task
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-300">
                                        <input
                                            type="radio"
                                            value="event"
                                            checked={newItemType === "event"}
                                            onChange={() => setNewItemType("event")}
                                            className="text-purple-600"
                                        />
                                        Event
                                    </label>
                                </div>

                                {/* Task Type Selector (only for tasks) */}
                                {newItemType === "task" && (
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Task Priority</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setTaskType("big")}
                                                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${taskType === "big"
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                                    }`}
                                            >
                                                🎯 Big
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTaskType("medium")}
                                                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${taskType === "medium"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                                    }`}
                                            >
                                                📋 Medium
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTaskType("small")}
                                                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${taskType === "small"
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                                    }`}
                                            >
                                                ✅ Small
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Event Time Range (only for events) */}
                                {newItemType === "event" && (
                                    <>
                                        {/* Event Type Selector */}
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Event Type</label>
                                            <select
                                                value={eventType}
                                                onChange={(e) => setEventType(e.target.value as any)}
                                                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                                            >
                                                <option value="hackathon">🏆 Hackathon</option>
                                                <option value="internship">💼 Internship</option>
                                                <option value="course">🎓 Course</option>
                                                <option value="other">📅 Other</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 block">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 block">End Time</label>
                                                <input
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Multi-day Event */}
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">
                                                End Date (optional - for multi-day events)
                                            </label>
                                            <input
                                                type="date"
                                                value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                                                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                                                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                                            />
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Location (optional)"
                                            value={newItemTime}
                                            onChange={(e) => setNewItemTime(e.target.value)}
                                            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddItem}
                                        className="flex-1 px-4 py-2 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewItemTitle("");
                                            setNewItemTime("");
                                            setTaskType("medium");
                                            setStartTime("");
                                            setEndTime("");
                                            setEndDate(undefined);
                                        }}
                                        className="flex-1 px-4 py-2 rounded bg-slate-600 text-white text-sm font-medium hover:bg-slate-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
