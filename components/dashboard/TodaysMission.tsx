"use client";

import { useEffect, useState } from "react";
import { Target, CheckCircle2, Circle, Plus, Trash2, Loader2, ChevronDown, Calendar, Clock } from "lucide-react";
import { supabase, Todo } from "@/lib/supabaseClient";
import { AddTodoDialog } from "./AddTodoDialog";
import { format } from "date-fns";

interface TodaysMissionProps {
    focusMode?: boolean;
}

interface Event {
    id: string;
    name: string;
    deadline: string;
    location?: string;
    type: string;
    completed?: boolean;
}

export function TodaysMission({ focusMode = false }: TodaysMissionProps) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'big' | 'medium' | 'small'>('medium');
    const [showCompleted, setShowCompleted] = useState(false);
    const [showCompletedEvents, setShowCompletedEvents] = useState(false);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("todos")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            setTodos(data || []);
        } catch (err) {
            console.error("Error fetching todos:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTodaysEvents = async () => {
        try {
            const mockUserId = "00000000-0000-0000-0000-000000000000";
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("user_id", mockUserId)
                .gte("deadline", today.toISOString())
                .lt("deadline", tomorrow.toISOString())
                .order("deadline", { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error("Error fetching today's events:", err);
        }
    };

    useEffect(() => {
        fetchTodos();
        fetchTodaysEvents();
    }, []);

    const playCompletionSound = () => {
        const audio = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3");
        audio.volume = 0.5;
        audio.play().catch(err => console.log("Audio play failed:", err));
    };

    const toggleTodo = async (id: string, currentStatus: boolean) => {
        try {
            const updateData: any = { completed: !currentStatus };

            // Set completed_at when completing, null when uncompleting
            if (!currentStatus) {
                updateData.completed_at = new Date().toISOString();
            } else {
                updateData.completed_at = null;
            }

            const { error } = await supabase
                .from("todos")
                .update(updateData)
                .eq("id", id);

            if (error) throw error;

            if (!currentStatus) {
                playCompletionSound();
            }

            fetchTodos();
        } catch (err) {
            console.error("Error updating todo:", err);
        }
    };

    const clearCompleted = async () => {
        try {
            const { error } = await supabase
                .from("todos")
                .delete()
                .eq("completed", true);

            if (error) throw error;
            fetchTodos();
        } catch (err) {
            console.error("Error clearing completed:", err);
        }
    };

    const toggleEvent = async (id: string, currentStatus: boolean) => {
        try {
            const updatedEvents = events.map(e =>
                e.id === id ? { ...e, completed: !currentStatus } : e
            );
            setEvents(updatedEvents);

            if (!currentStatus) {
                playCompletionSound();
            }
        } catch (err) {
            console.error("Error updating event:", err);
        }
    };

    const clearCompletedEvents = () => {
        setEvents(events.filter(e => !e.completed));
    };

    const openDialog = (type: 'big' | 'medium' | 'small') => {
        setDialogType(type);
        setIsDialogOpen(true);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "hackathon": return "🏆";
            case "internship": return "💼";
            case "course": return "🎓";
            default: return "📅";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "hackathon": return "border-red-500/20";
            case "internship": return "border-blue-500/20";
            case "course": return "border-purple-500/20";
            default: return "border-slate-500/20";
        }
    };

    const bigTodo = todos.find(t => t.type === 'big' && !t.completed);
    const mediumTodos = todos.filter(t => t.type === 'medium' && !t.completed);
    const smallTodos = todos.filter(t => t.type === 'small' && !t.completed);
    const completedTodos = todos.filter(t => t.completed);
    const activeEvents = events.filter(e => !e.completed);
    const completedEvents = events.filter(e => e.completed);
    const completedCount = completedTodos.length + completedEvents.length;
    const totalCount = todos.length + events.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const TodoItem = ({ todo, large = false }: { todo: Todo; large?: boolean }) => (
        <div
            className={`flex items-start gap-3 p-4 rounded-md bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors group ${large ? 'min-h-[100px]' : ''
                }`}
        >
            <button
                onClick={() => toggleTodo(todo.id, todo.completed)}
                className="flex-shrink-0 mt-0.5"
            >
                {todo.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                    <Circle className="h-5 w-5 text-slate-600 group-hover:text-slate-500" />
                )}
            </button>

            <p
                className={`flex-1 text-sm ${large ? 'text-base font-medium' : ''
                    } ${todo.completed
                        ? 'text-slate-500 line-through'
                        : 'text-slate-200'
                    }`}
            >
                {todo.title}
            </p>
        </div>
    );

    if (loading) {
        return (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-slate-400" />
                    <h2 className="text-xl font-semibold text-slate-50">Bugünün Görevi</h2>
                </div>
            </div>

            <div className="flex-1 overflow-auto space-y-6">
                {/* The Big One */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-purple-400 uppercase tracking-wider">
                            🎯 The Big One
                        </h3>
                        <button
                            onClick={() => openDialog('big')}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    {bigTodo ? (
                        <TodoItem todo={bigTodo} large />
                    ) : (
                        <div
                            onClick={() => openDialog('big')}
                            className="p-6 rounded-md border-2 border-dashed border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer text-center"
                        >
                            <p className="text-sm text-slate-500">Add your most important task</p>
                        </div>
                    )}
                </div>

                {/* Medium Tasks */}
                {!focusMode && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider">
                                📋 Medium Tasks ({mediumTodos.length}/3)
                            </h3>
                            <button
                                onClick={() => openDialog('medium')}
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {mediumTodos.slice(0, 3).map(todo => (
                                <TodoItem key={todo.id} todo={todo} />
                            ))}
                            {mediumTodos.length < 3 && (
                                <div
                                    onClick={() => openDialog('medium')}
                                    className="p-3 rounded-md border border-dashed border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer text-center"
                                >
                                    <p className="text-xs text-slate-500">Add medium task</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Small Chores */}
                {!focusMode && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
                                ✅ Small Chores ({smallTodos.length}/5)
                            </h3>
                            <button
                                onClick={() => openDialog('small')}
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {smallTodos.slice(0, 5).map(todo => (
                                <TodoItem key={todo.id} todo={todo} />
                            ))}
                            {smallTodos.length < 5 && (
                                <div
                                    onClick={() => openDialog('small')}
                                    className="p-2 rounded-md border border-dashed border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer text-center"
                                >
                                    <p className="text-xs text-slate-500">Add small chore</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Today's Schedule */}
                {!focusMode && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-orange-400 uppercase tracking-wider">
                                📅 Today's Schedule ({activeEvents.length})
                            </h3>
                        </div>
                        {activeEvents.length === 0 ? (
                            <div className="p-4 rounded-md border border-dashed border-slate-700 text-center">
                                <p className="text-xs text-slate-500">No events scheduled for today</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`flex items-start gap-3 p-3 rounded-md bg-slate-800/30 border ${getTypeColor(event.type)} hover:border-slate-700 transition-colors group`}
                                    >
                                        <button
                                            onClick={() => toggleEvent(event.id, event.completed || false)}
                                            className="flex-shrink-0 mt-0.5"
                                        >
                                            {event.completed ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-slate-600 group-hover:text-slate-500" />
                                            )}
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm">{getTypeIcon(event.type)}</span>
                                                <p className={`text-sm ${event.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                    {event.name}
                                                </p>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{event.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Completed Tasks */}
                {!focusMode && completedTodos.length > 0 && (
                    <div className="pt-4 border-t border-slate-800">
                        <button
                            onClick={() => setShowCompleted(!showCompleted)}
                            className="flex items-center justify-between w-full mb-3 group"
                        >
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                ✓ Tamamlanan ({completedTodos.length})
                            </h3>
                            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
                        </button>

                        {showCompleted && (
                            <div className="space-y-2">
                                {completedTodos.map(todo => (
                                    <TodoItem key={todo.id} todo={todo} />
                                ))}
                                <button
                                    onClick={clearCompleted}
                                    className="w-full mt-3 flex items-center justify-center gap-1 rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Clear Completed
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Completed Events */}
                {!focusMode && completedEvents.length > 0 && (
                    <div className="pt-4 border-t border-slate-800">
                        <button
                            onClick={() => setShowCompletedEvents(!showCompletedEvents)}
                            className="flex items-center justify-between w-full mb-3 group"
                        >
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                ✓ Tamamlanan Etkinlikler ({completedEvents.length})
                            </h3>
                            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showCompletedEvents ? 'rotate-180' : ''}`} />
                        </button>

                        {showCompletedEvents && (
                            <div className="space-y-2">
                                {completedEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`flex items-start gap-3 p-3 rounded-md bg-slate-800/30 border ${getTypeColor(event.type)} transition-colors group`}
                                    >
                                        <button
                                            onClick={() => toggleEvent(event.id, event.completed || false)}
                                            className="flex-shrink-0 mt-0.5"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm">{getTypeIcon(event.type)}</span>
                                                <p className="text-sm text-slate-500 line-through">
                                                    {event.name}
                                                </p>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{event.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={clearCompletedEvents}
                                    className="w-full mt-3 flex items-center justify-center gap-1 rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Clear Completed Events
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Progress */}
            <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">İlerleme</span>
                    <span className="text-slate-300 font-medium">
                        {completedCount}/{totalCount} tamamlandı
                    </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <AddTodoDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onTodoAdded={fetchTodos}
                defaultType={dialogType}
            />
        </div>
    );
}
