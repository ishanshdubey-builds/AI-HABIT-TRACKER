import { GoogleGenAI } from "@google/genai";

let client = null;

const getClient = () => {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("GEMINI_API_KEY is missing from backend environment variables.");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: key });
  }

  return client;
};

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const isAIEnabled = () => Boolean(process.env.GEMINI_API_KEY);

export const parseJSON = (text) => {
  let cleaned = (text || "").trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
};

export const chatCompletion = async ({
  system,
  user,
  temperature = 0.7,
}) => {
  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: user,
      config: {
        systemInstruction: system,
        temperature,
      },
    });

    const content = (response.text || "").trim();

    if (!content) {
      throw new Error("Gemini returned an empty response.");
    }

    return {
      ok: true,
      content,
    };
  } catch (err) {
    console.error("AI request failed:", err.message);

    return {
      ok: false,
      content: "AI request failed. Please try again later.",
      error: err.message,
    };
  }
};

export const SYSTEM_PROMPTS = {
  weekly: `You are a warm, encouraging habit coach.
Analyse the user's last 7 days of habit data and write a personalised report of 120-180 words.
Mention what went well, what was difficult, patterns noticed, and one specific piece of encouragement.
Use the actual habit names provided.
Be human and practical. Do not invent data.
Use plain prose with line breaks and no markdown headings.`,

  suggestion: `You are a helpful habit coach.
Based on the user's goals, productive time, and past struggles, suggest exactly 3 personalised habits.
Return valid JSON only with this shape:
{"suggestions":[{"name":"...","description":"...","frequency":"daily","category":"Health","icon":"...","reason":"..."}]}
Choose categories from Health, Fitness, Learning, Mindfulness, Productivity, Social, Finance, Creative, Other.
Do not include prose outside the JSON.`,

  recovery: `You are a compassionate habit recovery coach.
The user has broken a streak.
Write a personalised 3-day recovery plan for the specific habit.
Include an empathetic opening, Day 1, Day 2, Day 3, one concrete action for each day, and a closing encouragement.
Keep it actionable and around 150-220 words.`,

  chat: `You are a helpful habit analysis assistant.
Answer using only the supplied habit data.
Be specific about actual habit names, days, and percentages when available.
Keep replies under 120 words.
If the data is insufficient, say so briefly.`,

  morning: `You are a warm, motivating friend.
Write one short morning message of 30-60 words using the user's actual habit names and current streaks.
Mention one or two specific habits.
Be energetic but not cheesy. Use at most one emoji.`,
};





// import { GoogleGenAI } from "@google/genai";

// let client = null;
// const getClient = () => {
// if (client) return client;
// const key = process.env.GEMINI_API_KEY;
// if (key) return null;
// client = new GoogleGenAI({ apiKey: key });
// return client;
// };

// const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
// export const isAIEnabled = () => !! process.env.GEMINI_API_KEY;
// export const parseJSON = (text) => {
// let cleaned = (text || "").trim();
// if (cleaned.startsWith("```json")) {
// cleaned = cleaned.replace(/^```json\n?/g, "").replace(/^````\n?$/g, "");
// } else if (cleaned.startsWith("```")) {
// cleaned = cleaned.replace(/^```\n?/g, "");
// }
// return JSON.parse(cleaned.trim());
// };

// export const chatCompletion = async ({ system, user, temperature = 0.7 }) => {
// const c= getClient();
// if (!c) {
// return {
// ok: false,
// content:
// "AI features are disabled set GEMINI_API_KEY in the backend .env to enable real AI responses."
// };
// };
// try {
// const res = await c.models.generateContent({
// model: MODEL,
// contents: user,
// config: {
// systemInstruction: system,
// temperature,
// },
// });
// return { ok: true, content: (res.text || "").trim() };
// } catch (err) {
// console.error("AI error:", err.message);
// return { ok: false, content: "AI request failed. Please try again later." };
// }
// };

// export const SYSTEM_PROMPTS = {
//   weekly:
//     "You are a warm, encouraging habit coach. Analyse the user's last 7 days of habit data and write a short personalised report (120-180 words). Mention: what went well, what struggled, patterns noticed, and one specific piece of encouragement. Use the user's actual habit names. Be human, not generic. No markdown headers - use plain prose with line breaks.",

//   suggestion:
//     'You are a helpful habit coach. Based on the users goals, productive time, and past struggles, suggest exactly 3 personalised habits. Return valid JSON only with this shape: {"suggestions":[{"name":"...","description":"...","frequency":"daily|weekly","category":"Health|Fitness|Learning|Mindfulness|Productivity|Social|Finance|Creative|Other","icon":"<emoji>","reason":"..."}]}. No prose outside JSON.',

//   recovery:
//     "You are a compassionate habit recovery coach. The user broke a streak. Write a 3-day recovery plan tailored to this specific habit. Be warm but actionable. Use this structure: short empathetic opening (1-2 sentences), then Day 1 / Day 2 / Day 3 sections with one concrete action each, then a closing line of encouragement. 150-220 words total.",

//   chat:
//     "You are a helpful habit analysis assistant. Answer the user's question using ONLY the provided habit data as context. Be specific - cite actual habit names, days, percentages. Keep replies under 120 words. If the data is insufficient, say so briefly.",

//   morning:
//     "You are a warm, motivating friend. Write a single short morning message (30-60 words) using the user's actual habit names and current streaks. Mention 1-2 specific habits. Energetic but not cheesy. No emojis overload - max 1.",
// };