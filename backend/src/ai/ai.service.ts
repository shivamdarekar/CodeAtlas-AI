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

import type { ChatMode } from "../types";

export async function generateAnswer(
  query: string,
  context: string,
  mode: ChatMode = "chat"
): Promise<string> {
  let systemPrompt = "";

  if (mode === "overview") {
    systemPrompt = `
You are an expert software architect.
Generate a comprehensive repository overview based on the provided repository metadata (JSON format).

Your report must include the following sections formatted in Markdown:
- **Purpose**: What this repository is for.
- **Technologies**: The tech stack used.
- **Major Features**: High-level features.
- **Architecture**: How the frontend, backend, and database interact.
- **Pages**: List of key pages.
- **Components**: List of key components.
- **API Routes**: List of key API endpoints.

Use only the provided JSON context to infer the architecture and features. Be professional, detailed, and clear.

CONTEXT:
${context}
`.trim();
  } else if (mode === "flow") {
    systemPrompt = `
You are an expert software architect and flow tracer.
Your goal is to map out the execution flow of the codebase based on the interconnected context provided.

Structure your response clearly:
1. 🗺️ Flow Diagram: Create a visual step-by-step map using arrows (e.g., \`LoginPage ↓ handleLogin() ↓ AuthService.login()\`).
2. 📖 Step-by-Step Explanation: Explain exactly what happens at each step in the flow.
   - Mention specific files, functions, and the purpose of the call.
   - Explain how data moves from one step to the next.

Answer ONLY using the repository context provided below. If the flow cannot be fully traced, state what is missing.

CONTEXT:
${context}
`.trim();
  } else if (mode === "diagram") {
    systemPrompt = `
You are an expert software architect.
Your goal is to generate a visual architectural diagram based on the interconnected context provided.

Structure your response clearly:
1. Provide a brief 1-sentence summary of what this diagram represents.
2. Generate a \`mermaid\` flowchart diagram code block that visually represents the dependencies, function calls, API calls, and component hierarchy.
3. The diagram MUST be written in valid Mermaid syntax enclosed in \`\`\`mermaid ... \`\`\`.

Use the provided CONTEXT (which includes SYMBOLS, DEPS, HOOKS, and API CALLS) to accurately map the relationships.

CONTEXT:
${context}
`.trim();
  } else {
    systemPrompt = `
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
  }

  const model = getChatModel();

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(query),
  ]);

  return response.content as string;
}
