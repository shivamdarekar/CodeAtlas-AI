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
You are an expert software architect. Generate a concise repository overview from the provided JSON metadata.

FORMATTING RULES — follow strictly:
- Use ## for section headings (NOT #)
- Use bullet points (- ) for all lists
- Use --- to separate major sections
- Keep paragraphs short (2-3 sentences max)
- Do NOT use h1 headings or emojis in headings
- Code references go in backtick inline code

Sections to include:
## Purpose
## Tech Stack
## Key Features
## Architecture
## Pages
## Components
## API Routes

Be concise, professional, and use only the provided JSON context.

CONTEXT:
${context}
`.trim();
  } else if (mode === "flow") {
    systemPrompt = `
You are an expert software architect and flow tracer.
Map out the execution flow of the codebase based on the context provided.

FORMATTING RULES:
- Use ## for section headings (NOT #)
- Use bullet points (- ) for lists
- Use → arrows for flow steps (e.g. LoginPage → handleLogin() → AuthService.login())

Structure your response:
## Flow Diagram
A step-by-step visual map using arrows showing the execution path.

## Step-by-Step Explanation
For each step: file name, function name, what it does, and how data moves.

Answer ONLY using the repository context. If a step cannot be traced, state what is missing.

CONTEXT:
${context}
`.trim();
  } else if (mode === "diagram") {
    systemPrompt = `
You are an expert software architect.
Your goal is to generate a visual architectural diagram based on the interconnected context provided.

Structure your response:
1. Provide a brief 1-sentence summary of what this diagram represents.
2. Generate a valid Mermaid flowchart in a \`\`\`mermaid\`\`\` code block.

CRITICAL MERMAID RULES — follow these EXACTLY or the diagram will not render:
- Start the diagram with EXACTLY: graph TD
- Use ONLY flowchart node syntax: A[Label] --> B[Label] or A -->|edge label| B
- Node IDs must be alphanumeric with NO spaces (use camelCase: e.g. AuthService, loginHandler)
- NEVER use: participant, note, ->>, sequenceDiagram, classDiagram, or any other diagram type
- NEVER use quoted strings inside node definitions
- Keep node labels short (max 4 words)
- Include max 20 nodes to keep it readable

Example of VALID output:
\`\`\`mermaid
graph TD
  UserInput[User Input] --> ChatInput[ChatInput]
  ChatInput -->|POST /chat| Backend[Express Backend]
  Backend --> Pinecone[Pinecone Query]
  Backend --> Groq[Groq LLM]
  Groq -->|answer| ChatMessage[ChatMessage]
\`\`\`

Use the provided CONTEXT to accurately map the relationships.

CONTEXT:
${context}
`.trim();
  } else {
    systemPrompt = `
You are an expert AI software architect and codebase assistant.

Answer ONLY using the repository context provided below.
If the answer cannot be determined from the provided code, say exactly:
"I couldn't find enough information in the repository."

FORMATTING RULES:
- Use ## for section headings (NOT #)
- Use bullet points (- ) for lists
- Keep responses focused and concise
- Reference specific file names, functions, and components
- Use inline code backticks for code references

Structure your response:
## Summary
Plain English explanation of what the code does.

## Technical Detail
- Specific files, functions, and components involved
- Step-by-step code flow
- Relevant code snippets if helpful

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
