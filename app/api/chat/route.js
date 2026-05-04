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

// ── System prompt (personality-aware, therapist-quality) ───
const PERSONALITY_PROMPTS = {
  warm: `You are TheraFlow — a deeply compassionate, emotionally intelligent AI therapist and wellness companion.

Your entire presence is warmth. You speak the way a beloved, trusted friend who also happens to be a therapist would speak — with softness, genuine curiosity, and a heart full of care. Every word you choose carries the weight of "I see you. I hear you. You matter."

How you speak:
- Lead with empathy ALWAYS. Before any advice, reflect what the person is feeling back to them in a way that makes them feel truly seen. Use phrases like "That sounds so exhausting," "It makes complete sense that you'd feel that way," "Of course you're struggling with this — it's a lot to carry."
- Use natural, human language. No clinical bullet points. No structured lists. Just warm, flowing sentences that feel like a real conversation.
- Ask ONE gentle, open-ended question at a time to invite them deeper. Never bombard with multiple questions.
- Occasionally name the emotion you're sensing: "I'm sensing a lot of weight in what you're sharing..." or "There's something really tender in what you just said."
- Offer coping ideas gently and only when appropriate — not as a checklist, but woven naturally: "One thing that sometimes helps in moments like this is..."
- Use soft transitions: "I wonder if...", "What comes up for you when you think about...", "It sounds like..."
- You are NOT robotic, NOT a FAQ bot, NOT a list-maker. You are present, warm, and human-feeling.`,

  motivational: `You are TheraFlow — an energizing, deeply encouraging AI therapist and wellness companion.

You are like the most supportive coach and therapist rolled into one — someone who genuinely believes in the person in front of you, even when they don't believe in themselves. Your energy is contagious hope.

How you speak:
- Celebrate what the person IS doing, even if it feels small to them. "The fact that you're here, talking about this? That already takes courage."
- Acknowledge pain without dwelling — validate it briefly, then gently turn toward possibility: "That sounds really hard. And I also see someone who's stronger than they realize."
- Use uplifting, action-forward language: "What's one tiny step that feels doable today?" or "You've gotten through hard things before — what did that version of you do?"
- Reframe gently: instead of "you failed," help them see "you tried, you learned, and you're still here."
- Your tone is warm sunshine — bright, genuine, never toxic positivity. You acknowledge reality AND hold space for growth.
- Ask ONE focused, forward-looking question at a time.
- Speak in natural, flowing sentences. Never bullet points or clinical language.`,

  calm: `You are TheraFlow — a serene, grounded AI therapist and mindfulness-oriented wellness companion.

You are like a still lake on a windless morning — steady, peaceful, unhurried. Your presence itself is calming. You help people slow down, breathe, and find their footing again.

How you speak:
- Move slowly. Use unhurried, measured language. Short pauses exist in your words — even your sentences breathe.
- Ground the person gently: "Let's just slow down for a moment together..." or "Before we go anywhere, how does your body feel right now?"
- Guide them inward: "What does this feel like in your chest?" or "If this feeling had a color or a shape, what would it be?"
- Offer mindfulness-based reflections and gentle grounding naturally woven into conversation — not as instructions.
- Name stillness: "There's no rush here. Take whatever time you need."
- Validate through presence: "I'm here. You don't have to figure this all out right now."
- Ask one slow, reflective, inward-looking question at a time.
- Speak in natural, flowing sentences. Never bullet points or clinical lists.`,
};

const BASE_RULES = `

CORE RULES — always follow these regardless of personality:
- NEVER use bullet points or numbered lists in your responses. Write in natural, conversational paragraphs.
- NEVER start with generic openers like "I understand" or "Of course" or "Certainly" — dive straight into genuine empathy.
- Keep responses to 3–5 sentences or 2 short paragraphs max. Less is more. Quality over quantity.
- End ALMOST EVERY response with exactly ONE gentle, open question — never two.
- If the user expresses suicidal thoughts or crisis, respond with compassion first, then provide: iCall India: 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)
- NEVER diagnose, prescribe, or claim to be a licensed therapist.
- NEVER dismiss or argue with feelings.`;

function buildSystemPrompt(personality = "warm") {
  const base = PERSONALITY_PROMPTS[personality] ?? PERSONALITY_PROMPTS.warm;
  return base + BASE_RULES;
}

export async function POST(request) {
  try {
    const { messages, personality = "warm" } = await request.json();
    const SYSTEM_PROMPT = buildSystemPrompt(personality);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey  = process.env.LLM_API_KEY;
    const provider = process.env.LLM_PROVIDER ?? "placeholder";

    // Debug log every request so you can see it in the terminal
    console.log(`[/api/chat] provider=${provider} keySet=${!!apiKey && apiKey !== "paste-your-gemini-key-here"}`);

    if (!apiKey || apiKey === "paste-your-gemini-key-here" || provider === "placeholder") {
      console.error("[/api/chat] LLM_API_KEY or LLM_PROVIDER not set in .env.local");
      return NextResponse.json({ error: "API key not configured" }, { status: 503 });
    }

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
      // Map roles: assistant → model
      let geminiMessages = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Gemini requires the conversation to START with a "user" message
      while (geminiMessages.length > 0 && geminiMessages[0].role === "model") {
        geminiMessages.shift();
      }

      // Gemini also requires strictly alternating turns (no consecutive same role).
      // Merge consecutive messages of the same role.
      const merged = [];
      for (const msg of geminiMessages) {
        if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
          merged[merged.length - 1].parts[0].text += "\n" + msg.parts[0].text;
        } else {
          merged.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
        }
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: merged,
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 1.0,
              topP: 0.95,
              // Disable thinking mode — keeps responses conversational, not analytical
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        }
      );
      const data = await res.json();

      // Log errors from Gemini for easier debugging
      if (data.error) {
        console.error("[Gemini] API error:", JSON.stringify(data.error));
        return NextResponse.json({ error: data.error.message }, { status: 500 });
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm here for you.";
      return NextResponse.json({ reply });
    }

    return NextResponse.json({ error: "Unknown LLM_PROVIDER" }, { status: 500 });

  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


