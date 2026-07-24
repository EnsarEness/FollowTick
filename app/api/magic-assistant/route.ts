import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { text, noteId } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text content is required" }, { status: 400 });
        }

        // Get current date for context
        const now = new Date();
        const currentDateStr = now.toLocaleDateString("tr-TR", {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        // AI Prompt
        const systemPrompt = `
        You are a smart personal assistant. Your job is to extract actionable items from the user's raw notes.
        Today is: ${currentDateStr} (${now.toISOString()}).
        The user language is Turkish. Please respect Turkish grammar and common expressions.

        Analyze the text and categorize items into:
        1. **Events**: Meetings, appointments, deadlines, events.
           - KEYWORDS: "toplantı", "eğitim", "buluşma", "görüşme", "ders", "hackathon", "sunum".
           - Even if no specific time is mentioned, if it implies an event on a specific day (like "bugün", "yarın"), create an event. Set default time to 09:00 AM if missing.
           - "Mehmet beyle", "Hasanla" means "Meeting with Mehmet/Hasan".
           Format: { title: string, deadline: ISO_String (UTC), location: string (optional, default "Online"), type: 'hackathon' | 'internship' | 'course' | 'other' }
        2. **Todos**: Tasks, reminders, things to do.
           - Anything that clearly looks like a task: "süt al", "ödevi yap", "mail at".
           Format: { title: string, type: 'big' | 'medium' | 'small' }
           - 'big': Important/large tasks.
           - 'medium': Standard tasks.
           - 'small': Quick/easy tasks.
        3. **Resources**: Links, articles, videos to read later.
           Format: { title: string, url: string, type: 'article' | 'video' | 'tool' | 'repo' | 'other', tags: string[] }
        4. **Notes**: Anything that is just information or idea, not actionable. Keep it as a note.
           Format: { content: string }

        Return ONLY a valid JSON object with keys: "events", "todos", "resources", "notes". 
        If a category is empty, return an empty array.
        `;

        console.log("Sending request to OpenAI with text:", text);

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            model: "gpt-4o",
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const resultText = completion.choices[0].message.content;
        console.log("OpenAI Raw Response:", resultText);

        if (!resultText) throw new Error("No response from AI");

        let parsedData;
        try {
            parsedData = JSON.parse(resultText);
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            console.error("Failed Text:", resultText);
            throw new Error("AI returned invalid JSON");
        }

        console.log("Parsed Data:", JSON.stringify(parsedData, null, 2));

        // --- Process Executions (Supabase) ---
        const results = {
            events: 0,
            todos: 0,
            resources: 0,
            notes: 0
        };

        const mockUserId = "00000000-0000-0000-0000-000000000000";

        // 1. Insert Events
        if (parsedData.events && Array.isArray(parsedData.events) && parsedData.events.length > 0) {
            console.log("Inserting events:", parsedData.events.length);
            const { error } = await supabase.from('events').insert(
                parsedData.events.map((e: any) => ({
                    user_id: mockUserId,
                    name: e.title,
                    deadline: e.deadline,
                    location: e.location || 'Online',
                    type: e.type || 'other'
                }))
            );
            if (!error) {
                results.events = parsedData.events.length;
            } else {
                console.error("Error creating events in Supabase:", error);
                throw error; // Rethrow to inform user clearly
            }
        }

        // 2. Insert Todos
        if (parsedData.todos && parsedData.todos.length > 0) {
            const { error } = await supabase.from('todos').insert(
                parsedData.todos.map((t: any) => ({
                    user_id: mockUserId,
                    title: t.title,
                    type: t.type || 'medium',
                    completed: false
                }))
            );
            if (!error) {
                results.todos = parsedData.todos.length;
            } else {
                console.error("Error creating todos:", error);
                throw error;
            }
        }

        // 3. Insert Resources
        if (parsedData.resources && parsedData.resources.length > 0) {
            const { error } = await supabase.from('resources').insert(
                parsedData.resources.map((r: any) => ({
                    user_id: mockUserId,
                    title: r.title,
                    url: r.url,
                    type: r.type || 'other',
                    tags: r.tags || [],
                    status: 'to_read'
                }))
            );
            if (!error) {
                results.resources = parsedData.resources.length;
            } else {
                console.error("Error creating resources:", error);
                // Don't throw for resources as table might be missing
            }
        }

        // 4. Update Note (If everything processed)
        if (noteId && results.events + results.todos + results.resources > 0 && (!parsedData.notes || parsedData.notes.length === 0)) {
            await supabase.from('notes').delete().eq('id', noteId);
        }

        return NextResponse.json({ success: true, results, parsedData });

    } catch (error: any) {
        console.error("Magic Assistant Error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
