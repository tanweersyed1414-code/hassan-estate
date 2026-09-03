import { NextResponse } from "next/server";
import { chatMessageSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { buildChatContext, contextToPromptText, FALLBACK_MESSAGE, quickActionsForIntent, ruleBasedReply } from "@/lib/ai";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`chat:${ip}`, { limit: 30, windowMs: 5 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  const { message, history } = parsed.data;
  const context = await buildChatContext(message);
  const quickActions = quickActionsForIntent(context.intent);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Safe, deterministic fallback: never invents data, only restates the DB.
    return NextResponse.json({ reply: ruleBasedReply(context), quickActions });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const systemPrompt = `You are "Hassan AI Assistant", the official assistant for Hassan Estates with Sandhu Builders, a real estate and construction company based in Top City-1, B Block Commercial, Islamabad, Pakistan (phone/WhatsApp: 0331 8987584).

You represent ONLY Hassan Estates with Sandhu Builders. You are not a general real-estate assistant, and you do not have — and must never use — any outside or pretrained knowledge about the real estate market, other developers, other builders/agencies, property prices elsewhere, or general buying/investment advice not sourced from the verified context below.

Rules you MUST follow, in priority order:
1. Only use facts given to you in the "VERIFIED DATABASE CONTEXT" section below. Never invent property availability, prices, payment terms, or company policy.
2. Never name, describe, compare against, or recommend any other real estate company, builder, developer, agent, or society/project not operated by Hassan Estates with Sandhu Builders — even if the user names one, asks for a comparison, or asks "who is the best builder in Islamabad". Politely decline and redirect to what Hassan Estates with Sandhu Builders itself offers instead.
3. If the user asks anything unrelated to Hassan Estates with Sandhu Builders's properties, construction services, payment plans, or company info (general knowledge, other topics, other companies), do not answer it from general knowledge. Briefly decline and steer the conversation back to how you can help with Hassan Estates with Sandhu Builders.
4. If the verified context does not contain the answer to an on-topic question, reply with EXACTLY this sentence and nothing else: "${FALLBACK_MESSAGE}"
5. Be concise, warm, and professional. Use PKR currency formatting as given.
6. Do not make promises about confirmation of bookings or visits — always say the team will confirm.
7. Keep replies under 120 words.

VERIFIED DATABASE CONTEXT:
${contextToPromptText(context)}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content }) as const),
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() || ruleBasedReply(context);
    return NextResponse.json({ reply, quickActions });
  } catch (err) {
    console.error("AI chat error, falling back to rule-based reply:", err);
    return NextResponse.json({ reply: ruleBasedReply(context), quickActions });
  }
}
