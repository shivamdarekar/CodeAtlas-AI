# CodeAtlas — Complete System Architecture Guide
*For learning, understanding, and placement preparation*

---

## Table of Contents

1. [What Is CodeAtlas?](#1-what-is-codeatlas)
2. [The Core Problem — Why Standard RAG Fails for Code](#2-the-core-problem--why-standard-rag-fails-for-code)
3. [Tech Stack — Every Tool Explained with Reasoning](#3-tech-stack--every-tool-explained-with-reasoning)
4. [What Is an AST? (Simple Explanation First)](#4-what-is-an-ast-simple-explanation-first)
5. [End-to-End Backend Flow — The Big Picture](#5-end-to-end-backend-flow--the-big-picture)
   - 5.1 Step 1 — Repository Intake (Clone)
   - 5.2 Step 2 — File Scanning & Smart Filtering
   - 5.3 Step 3 — AST Chunking
   - 5.4 Step 4 — Metadata Extraction
   - 5.5 Step 5 — Noise Filtering
   - 5.6 Step 6 — Embedding Generation
   - 5.7 Step 7 — Pinecone Upsert
   - 5.8 Step 8 — Summary Generation
   - 5.9 Step 9 — Cleanup
6. [Deep Dive: AST Chunking](#6-deep-dive-ast-chunking)
7. [Deep Dive: Metadata — What, Why, How](#7-deep-dive-metadata--what-why-how)
8. [Deep Dive: Embeddings Pipeline](#8-deep-dive-embeddings-pipeline)
9. [Deep Dive: Pinecone Storage](#9-deep-dive-pinecone-storage)
10. [The 4 Query Modes — How Each Works](#10-the-4-query-modes--how-each-works)
11. [Multi-Hop Retrieval — The Core Innovation](#11-multi-hop-retrieval--the-core-innovation)
12. [LangChain — Used Selectively, Not as a Religion](#12-langchain--used-selectively-not-as-a-religion)
13. [LLM Prompt Engineering](#13-llm-prompt-engineering)
14. [Frontend Architecture](#14-frontend-architecture)
15. [Backend Folder Structure Explained](#15-backend-folder-structure-explained)
16. [Key Design Decisions & Trade-offs](#16-key-design-decisions--trade-offs)
17. [Interview & Placement Talking Points](#17-interview--placement-talking-points)
18. [Deployment Architecture](#18-deployment-architecture)
19. [Scalability — Current State & Future Improvements](#19-scalability--current-state--future-improvements)

---

## 1. What Is CodeAtlas?

**CodeAtlas is an AI-powered codebase intelligence tool.**

Here's what it does in plain English:

1. A user pastes a public GitHub URL (e.g., `https://github.com/someone/my-app`)
2. The backend **clones** the repository
3. It **reads and understands** every source file using a real TypeScript compiler (not just text search)
4. It extracts every **function, class, React component, and their relationships** (who calls who, which component renders which)
5. All of this gets stored in a **vector database** (Pinecone)
6. The user gets a **chat interface** where they can ask questions, trace code flows, and generate architecture diagrams

**The key difference from basic AI code tools:**

Most tools just read code as plain text. CodeAtlas *understands the structure*. It knows that `loginUser()` calls `AuthService.login()` which hits `/api/auth`. It stores those relationships. When you ask "how does login work?", it follows that chain and gives you a precise, accurate answer — not a guess.

---

## 2. The Core Problem — Why Standard RAG Fails for Code

### What is Standard RAG?

RAG stands for **Retrieval-Augmented Generation**. The basic idea:

```
Document → Split into 500-character chunks → Convert to numbers (embed) → Store
User asks question → Convert question to numbers → Find most similar chunks → Give to AI → Get answer
```

This works well for documents like PDFs and articles. It **fails badly for code**.

### Why RAG Breaks for Code

Think of code like a recipe that spans multiple pages of a cookbook, where each step references another recipe in a different chapter. If you randomly cut the cookbook into 500-character pieces, you'll lose the connections between steps.

| Problem | What Happens |
|---|---|
| **Function cut in half** | The text splitter hits the 500-char limit mid-function. The AI gets an incomplete function — like a sentence that stops in the midd |
| **No relationship knowledge** | The AI doesn't know that `loginUser()` calls `findUser()` in another file. Those are in separate chunks with no connection |
| **Missing dependencies** | The relevant chunk for a dependency wasn't in the top-10 search results, so the AI never sees it |
| **Hallucination** | AI makes up the missing parts because it doesn't have complete context |

### Our Solution

```
Code → AST Parser → Extract COMPLETE functions/classes/components
     → Store relationship metadata (who calls who, what API it hits, what it renders)
     → On query: vector search for entry point + follow the dependency chain
     → AI gets the COMPLETE execution graph → Precise, accurate answer
```

---

## 3. Tech Stack — Every Tool Explained with Reasoning

### Backend

| Technology | What It Does | Why This, Not Something Else |
|---|---|---|
| **Node.js + Express** | REST API server | Lightweight, non-blocking I/O — perfect for API-heavy work. No heavy framework needed |
| **TypeScript** | Type-safe development | Catches bugs before they run. Matches the frontend stack — one language across the whole project |
| **ts-morph** | TypeScript Compiler API wrapper | Gives us the *exact same* AST the `tsc` compiler uses internally. Regex cannot match this accuracy |
| **HuggingFace Inference API** | Generates 384-number vector embeddings | Free tier. `BAAI/bge-small-en-v1.5` model is purpose-built for retrieval — not for chatting, but for finding similar text |
| **Pinecone Serverless** | Vector database | Stores embeddings + metadata. Supports `$in` metadata filter — critical for our multi-hop algorithm |
| **Groq + Llama-3.3-70b** | LLM for generating answers | 10–20× faster than GPT-4 because Groq uses custom LPU hardware. Free tier is generous |
| **LangChain (`@langchain/groq`)** | LLM abstraction | Provides clean `SystemMessage` + `HumanMessage` format for Groq. Only used here — not for embeddings or Pinecone |
| **simple-git** | Git operations | Programmatic shallow clone (`--depth 1`) — downloads only the latest code, not the entire git history |
| **Zod** | Request validation | Runtime type checking for API inputs. Throws structured error messages, not crashes |
| **rimraf** | Disk cleanup | Deletes cloned repo after indexing. Without this, the server disk fills up fast |

### Frontend

| Technology | Why |
|---|---|
| **Next.js 16 App Router** | File-based routing, `[namespace]/chat` dynamic routes, modern React |
| **Tailwind CSS + shadcn/ui** | Professional-looking UI without writing custom CSS from scratch |
| **Zustand** | Simpler than Redux — no Provider wrapper, no reducers. Just use it like a hook |
| **Axios** | Cleaner than `fetch` — supports timeout, interceptors, base URL config |
| **react-markdown** | Renders AI's markdown response (headers, bullet points, code blocks) properly |
| **react-syntax-highlighter** | Syntax-highlighted code blocks inside chat messages |
| **Mermaid.js** | Converts AI-generated diagram text into actual SVG visuals |
| **React Flow** | Drag-and-drop node graph for exploring the codebase architecture visually |
| **Three.js** | 3D animated particle canvas on the landing page |

---

## 4. What Is an AST? (Simple Explanation First)

### The Simple Analogy

When you read the sentence *"The dog chased the cat"*, your brain doesn't just see letters — it automatically understands the structure: subject (*dog*), verb (*chased*), object (*cat*). You can answer: "Who did the chasing?" instantly.

An AST does the same for code. It's not just raw text — it's a structured understanding of what the code *means*.

**AST = Abstract Syntax Tree** — a tree-shaped data structure that represents every piece of code as typed, named nodes.

### The Technical Example

Given this TypeScript code:

```typescript
function loginUser(email: string) {
  const user = findUserByEmail(email);
  return AuthService.createToken(user);
}
```

The AST looks like this:

```
FunctionDeclaration
  name: "loginUser"
  parameters: [email: string]
  body: Block
    ├── VariableStatement
    │     name: "user"
    │     value: CallExpression → "findUserByEmail"
    └── ReturnStatement
          CallExpression → "AuthService.createToken"
            argument: "user"
```

The AST is a *data object*, not text. You can ask it precise questions:
- "What is the name of this function?" → `loginUser`
- "What functions does it call?" → `findUserByEmail`, `AuthService.createToken`
- "Where does it start and end (line numbers)?" → Line 1 to Line 4
- "Is this a React component?" → Check if the name is PascalCase in a `.tsx` file

**None of this is possible reliably with text search or regex.**

### Why Not Just Use Regex?

```
/function\s+(\w+)/   → works for: function login() {}
                      → breaks for: const login = () => {}
                      → breaks for: export default function() {}
                      → breaks for: const Login = memo(() => {})
                      → breaks for: async function login() {}
```

Regex breaks the moment code doesn't match the exact pattern. AST handles all of these because it understands the *meaning*, not just the characters.

---

## 5. End-to-End Backend Flow — The Big Picture

Here's the complete journey from when a user submits a GitHub URL to when the data is ready to query:

```
User submits GitHub URL
         ↓
POST /api/v1/repos/analyze
         ↓
[STEP 1]  Validate URL → Generate repoId (UUID) → this becomes Pinecone namespace
         ↓
[STEP 2]  simple-git → shallow clone into tmp/repos/{repoId}/
         ↓
[STEP 3]  Walk directory tree → skip junk files → collect source files
         ↓
[STEP 4]  For each file:
          .ts/.tsx/.js/.jsx → AST chunking (ts-morph)
          Everything else   → Line-based chunking (max 1500 chars)
         ↓
[STEP 5]  Extract metadata from each chunk
          (functionCalls, componentDependencies, hooksUsed, apiCalls, imports, exports)
         ↓
[STEP 6]  Filter out noise (console.log, Math.floor, JSON.parse, etc.)
         ↓
[STEP 7]  embedTexts(all chunk contents)
          → Batches of 32, 3 concurrent workers, retry on rate limit
          → 384-dim vector per chunk
         ↓
[STEP 8]  pinecone.upsert(records)
          → Batches of 100, 5 concurrent workers
          → Each record: { id, vector, metadata }
          → All stored in namespace = repoId
         ↓
[STEP 9]  Build summary.json and save to disk
         ↓
[STEP 10] rimraf → delete tmp/repos/{repoId}/
         ↓
Return success response to frontend
```

**Concurrency note:** Files are processed 10 at a time (not one by one). This makes indexing significantly faster for large repos.

---

### 5.1 Step 1 — Repository Intake (Clone)

**File:** `src/services/repository.service.ts`

- URL is validated: must be `github.com` format with owner + repo name
- `crypto.randomUUID()` generates a unique `repoId` — this UUID becomes the **Pinecone namespace** that isolates this repo from all others forever
- `simple-git` runs a **shallow clone** (`--depth 1`) — downloads only the latest snapshot, not the full git history. A 500MB repo might download as only 50MB this way

---

### 5.2 Step 2 — File Scanning & Smart Filtering

**File:** `src/indexing/scanner/repository-scanner.ts`

The scanner walks every folder and makes smart decisions about what to process.

**Directories it skips entirely:**
```
node_modules, .git, dist, build, .next, coverage, .turbo, .cache
```
(These contain generated/dependency code, not the actual project code)

**Individual files it skips:**
```
package-lock.json, yarn.lock, tsconfig.json, next.config.js, .env, *.lock
```
(Config files and lockfiles add noise without useful logic)

**File types it accepts:**
```
.ts, .tsx, .js, .jsx  → code files → AST chunking
.json, .md, .html, .css, .py → other files → line-based chunking
```

---

### 5.3 Step 3 — AST Chunking

**File:** `src/indexing/chunker/code-chunker.ts`

For `.ts/.tsx/.js/.jsx` files, the code is passed to `ts-morph` which parses it into a full AST. The chunker then walks the top-level statements and extracts:

- `FunctionDeclaration` → one chunk (the whole function)
- `ClassDeclaration` → one chunk for the class + one chunk per method
- `VariableStatement` with `ArrowFunction` → detected and chunked properly
- Everything else (imports, types, constants) → one "module" chunk per file

For other file types, simple line-based splitting is used (max 1500 chars per chunk).

---

### 5.4 Step 4 — Metadata Extraction

For every code chunk, `extractASTMetadata()` walks through the AST nodes and collects:

| Field | What it captures | Example |
|---|---|---|
| `symbolName` | The primary name of this chunk | `"AuthService.login"` |
| `functionCalls` | Every function this code calls | `["findUserByEmail", "bcrypt.compare"]` |
| `componentDependencies` | React components this renders | `["Button", "Modal", "AuthDialog"]` |
| `hooksUsed` | React hooks used | `["useState", "useEffect"]` |
| `apiCalls` | API endpoints called | `["/api/auth/login"]` |
| `imports` | What this file imports | `["react", "axios"]` |
| `exports` | What this file exports | `["AuthService"]` |
| `kind` | Type of chunk | `"component"`, `"function"`, `"class"`, `"method"` |
| `startLine` / `endLine` | Exact line numbers | `12`, `28` |

---

### 5.5 Step 5 — Noise Filtering

Raw AST extraction picks up *everything* — including `Math.floor`, `console.log`, `JSON.parse`. These are built-in JavaScript functions, not your application code. They're useless for tracing logic.

They're removed using an ignore list:
```
Math, Object, Array, String, Number, JSON, Date, console, Promise, Error,
window, document, localStorage, sessionStorage, setTimeout, setInterval, parseFloat, parseInt
```

Any function call that starts with one of these is excluded from `functionCalls`.

---

### 5.6 Step 6 — Embedding Generation

**File:** `src/indexing/embeddings/embedding.service.ts`

Every chunk's text content is converted to a **384-dimensional vector** using the `BAAI/bge-small-en-v1.5` model via HuggingFace API.

Why batching? The naive approach is slow:
```
300 chunks × 1 API call each × 700ms per call = 210 seconds = 3.5 minutes ❌
```

Our approach:
```
300 chunks → split into batches of 32 → 3 batches run at the same time
→ ~10 rounds × 700ms ÷ 3 = ~23 seconds ✅
```

---

### 5.7 Step 7 — Pinecone Upsert

**File:** `src/vectorstore/pinecone.service.ts`

Each chunk becomes a Pinecone record:
```
id:       "repoId:filePath:chunkIndex"    → unique identifier
values:   [0.023, -0.047, ...]            → 384-dim vector
metadata: { symbolName, functionCalls, content, filePath, ... }
```

Records are upserted in batches of 100 with 5 concurrent workers.

---

### 5.8 Step 8 — Summary Generation

A lightweight `summary.json` file is built and saved to disk. It categorizes the project:
- Files in `app/**/page.tsx` → **pages**
- Files in `components/` → **components**
- Files in `hooks/` or symbols starting with `use` → **hooks**
- Files in `services/` → **services**
- Files in `api/` or `routes/` → **API routes**

This summary is only used by the `overview` query mode (no vector search needed there).

---

### 5.9 Step 9 — Cleanup

`rimraf` deletes `tmp/repos/{repoId}/` — the cloned repo folder. This runs inside a `try/finally` block, so even if indexing fails halfway through, the disk is still cleaned up.

---

## 6. Deep Dive: AST Chunking

**File:** `src/indexing/chunker/code-chunker.ts`

### How a File Gets Parsed

```typescript
const project = new Project({ useInMemoryFileSystem: true });
const sourceFile = project.createSourceFile(`temp.tsx`, content, {
  scriptKind: ScriptKind.TSX
});
```

`ts-morph` creates a **virtual TypeScript project in memory** — no real files, no tsconfig needed. The file content is parsed into a complete, traversable AST in milliseconds.

### What Each Node Type Produces

**1. Function Declaration**
```typescript
function renderTask(task) {
  const li = document.createElement("li");
  taskList.appendChild(li);
}
```
→ **One chunk.** `kind: "function"`. If the name is PascalCase and file is `.tsx`/`.jsx` → `kind: "component"`.

**2. Class Declaration — produces MULTIPLE chunks**
```typescript
class AuthService {
  login() { ... }
  register() { ... }
}
```
→ **Chunk 1:** The entire class. `kind: "class"`, `symbolName: "AuthService"`.
→ **Chunk 2:** The `login` method. `kind: "method"`, `symbolName: "AuthService.login"`.
→ **Chunk 3:** The `register` method. `kind: "method"`, `symbolName: "AuthService.register"`.

*Why both the class AND methods?* The class gives full context. The methods allow precise retrieval — if someone asks "how does login work?", they get exactly the login method, not the whole class.

**3. Arrow Function Variables — all handled correctly**
```typescript
const ProductCard = () => { return <div/> }           // basic arrow
const ProductCard = memo(() => { return <div/> })     // wrapped in memo
const Foo: React.FC<Props> = () => { ... }            // typed as React.FC
```
All detected by `getFunctionVariableInfo()`. Wrapped in `memo()`, `forwardRef()`, `lazy()`, `observer()` → `kind: "component"`.

**4. React Component Detection Rule**
Two conditions BOTH must be true:
- Name is PascalCase (`/^[A-Z][A-Za-z0-9]*$/`)
- File extension is `.tsx` or `.jsx`

**5. Module Chunk — the "everything else" bucket**
Imports, type declarations, constants, interfaces → all collected into one `kind: "module"` chunk per file. If this chunk is under 100 characters (too small to be useful), it gets merged into the previous chunk.

**6. Oversized Chunks**
If any chunk exceeds 1500 characters, it's split by lines. The **metadata is preserved on every sub-chunk** — symbolName, functionCalls, etc. still carry through.

### Chunk ID Format
```
{repoId}:{filePath}:{chunkIndex}
Example: b45c9245-f22e:src/auth.ts:3
```

---

## 7. Deep Dive: Metadata — What, Why, How

This is what a full metadata object looks like inside Pinecone:

```json
{
  "repoId": "b45c9245-f22e-4755-b1a8-c9903f3f041b",
  "repoName": "my-app",
  "filePath": "src/services/auth.service.ts",
  "fileName": "auth.service.ts",
  "extension": ".ts",
  "language": "typescript",
  "directory": "src/services",

  "kind": "method",
  "symbolName": "AuthService.login",
  "chunkIndex": 4,
  "startLine": 12,
  "endLine": 28,

  "content": "login(email, password) { ... full method body ... }",
  "contentLength": 342,

  "imports": ["bcrypt", "jsonwebtoken", "./user.model"],
  "exports": ["AuthService"],

  "functionCalls": ["bcrypt.compare", "jwt.sign", "findUserByEmail"],
  "componentDependencies": [],
  "hooksUsed": [],
  "apiCalls": []
}
```

### Why Each Field Matters

| Field | Why We Store It |
|---|---|
| `content` | The AI needs the actual code to answer questions |
| `symbolName` | Powers multi-hop — we query `{ symbolName: { $in: ["login"] } }` to fetch this exact chunk |
| `functionCalls` | Multi-hop: we know `login` calls `findUserByEmail`, so we fetch that chunk too in the second query |
| `componentDependencies` | Multi-hop for React: `ProductCard` renders `<Button>` and `<Modal>`, fetch those too |
| `hooksUsed` | Tells the AI which React hooks this component depends on |
| `apiCalls` | Tells the AI which API endpoints this code calls |
| `imports` | Shows external and internal dependencies |
| `exports` | Shows what this file exposes to the rest of the codebase |
| `startLine` / `endLine` | Frontend can show "go to line X" links |
| `kind` | Enables filtering: "show all React components", "show all API routes" |

---

## 8. Deep Dive: Embeddings Pipeline

**File:** `src/indexing/embeddings/embedding.service.ts`

### What is an Embedding?

An embedding is a list of numbers (a **vector**) that represents the *meaning* of text. Two texts with similar meaning will have vectors that are close together in mathematical space.

```
"login function"     → [0.12, -0.45, 0.33, ...]   (384 numbers)
"authenticate user"  → [0.11, -0.44, 0.35, ...]   ← very close = high similarity
"render a button"    → [-0.87, 0.21, -0.14, ...]  ← far away = low similarity
```

This is how semantic search works — find the chunks whose *meaning* is closest to the user's question.

### Model: BAAI/bge-small-en-v1.5

- BGE = BAAI General Embedding — designed specifically for retrieval (finding similar text), not generation
- **384 dimensions** — small enough to be fast and cheap, large enough for excellent accuracy
- **Free** via HuggingFace Inference API
- Comparable to OpenAI's `text-embedding-3-small` (1536-dim, paid) for code search tasks

### The Batching + Worker Pool Strategy

**Naive approach (wrong):**
```typescript
for (const chunk of chunks) {
  await embedText(chunk);  // one API call per chunk
}
// 300 chunks × 700ms = 210 seconds ❌
```

**Worker pool approach (right):**
```typescript
// Split into batches of 32 (HuggingFace supports array input)
const batches = splitIntoBatches(texts, 32);
let nextBatch = 0;

async function worker() {
  while (nextBatch < batches.length) {
    const i = nextBatch++;           // each worker claims the next unclaimed batch
    results[i] = await embedBatch(batches[i]);
  }
}

// Run 3 workers simultaneously
await Promise.all([worker(), worker(), worker()]);
// 300 chunks → 10 batches → ~4 rounds with 3 concurrent workers = ~23 seconds ✅
```

**Why worker pool instead of `Promise.all` on all batches?**
`Promise.all` on 300 items launches 300 requests at once → **HTTP 429 rate limit immediately**. The worker pool keeps exactly 3 requests in flight at all times — steady throughput, no rate limit hits.

### Retry Logic

```typescript
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    return await embedBatch(texts);
  } catch (err) {
    if (err.status === 429) {
      await sleep(1000 * attempt);   // wait 1s, then 2s, then 3s
    } else {
      throw err;  // non-rate-limit error — don't retry, something else broke
    }
  }
}
```

### Query Time Embedding (Different)

At query time, only ONE text needs to be embedded — the user's question. No batching needed:

```typescript
export async function embedQuery(text: string): Promise<number[]> {
  const result = await hfClient.featureExtraction({
    model: "BAAI/bge-small-en-v1.5",
    inputs: text,    // single string, not array
  });
  return result as number[];
}
```

---

## 9. Deep Dive: Pinecone Storage

**File:** `src/vectorstore/pinecone.service.ts`

### Record Structure

Every chunk becomes exactly one Pinecone record with 3 fields:

```
{
  id:       "b45c9245:src/auth.ts:3"   ← globally unique
  values:   [-0.048, 0.021, ...]       ← 384-dim vector
  metadata: { all AST fields... }      ← everything from Section 7
}
```

### Namespaces — Repository Isolation

Every repository gets its own **namespace** equal to its `repoId` UUID.

- Querying namespace `abc` **never touches** data from namespace `xyz`
- Multiple repos can live in the same Pinecone index
- Deleting a repo = just deleting its namespace

### Two Types of Pinecone Queries

**Type 1: Vector Similarity Search** — "find code similar to this question"
```typescript
await index.query({
  vector: queryEmbedding,   // the user's question as a 384-dim vector
  topK: 10,                 // return the 10 most similar chunks
  includeMetadata: true,
  namespace: repoId
});
```

**Type 2: Metadata Filter Search** — "fetch these specific chunks by name"
```typescript
await index.query({
  vector: new Array(384).fill(0.0001),  // dummy vector — we don't care about similarity
  topK: symbols.length * 2,
  includeMetadata: true,
  filter: { symbolName: { $in: ["loginUser", "AuthService", "findUserByEmail"] } },
  namespace: repoId
});
```

Type 2 is the **"hop"** in Multi-Hop Retrieval — it fetches dependency chunks by exact name without re-embedding anything.

*Why a dummy vector?* Pinecone's API always requires a vector. Since we only care about the metadata filter here, we pass a tiny non-zero value and completely ignore the similarity scores.

### Similarity Threshold

After vector search, results below `0.65` cosine similarity are discarded:
```typescript
const relevant = matches.filter(m => m.score > 0.65);
```
This prevents low-quality, tangentially related chunks from polluting the AI's context and causing bad answers.

---

## 10. The 4 Query Modes — How Each Works

Every query first checks that the namespace (repo) exists in Pinecone. If not → 404 immediately.

---

### Mode 1: `chat` — Natural Language Q&A

**When to use:** "How does task rendering work?", "What does AuthService do?"

**Full flow:**
```
User question
    ↓
embedQuery(question) → 384-dim vector
    ↓
Pinecone vector search → top 10 most similar chunks
    ↓
Filter: keep only score > 0.65
    ↓
Format context:
  FILE: script.js | TYPE: function | SYMBOL: renderTask | LINES: 27-38
  CODE: function renderTask(task) { ... }
    ↓
Send to Groq LLM with chat system prompt
    ↓
Return: { answer: "...", sources: [...] }
```

**System prompt strategy:** Two-tier answer — plain English summary first, then technical deep-dive with file names, function names, and code snippets.

---

### Mode 2: `overview` — Architecture Report

**When to use:** "Give me an overview of this repo"

**Full flow:**
```
User question
    ↓
Load data/summaries/{namespace}.json from disk
    ↓
Send JSON directly to Groq LLM (NO Pinecone query at all)
    ↓
LLM generates: Purpose, Technologies, Features, Architecture, Pages, Components, API Routes
    ↓
Return: { answer: "## Repository Overview...", sources: [] }
```

**Why skip vector search?** For a global overview you need the *complete picture* — not just the 10 most similar fragments. The summary JSON is under 2KB and captures the entire project structure. Vector search would give an incomplete, biased view.

---

### Mode 3: `flow` — Execution Trace

**When to use:** "How does image compression work?", "Trace the login flow"

**Full flow:**
```
User question
    ↓
embedQuery(question) → vector
    ↓
Pinecone vector search → top 3 entry points (tighter than chat's 10)
    ↓
Filter: score > 0.65
    ↓
── MULTI-HOP (unique to flow/diagram) ──
Read functionCalls + componentDependencies from each entry chunk's metadata
    ↓
Pinecone metadata filter: { symbolName: { $in: ["dependency1", "dependency2", ...] } }
    ↓
Merge entry chunks + dependency chunks, deduplicate
    ↓
Build rich context (includes CALLS, DEPS, HOOKS, API CALLS)
    ↓
Send to Groq with flow system prompt
    ↓
Return: arrow diagram + step-by-step explanation
```

---

### Mode 4: `diagram` — Mermaid Architecture Diagram

**When to use:** "Show me a diagram of the compression feature"

**Retrieval:** Identical to `flow` mode — same multi-hop algorithm.

**Only difference:** The system prompt tells the LLM to output a `mermaid` code block instead of a text explanation.

**Example LLM output:**
````
```mermaid
graph TD
  A[ImageCompressor] --> B[handleCompress]
  B --> C[attemptCompress]
  C --> D[POST /api/image-compress]
  A --> E[ImageUpload]
  A --> F[ProcessingResult]
```
````

The frontend detects the ` ```mermaid ``` ` block and renders it as an interactive SVG using Mermaid.js.

---

## 11. Multi-Hop Retrieval — The Core Innovation

**File:** `src/retrieval/retrieval.service.ts`

This is the most important algorithmic innovation in CodeAtlas.

### The Problem It Solves

```
User asks: "How does the compression API work?"

Standard RAG top-3 results:
  1. ImageCompressor component     (score: 0.89)  ✅
  2. ProcessingResult component    (score: 0.71)  ✅
  3. Some unrelated utility        (score: 0.66)  ❌

MISSING from results: attemptCompress(), handleCompress(), /api/image-compress route
→ AI hallucinates the missing logic  ❌
```

### With Multi-Hop

```
Step 1: Entry points from vector search → [ImageCompressor, ProcessingResult]

Step 2: Read their metadata:
  ImageCompressor.functionCalls  = ["handleCompress", "attemptCompress"]
  ImageCompressor.componentDeps  = ["ImageUpload"]
  ImageCompressor.apiCalls       = ["/api/image-compress"]

Step 3: Fetch those exact chunks via metadata filter:
  { symbolName: { $in: ["handleCompress", "attemptCompress", "ImageUpload"] } }
  → Returns exact chunks — no vector similarity needed

Step 4: Merge + deduplicate
  Final context = ImageCompressor + ProcessingResult + handleCompress + attemptCompress + ImageUpload

Step 5: AI now has the COMPLETE execution graph → accurate, hallucination-free answer ✅
```

### The Full Algorithm

```
STEP 1 → Vector search → top 3 entry points (score > 0.65)
STEP 2 → Read functionCalls + componentDependencies from each entry chunk
STEP 3 → Collect all dependency names into a Set (avoid duplicates)
STEP 4 → Pinecone metadata filter query with dummy vector
STEP 5 → Merge entry chunks + hop chunks → deduplicate by chunk ID
STEP 6 → Build structured context string with all metadata fields
STEP 7 → Send to LLM
```

### Why This is Better Than Standard RAG

| Standard RAG | Multi-Hop RAG |
|---|---|
| One vector search, one pass | Vector search + graph traversal via metadata |
| Misses dependencies not in top-K | Explicitly fetches all dependencies |
| Hallucinates missing context | Complete graph = no hallucination |
| O(K) context | O(K + dependencies) context |

---

## 12. LangChain — Used Selectively, Not as a Religion

**File:** `src/ai/ai.service.ts`

This section is important because it shows *thoughtful* architectural decision-making — something interviewers love.

### Where LangChain IS Used

```typescript
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.1,
});

const response = await model.invoke([
  new SystemMessage(systemPrompt),
  new HumanMessage(userQuery),
]);
```

LangChain is used **only for LLM invocation** with Groq.

**Why it's worth it here:**
1. `ChatGroq` is a typed, maintained client with built-in error handling
2. `SystemMessage` + `HumanMessage` abstractions are cleaner than raw `{role, content}` objects
3. To switch from Groq to OpenAI later → just change `ChatGroq` to `ChatOpenAI`. Everything else stays the same.

---

### Where LangChain is NOT Used — And Why

#### HuggingFace Embeddings → Direct SDK, not LangChain

```typescript
// What we do (direct SDK):
import { HfInference } from "@huggingface/inference";
const result = await hfClient.featureExtraction({ model, inputs: texts }); // texts is an ARRAY

// What we DON'T do (LangChain wrapper):
import { HuggingFaceInferenceEmbeddings } from "@langchain/community";
// → This calls the API ONE text at a time. No batch support.
// → 300 chunks × 700ms = 3.5 minutes
// → Our approach: 300 chunks in ~23 seconds (8× faster)
```

#### Pinecone → Direct SDK, not LangChain

```typescript
// What we do (direct SDK):
await index.query({
  vector, topK, includeMetadata: true,
  filter: { symbolName: { $in: [...] } }   // ← multi-hop requires this
});

// What we DON'T do (LangChain PineconeStore):
// → LangChain abstracts away metadata control
// → The $in metadata filter for multi-hop is IMPOSSIBLE through LangChain's wrapper
// → The entire multi-hop algorithm would break
```

#### Text Splitting → Custom AST Chunker, not LangChain

LangChain's `RecursiveCharacterTextSplitter` splits code by character count. As shown in Section 4, this destroys function bodies and loses all relationships. Our AST chunker produces semantically complete chunks with full metadata.

### Summary Table

| Operation | What We Use | Why Not LangChain |
|---|---|---|
| LLM invocation (Groq) | `@langchain/groq` ChatGroq | ✅ LangChain IS used here |
| HuggingFace embeddings | Direct `@huggingface/inference` SDK | LangChain wrapper: no batch → 8× slower |
| Pinecone upsert | Direct `@pinecone-database/pinecone` | Need full metadata control |
| Pinecone search | Direct Pinecone SDK | Need `$in` filter for multi-hop |
| Text splitting | Custom AST chunker (`ts-morph`) | LangChain splitters destroy code structure |

**The principle:** Use LangChain where it adds value. Bypass it where it adds constraints.

---

## 13. LLM Prompt Engineering

**File:** `src/ai/ai.service.ts`

The AI receives two things:
1. **SystemMessage** — tells it its role and what format to respond in
2. **HumanMessage** — the user's actual question + the retrieved code context

`temperature: 0.1` — near-zero randomness. For code analysis we want deterministic, factual answers, not creative ones.

### System Prompts Per Mode

**chat mode:**
```
You are an expert AI software architect and codebase assistant.
Answer ONLY using the repository context provided below.
Structure your response:
  1. 🎯 High-Level Summary (plain English, non-technical)
  2. 🛠️ Technical Deep Dive (file names, functions, code flow, snippets)
```

**overview mode:**
```
You are an expert software architect.
Generate a comprehensive repository overview from the JSON metadata.
Include: Purpose, Technologies, Major Features, Architecture,
Pages, Components, API Routes.
```

**flow mode:**
```
You are an expert software architect and flow tracer.
Structure your response:
  1. 🗺️ Flow Diagram: visual arrow map (LoginPage ↓ handleLogin() ↓ AuthService.login())
  2. 📖 Step-by-Step: files, functions, and data at each step
```

**diagram mode:**
```
You are an expert software architect.
  1. One sentence describing what the diagram shows
  2. A valid mermaid flowchart code block showing dependencies,
     function calls, API calls, and component hierarchy
```

### Why Mode-Specific Prompts?

One generic prompt produces generic output. Targeted prompts produce:
- `chat` → structured two-tier explanation
- `overview` → full architectural report
- `flow` → visual arrow diagram + numbered steps
- `diagram` → syntactically valid, renderable Mermaid code

---

## 14. Frontend Architecture

### State Management (Zustand)

**File:** `src/store/use-app-store.ts`

**Why Zustand over Redux?**
- No Provider wrapper needed — just `import { useAppStore } from './store'` anywhere
- No reducers, no actions, no dispatch boilerplate
- Works exactly like a regular React hook

**Store shape:**
```typescript
interface AppState {
  // Repository
  activeRepo: IndexedRepository | null;   // full /analyze response
  repoSummary: RepoSummary | null;        // from /summary — feeds React Flow canvas
  isIndexing: boolean;

  // Chat
  messages: ChatMessage[];                // full conversation history
  isStreaming: boolean;
  activeMode: "chat" | "overview" | "flow" | "diagram";

  // UI
  isSidebarOpen: boolean;
  activeView: "chat" | "canvas";          // toggle between chat and React Flow
}
```

**Persistence:** Using Zustand's `persist` middleware, `activeRepo` (with its namespace) is saved to `localStorage`. When the user refreshes, their repo is still connected — they don't have to re-index.

Only `activeRepo` is persisted. `messages` and UI state reset on refresh (intentional — chat history shouldn't persist).

### How a Chat Message Flows

```typescript
// 1. User sends a message
addMessage({ role: "user", content: query, mode: activeMode });
setStreaming(true);

// 2. API call
const { data } = await api.chat(activeRepo.namespace, query, activeMode);

// 3. AI response added
addMessage({ role: "assistant", content: data.data.answer, mode: data.data.mode });
setStreaming(false);
```

Each message has: `id` (UUID), `role`, `content`, `mode`, `timestamp`. The `mode` field on each message tells the renderer how to display it.

### Rendering Each Mode

**File:** `src/components/chat/ChatMessage.tsx`

All 4 modes return markdown. The renderer uses `react-markdown` with a custom `code` component that intercepts special blocks:

```tsx
<ReactMarkdown
  components={{
    code({ className, children }) {
      const language = /language-(\w+)/.exec(className)?.[1];

      if (language === "mermaid") {
        return <MermaidRenderer chart={String(children)} />;  // renders SVG
      }

      return (
        <SyntaxHighlighter style={oneDark} language={language}>
          {String(children)}
        </SyntaxHighlighter>
      );  // syntax-highlighted code block
    },
  }}
>
  {message.content}
</ReactMarkdown>
```

| Mode | How It Looks |
|---|---|
| `chat` | Standard markdown — headers, bullets, syntax-highlighted code blocks |
| `overview` | Wide full-width markdown report (no max-width cap) |
| `flow` | Markdown with ↓ arrows — LLM formats naturally, no special handling |
| `diagram` | MermaidRenderer intercepts ` ```mermaid ``` ` and renders SVG inline |

### MermaidRenderer Component

```tsx
mermaid.initialize({ startOnLoad: false, theme: "dark" });

useEffect(() => {
  mermaid
    .render(`mermaid-${uniqueId}`, chart)
    .then(({ svg }) => {
      containerRef.current.innerHTML = svg;  // inject the SVG directly into DOM
    })
    .catch(() => {
      containerRef.current.innerHTML = `<pre>${chart}</pre>`;  // fallback: show raw text
    });
}, [chart]);
```

`"use client"` directive is required — Mermaid uses browser DOM APIs and cannot run server-side in Next.js.

### React Flow Canvas (Architecture View)

When `activeView === "canvas"`, the `repoSummary` JSON is mapped into React Flow nodes arranged in columns:

```
Pages       → column x=0      → yellow-green border
Components  → column x=300    → amber border
Hooks       → column x=600    → muted amber border
Services    → column x=900    → cream border
API Routes  → column x=1200   → yellow-green border
```

Each category gets its own vertical column. Nodes are stacked vertically within each column (`y = index × 80`). This prevents all nodes from spawning at (0,0) and overlapping.

---

## 15. Backend Folder Structure Explained

```
backend/src/
│
├── ai/
│   └── ai.service.ts              ← LangChain ChatGroq + all 4 system prompts
│
├── controllers/
│   ├── chat.controller.ts         ← validate → call service → return response
│   ├── indexing.controller.ts     ← validate → call indexing service
│   └── repository.controller.ts
│
├── indexing/
│   ├── chunker/
│   │   └── code-chunker.ts        ← THE HEART: ts-morph AST parsing + metadata
│   ├── embeddings/
│   │   └── embedding.service.ts   ← HuggingFace batching + worker pool + retries
│   └── scanner/
│       └── repository-scanner.ts  ← recursive file walker + filters
│
├── middlewares/
│   └── error-handler.ts           ← catches ApiError + Zod errors → clean JSON
│
├── retrieval/
│   └── retrieval.service.ts       ← multi-hop algorithm (entry + hop query)
│
├── routes/
│   ├── chat.routes.ts             ← POST /api/v1/repos/:namespace/chat
│   ├── indexing.routes.ts         ← POST /api/v1/repos/analyze
│   └── repository.routes.ts       ← GET  /api/v1/repos/:namespace/summary
│
├── services/
│   ├── chat.service.ts            ← orchestrates: validate → retrieve → generate
│   ├── indexing.service.ts        ← orchestrates: scan → chunk → embed → upsert → summary
│   ├── repository.service.ts      ← git clone, metadata, cleanup
│   └── summary.service.ts         ← read/write summary.json
│
├── types/
│   └── index.ts                   ← all TypeScript interfaces
│
├── utils/
│   ├── api-error.ts               ← custom Error class with statusCode field
│   ├── api-response.ts            ← standardized { statusCode, message, data } wrapper
│   ├── async-handler.ts           ← wraps async controllers to catch thrown errors
│   └── file-utils.ts              ← IGNORED_DIRS, IGNORED_FILES, SUPPORTED_EXTENSIONS
│
├── validators/
│   ├── chat.validator.ts          ← Zod: query (string), mode (enum of 4 values)
│   └── repository.validator.ts    ← Zod: repoUrl (valid URL format)
│
└── vectorstore/
    └── pinecone.service.ts        ← upsert, vector search, metadata filter, namespace check
```

### Request Lifecycle

```
HTTP Request
  → app.ts (Express + CORS middleware)
  → routes/ (route matching)
  → validators/ (Zod parse → throws 400 if input is invalid)
  → controllers/ (extract params, call service)
  → services/ (business logic orchestration)
  → retrieval/ + ai/ + vectorstore/ (data layer)
  → ApiResponse wrapper → clean JSON response
  → errorHandler middleware (if anything throws anywhere)
```

---

## 16. Key Design Decisions & Trade-offs

### 1. AST vs LangChain Text Splitters

**Decision:** Use ts-morph AST instead of `RecursiveCharacterTextSplitter`

**Trade-off:**
- AST is more complex to implement (significant chunk of the codebase is just chunking logic)
- But produces semantically complete chunks with relationship metadata
- For a codebase assistant, this is **non-negotiable** — character-based splitting makes the entire project useless for flow tracing

---

### 2. HuggingFace vs OpenAI Embeddings

**Decision:** `BAAI/bge-small-en-v1.5` (384-dim, free) over OpenAI `text-embedding-3-small` (1536-dim, paid)

**Trade-off:**
- Lower dimensions = slightly less precision in theory
- But for code retrieval tasks, 384-dim BGE performs comparably
- Saves ~$X per indexing session depending on repo size
- Smaller dimensions = faster Pinecone queries and cheaper storage

---

### 3. Pinecone vs ChromaDB vs Weaviate

**Decision:** Pinecone Serverless

**Trade-off:**
- Pinecone has a usage cost at scale
- But: no infrastructure to manage, auto-scales, supports `$in` metadata filters (critical for multi-hop), namespace isolation per repo
- ChromaDB requires running a server. Weaviate has heavy configuration overhead.

---

### 4. Groq vs OpenAI GPT-4

**Decision:** Groq + Llama-3.3-70b

**Trade-off:**
- GPT-4 may have marginally better reasoning on complex tasks
- But Groq generates tokens **10–20× faster** (custom LPU hardware)
- Users wait for responses in real-time — speed matters enormously for UX
- Free tier covers all development usage

---

### 5. Metadata in Pinecone vs Separate Database

**Decision:** Store all AST metadata *inside* Pinecone records, no separate PostgreSQL/MongoDB

**Trade-off:**
- Less flexibility for complex relational queries across all repos
- But: one Pinecone call returns both the vector match AND all metadata atomically
- `$in` filter on `symbolName` gives graph-like lookups within a vector database
- Eliminating a second database halves infrastructure complexity for this project

---

### 6. Summary JSON on Disk vs Pinecone for Overview

**Decision:** Save `summary.json` to disk, bypass Pinecone for overview mode

**Trade-off:**
- Requires disk storage (trivial — each file is < 2KB)
- But overview needs the *complete* project picture, not top-K fragments
- Reading a JSON file takes milliseconds vs a Pinecone round-trip
- Vector search would give incomplete, biased results for "what is this entire repo?"

---

### 7. Worker Pool vs Promise.all

**Decision:** Concurrency-limited worker pool for all I/O-heavy operations

**Trade-off:**
- Worker pool is more complex to implement than `Promise.all(batches.map(...))`
- But `Promise.all` on 100+ requests = HTTP 429 immediately from both HuggingFace and Pinecone
- Worker pool = steady throughput, zero rate limit hits
- Same pattern applied to: file reading (10 concurrent), embeddings (3 concurrent), Pinecone upserts (5 concurrent)

---

## 17. Interview & Placement Talking Points

These are the 7 key things to say — with the exact framing that lands well in system design and engineering interviews.

---

### 1. "I chose AST parsing over LangChain's text splitters — here's why that matters"

Code is a structural graph, not a document. A 500-character split might cut `if (user.isAuth) {` from its closing `}` — the chunk becomes meaningless. AST gives us semantically complete chunks with exact start/end lines, typed node information, and relationship extraction. This is the foundation that makes everything else possible.

---

### 2. "I built a multi-hop retrieval system to solve RAG hallucination"

Standard RAG misses dependencies that don't rank in the top-K vector results. I store `functionCalls` and `componentDependencies` as Pinecone metadata at index time. At query time, after the initial vector search, I do a second Pinecone query using a metadata `$in` filter to fetch exact dependency chunks by `symbolName`. The LLM then receives a complete execution graph instead of partial context, which eliminates the hallucination problem entirely.

---

### 3. "I separated embedding from generation deliberately"

Embeddings use a small retrieval-optimized model (BGE 384-dim, free). The LLM is a large generative model (Llama-3.3-70b on Groq). By separating them I can optimize each independently — swap embedding models without touching LLM code, tune LLM prompts without affecting the embedding pipeline. This is a key separation of concerns.

---

### 4. "I used LangChain selectively, not as a framework"

This is important: I use LangChain *only* for the Groq LLM client (`ChatGroq`) where it adds value through clean abstractions. I bypass it for HuggingFace embeddings (LangChain wrapper has no batch support — 8× slower) and Pinecone (LangChain's vector store abstraction doesn't expose the `$in` metadata filter needed for multi-hop). The entire multi-hop algorithm would be impossible through LangChain's Pinecone wrapper.

---

### 5. "I designed 4 distinct retrieval strategies for 4 query types"

A single retrieval strategy doesn't fit all queries. Overview needs the complete summary JSON (vector search would give incomplete results). Chat needs broad top-10 similarity. Flow and diagram need tight top-3 plus multi-hop graph traversal. Matching the retrieval strategy to the query type is what makes answers accurate.

---

### 6. "I used a worker pool pattern for all I/O-heavy operations"

Naive `Promise.all` on 300 embedding requests triggers rate limits immediately. A worker pool with N concurrent workers maintains steady throughput without ever hitting rate limits. I applied this pattern consistently: file reading (10 concurrent workers), HuggingFace embeddings (3), and Pinecone upserts (5). The concurrency number is tuned to each API's rate limit.

---

### 7. "I store the dependency graph as Pinecone metadata — no second database needed"

This gives us graph-like lookups inside a vector database. A single Pinecone query returns both the semantic vector match AND the full relationship metadata atomically. The `$in` filter on `symbolName` acts like a graph adjacency list lookup. This hybrid approach — semantic search + graph traversal in one system — eliminates the need for PostgreSQL or any relational database.

---

### 8. "The deployment is fully serverless — frontend on Vercel, backend on Railway"

The frontend is a static Next.js app deployed to Vercel's CDN — global edge network, zero config. The backend is a Node.js Express server on Railway — auto-deploys from GitHub on every push, environment variables managed through Railway's dashboard. All external dependencies (Pinecone, Groq, HuggingFace) are third-party managed services. There is no server to maintain, no infrastructure to monitor.

---

### 9. "I know the current bottlenecks and exactly how I'd fix them at scale"

The current single Pinecone index works for a prototype but becomes a bottleneck when thousands of repos are indexed. The fix is index-per-tenant sharding. The bigger bottleneck is repeated vector searches for the same query — Redis caching with a query hash as key eliminates redundant Pinecone round-trips. The indexing endpoint is currently synchronous (user waits) — at scale this becomes a background job queue (BullMQ + Redis) with a status polling endpoint. These talking points distinguish a developer who truly understands their own system.

---

## 18. Deployment Architecture

### The Stack at a Glance

```
User's Browser
      ↓  HTTPS
Frontend (Vercel)
      ↓  HTTPS REST API calls
Backend (Railway)
      ↓              ↓              ↓
  Pinecone         Groq         HuggingFace
(vector DB)     (LLM API)    (embedding API)
```

Every layer is a **managed service** — there are no servers to configure, patch, or monitor. The entire system auto-scales without any manual intervention.

---

### Frontend — Vercel

**What gets deployed:** The Next.js 16 App Router application.

**Why Vercel:**
- Built by the same team that built Next.js — zero-config deployment. `git push` and it's live.
- Automatic **CDN distribution** — the frontend is served from edge nodes closest to the user, not from a single server
- **Preview deployments** — every pull request gets its own live URL for testing before merging
- **Environment variables** managed through the Vercel dashboard (the backend URL, for example)

**What Vercel does NOT handle:** Any server-side logic. The backend lives on Railway.

**Environment variable on Vercel:**
```
NEXT_PUBLIC_API_URL=https://codeatlas-backend.railway.app
```

---

### Backend — Railway

**What gets deployed:** The Node.js + Express server.

**Why Railway:**
- Deploys directly from a GitHub repository — push to `main` → Railway auto-builds and restarts the server
- Provides a **persistent file system** (needed for `data/summaries/*.json` files)
- Supports environment variables through its dashboard
- Gives a public HTTPS URL automatically (no manual SSL certificate setup)
- Free tier is sufficient for prototyping and demos

**Environment variables on Railway:**
```
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
GROQ_API_KEY=...
HUGGINGFACE_API_KEY=...
PORT=3001
CORS_ORIGIN=https://your-app.vercel.app
```

**CORS configuration — important:**
The backend must allow requests from the Vercel frontend domain. In `app.ts`:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,   // "https://your-app.vercel.app"
  methods: ["GET", "POST"],
  credentials: true
}));
```
Without this, the browser blocks all API responses.

---

### Pinecone — Serverless Vector Database

**No deployment needed.** Pinecone is fully managed. You create an index on the Pinecone console, get an API key, and that's it.

**Key configuration:**
```
Index name: codeatlas-index
Dimensions: 384          ← must match BAAI/bge-small-en-v1.5 output
Metric: cosine           ← for similarity search
Environment: serverless  ← no pods to manage, pay-per-query
```

**Data isolation:** Each repository gets its own **namespace** (`repoId` UUID) inside the same index. No data from one repo ever appears in another repo's queries.

---

### Groq — LLM Inference

**No deployment needed.** Groq's API is called from the backend using an API key.

**Why Groq specifically:** Groq runs on custom **LPU (Language Processing Unit)** hardware — purpose-built for transformer inference. The same `llama-3.3-70b` model that takes 10 seconds on a CPU cluster generates responses in under 1 second on Groq's LPU. For a chat interface where users wait in real-time, this speed difference is the difference between a good UX and a frustrating one.

**API call pattern from the backend:**
```
Backend → POST https://api.groq.com/openai/v1/chat/completions
       → { model, messages: [system, human], temperature: 0.1 }
       → Response in ~800ms
```

---

### HuggingFace — Embedding API

**No deployment needed.** Called from the backend using an API key.

**When it's called:** Only during **indexing** (batch embedding all chunks) and at **query time** (embedding the user's question). It is never called from the frontend.

**Latency:** ~600–900ms per batch of 32 texts. The worker pool (3 concurrent) keeps total indexing time under 30 seconds for most repos.

---

### Full Request Flow in Production

**Indexing a new repo:**
```
1. User submits GitHub URL → Vercel frontend
2. Vercel frontend → POST https://railway-backend/api/v1/repos/analyze
3. Railway backend → GitHub (simple-git shallow clone)
4. Railway backend → HuggingFace API (batch embeddings)
5. Railway backend → Pinecone (upsert all vectors + metadata)
6. Railway backend → writes summary.json to Railway disk
7. Railway backend → deletes cloned repo folder
8. Railway backend → response to Vercel frontend
```

**Querying (chat/flow/diagram):**
```
1. User types question → Vercel frontend
2. Vercel frontend → POST https://railway-backend/api/v1/repos/{namespace}/chat
3. Railway backend → HuggingFace API (embed the single query)
4. Railway backend → Pinecone (vector search + optional metadata hop)
5. Railway backend → Groq API (send context + query → get answer)
6. Railway backend → response to Vercel frontend
7. Vercel frontend renders the markdown/mermaid response
```

---

### Common Interview Questions on Deployment

**Q: "What happens if Railway goes down?"**
> All queries fail. This is a single point of failure in the current architecture. The fix is deploying to multiple Railway regions or migrating to a platform that supports multi-region like Fly.io or AWS with load balancing.

**Q: "How do you handle secrets securely?"**
> All API keys live in Railway's environment variable store (backend) and Vercel's environment variable store (frontend). They are never committed to the Git repository. The `.env` file is in `.gitignore`. The frontend only has `NEXT_PUBLIC_API_URL` — no secret keys are ever sent to the browser.

**Q: "How does the frontend know which backend to talk to?"**
> Through `NEXT_PUBLIC_API_URL` environment variable set on Vercel. In development this points to `localhost:3001`. In production it points to the Railway URL. Axios uses this as the base URL for all requests.

**Q: "Is the backend stateless?"**
> Almost. The backend writes `summary.json` files to disk (Railway's filesystem). This means the backend is NOT fully stateless — restarting the Railway instance could lose those files. The proper fix is storing summaries in an S3 bucket or as Pinecone metadata instead of local disk.

---

## 19. Scalability — Current State & Future Improvements

Understanding where your system *cannot* scale — and knowing the solutions — is one of the most impressive things you can demonstrate in a placement interview. Here is an honest breakdown.

---

### Overview Table

| Component | Current State | Bottleneck | Future Solution |
|---|---|---|---|
| Pinecone | Single index, namespace-per-repo | All repos in one index → metadata pollution risk at scale | Multiple indexes (shard by tenant/region) |
| Query caching | None — every query hits Pinecone + Groq | Repeated identical queries cost time and money | Redis cache with query hash as key |
| Backend | Single Railway instance | One instance can't handle thousands of concurrent indexing requests | Horizontal scaling + load balancer |
| Indexing | Synchronous (user waits) | Large repos can take 2–5 minutes | Background job queue (BullMQ + Redis) |
| Embeddings | HuggingFace free tier | Rate-limited at ~5 requests/sec | Upgrade to HuggingFace Inference Endpoints or self-hosted model |
| Summary storage | JSON files on Railway disk | Disk is ephemeral — lost on redeploy | AWS S3 or Supabase storage |
| LLM | Single Groq endpoint | Groq free tier has token-per-minute limits | Fallback to OpenAI or Anthropic if rate-limited |

---

### 1. Pinecone: Single Index → Multiple Indexes

**Current:**
```
One Pinecone index: "codeatlas-index"
├── namespace: repo-uuid-1  (User A's repo)
├── namespace: repo-uuid-2  (User B's repo)
└── namespace: repo-uuid-3  (User C's repo)
```

**Problem at scale:** One index with 10,000 namespaces and 50 million vectors starts having performance degradation. Pinecone recommends keeping indexes under ~10M vectors for optimal performance.

**Future — Index sharding:**
```
codeatlas-index-us  → all repos from US users
codeatlas-index-eu  → all repos from EU users
codeatlas-index-asia → all repos from Asia
```
Or shard by user ID range. The backend routes queries to the correct index based on `repoId` prefix.

```typescript
// Future routing logic
function getIndexForRepo(repoId: string): PineconeIndex {
  const shard = hash(repoId) % NUMBER_OF_SHARDS;
  return pineconeIndexes[shard];
}
```

---

### 2. Query Caching with Redis

**Current:**
```
User asks: "How does login work?"
→ embed query (700ms)
→ Pinecone search (200ms)
→ Groq LLM (800ms)
Total: ~1700ms

Same user asks the exact same question 10 seconds later:
→ embed again (700ms)
→ Pinecone search again (200ms)
→ Groq LLM again (800ms)
Total: ~1700ms  ← complete waste
```

**Future — Redis cache:**
```
User asks: "How does login work?"
Cache key = hash(namespace + query + mode)

CACHE HIT:
→ check Redis (5ms)
→ return cached answer
Total: ~5ms  ← 340× faster

CACHE MISS:
→ embed + Pinecone + Groq (1700ms)
→ store result in Redis with TTL = 1 hour
→ return answer
Total: ~1705ms (same as today, but cached for next time)
```

**Implementation:**
```typescript
async function getCachedOrFetch(namespace: string, query: string, mode: string) {
  const cacheKey = `query:${namespace}:${mode}:${hashQuery(query)}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await fetchFromPineconeAndGroq(namespace, query, mode);

  await redis.setex(cacheKey, 3600, JSON.stringify(result));  // TTL: 1 hour
  return result;
}
```

**What to cache:** Query results (answer + sources). **What NOT to cache:** Embeddings (cheap to recompute), indexing data (changes per repo).

---

### 3. Horizontal Scaling — Single Backend → Multiple Instances

**Current:**
```
All traffic → Railway (1 instance)
```

**Problem:** If 100 users index large repos simultaneously, they're all queued on one server. Indexing is CPU/memory/network intensive (cloning, parsing AST, calling HuggingFace 10× per repo).

**Future — Load balanced horizontal scaling:**
```
Traffic
   ↓
Load Balancer (Railway multiple instances / AWS ALB)
   ↓          ↓          ↓
Instance 1  Instance 2  Instance 3
   ↓          ↓          ↓
Shared: Pinecone, Groq, HuggingFace, Redis, S3
```

**Critical requirement for horizontal scaling:** The backend must become **fully stateless**. Right now it writes `summary.json` to local disk — that file only exists on Instance 1. If Instance 2 handles the next query, it won't find the file.

**Fix:** Move summary storage from local disk to a shared store:
```typescript
// Current (breaks horizontal scaling):
fs.writeFileSync(`data/summaries/${namespace}.json`, JSON.stringify(summary));

// Future (works with any number of instances):
await s3.putObject({ Bucket: "codeatlas-summaries", Key: `${namespace}.json`, Body: summary });
// or
await redis.set(`summary:${namespace}`, JSON.stringify(summary));
```

---

### 4. Async Indexing — Synchronous → Job Queue

**Current:**
```
User submits repo URL
   ↓
POST /api/v1/repos/analyze
   ↓  (user's browser waits here for 30–120 seconds)
clone → scan → chunk → embed → upsert → summary
   ↓
Response: { status: "done", repoId: "..." }
```

**Problems:**
- Large repos take 2–5 minutes → connection timeout risk (Railway has 30s default timeout)
- If the server restarts mid-indexing, everything is lost and the user gets no feedback
- Can't handle 100 concurrent indexing requests synchronously

**Future — Background job queue:**
```
User submits repo URL
   ↓
POST /api/v1/repos/analyze
   ↓  (returns immediately in <100ms)
Response: { jobId: "job-uuid-123", status: "queued" }

[Background worker]
Job queue (BullMQ + Redis)
   ↓
Worker pulls job → clone → chunk → embed → upsert → summary
   ↓
Updates job status: queued → processing → done / failed

[Frontend polls]
GET /api/v1/jobs/job-uuid-123/status
→ { status: "processing", progress: "65%", stage: "embedding" }
→ { status: "done", repoId: "..." }
```

**Technology:** BullMQ (Node.js job queue library) + Redis (stores job state). Workers can run on separate Railway instances from the API server.

---

### 5. Rate Limiting — Protect External APIs and Backend

**Current:** No rate limiting. A single user could spam 100 indexing requests, exhaust the HuggingFace free tier, and crash the service for everyone.

**Future:**
```typescript
import rateLimit from "express-rate-limit";

// Per-IP rate limits
const indexingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 5,                      // max 5 repo indexing requests per IP per hour
  message: "Too many indexing requests. Try again in an hour."
});

const queryLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 30,                     // 30 queries per minute per IP
});

app.post("/api/v1/repos/analyze", indexingLimiter, ...);
app.post("/api/v1/repos/:ns/chat", queryLimiter, ...);
```

---

### Scalability Summary

```
TODAY (Prototype)                    PRODUCTION-READY FUTURE
─────────────────                    ──────────────────────────────────────
Single Pinecone index          →     Sharded indexes by region/tenant
No caching                     →     Redis cache (query hash → answer)
Single Railway instance        →     Horizontal scaling behind load balancer
Synchronous indexing           →     BullMQ async job queue + progress polling
Local disk for summary.json    →     S3 / Redis for shared storage
No rate limiting               →     Per-IP limits on indexing + query endpoints
HuggingFace free tier          →     Self-hosted embedding model (reduced latency)
```

**Interview framing:** *"The current architecture is deliberately simple — right for a prototype and demo. I know exactly where the bottlenecks are and what the migration path looks like. Caching and async indexing are the two changes that would have the biggest immediate impact."*

---

*End of Guide*
