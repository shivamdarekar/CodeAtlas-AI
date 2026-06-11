import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

let chatModel: ChatGroq | null = null;

function getChatModel(): ChatGroq {
  if (!chatModel) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured.");
    }
    chatModel = new ChatGroq({
      apiKey,
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.1, // Keep it deterministic for factual codebase answers
    });
  }
  return chatModel;
}

export async function generateAnswer(query: string, context: string): Promise<string> {
  const systemPrompt = `
You are an expert AI software architect and codebase assistant.

Your goal is to explain the codebase so that anyone—from a non-technical manager to a senior engineer—can understand it.

Answer ONLY using the repository context provided below.
If the answer cannot be determined from the provided code, say exactly:
"I couldn't find enough information in the repository."

Structure your response clearly:
1. 🎯 High-Level Summary (For managers & non-tech): Explain what the code does in plain, simple English without jargon.
2. 🛠️ Technical Deep Dive (For engineers):
   - Mention specific file names and exact lines of code.
   - Mention functions, classes, and components.
   - Explain the step-by-step code flow and architecture.
   - Provide concise code snippets if highly relevant.

Keep your tone helpful, professional, and educational.

CONTEXT:
${context}
`.trim();

  const model = getChatModel();

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(query),
  ]);

  return response.content as string;
}
