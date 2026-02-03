"use client";

import { useEffect, useState } from "react";
import { Target, CheckCircle2, Circle, Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { supabase, Todo } from "@/lib/supabaseClient";
import { AddTodoDialog } from "./AddTodoDialog";

interface TodaysMissionProps {
    focusMode?: boolean;
}

export function TodaysMission({ focusMode = false }: TodaysMissionProps) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'big' | 'medium' | 'small'>('medium');
    const [showCompleted, setShowCompleted] = useState(false);

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

    useEffect(() => {
        fetchTodos();
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

    const openDialog = (type: 'big' | 'medium' | 'small') => {
        setDialogType(type);
        setIsDialogOpen(true);
    };

    const bigTodo = todos.find(t => t.type === 'big' && !t.completed);
    const mediumTodos = todos.filter(t => t.type === 'medium' && !t.completed);
    const smallTodos = todos.filter(t => t.type === 'small' && !t.completed);
    const completedTodos = todos.filter(t => t.completed);
    const completedCount = completedTodos.length;
    const totalCount = todos.length;
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
