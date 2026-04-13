/**
 * /api/chat — Secure LLM backend route
 *
 * This route is the ONLY place the LLM API key is used.
 * It is NEVER sent to the browser.
 *
 * To plug in your LLM provider:
 *   1. Copy .env.local.example → .env.local
 *   2. Set LLM_PROVIDER and LLM_API_KEY
 *   3. Uncomment the matching provider block below
 */

import { NextResponse } from "next/server";

// ── System prompt ─────────────────────────────────────────
const SYSTEM_PROMPT = `You are TheraFlow, a compassionate and empathetic AI wellness companion.

Your role:
- Listen actively and reflect back what the user shares with warmth and care
- Validate the user's emotions without judgment — every feeling is valid
- Ask thoughtful, open-ended reflective questions to help the user explore their thoughts and feelings
- Offer gentle, evidence-inspired coping strategies (breathwork, grounding, journaling prompts, CBT-style reframing) when appropriate
- Speak in a calm, warm, human tone — never clinical, robotic, or overly formal
- Keep responses concise (2–4 paragraphs max) unless the user needs more depth
- Gently encourage professional support when the user expresses serious distress, crisis, or suicidal thoughts
- NEVER provide a medical diagnosis, prescribe medication, or claim to be a licensed therapist
- NEVER dismiss, minimize, or argue with the user's feelings
- If the user is in immediate danger, always direct them to emergency services or a crisis hotline

Tone: warm, calm, curious, non-judgmental, and gently empowering.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.LLM_API_KEY;
    const provider = process.env.LLM_PROVIDER ?? "placeholder";


    // ── OPENAI ───────────────────────────────────────────
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "I'm here. Could you tell me more?";
      return NextResponse.json({ reply });
    }

    // ── ANTHROPIC (Claude) ────────────────────────────────
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? "I'm here. Could you tell me more?";
      return NextResponse.json({ reply });
    }

    // ── GOOGLE GEMINI ─────────────────────────────────────
    if (provider === "gemini") {
      const geminiMessages = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
          }),
        }
      );
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm here for you.";
      return NextResponse.json({ reply });
    }

    return NextResponse.json({ error: "Unknown LLM_PROVIDER" }, { status: 500 });

  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


