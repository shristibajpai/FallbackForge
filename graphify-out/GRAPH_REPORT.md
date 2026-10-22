# Graph Report - fallbackforge  (2026-10-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 195 nodes · 321 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.99)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- main.py
- App.tsx
- package.json
- types.ts
- compilerOptions
- api.ts
- dependencies
- devDependencies
- API Recovery & Resilience Skill
- Recovery recommendation workflow
- Graphify repository navigation instructions

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `App()` - 12 edges
3. `react` - 10 edges
4. `ScreenId` - 9 edges
5. `create_recovery_plan()` - 9 edges
6. `lucide-react` - 9 edges
7. `OllamaConfigurationError` - 7 edges
8. `OllamaRequestError` - 7 edges
9. `_request_chat()` - 7 edges
10. `simulate_recovery()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `create_recovery_plan()` --uses--> `OllamaConfigurationError`  [INFERRED]
  Backend/main.py → Backend/ollama_client.py
- `ollama_test()` --uses--> `OllamaConfigurationError`  [INFERRED]
  Backend/main.py → Backend/ollama_client.py
- `create_recovery_plan()` --uses--> `OllamaRequestError`  [INFERRED]
  Backend/main.py → Backend/ollama_client.py
- `ollama_test()` --uses--> `OllamaRequestError`  [INFERRED]
  Backend/main.py → Backend/ollama_client.py
- `HistoryScreenProps` --references--> `HistoryRecord`  [EXTRACTED]
  FallbackForge/src/components/screens/HistoryScreen.tsx → FallbackForge/src/types.ts

## Import Cycles
- None detected.

## Communities (13 total, 2 thin omitted)

### Community 0 - "main.py"
Cohesion: 0.10
Nodes (15): create_recovery_plan(), health(), load_skill(), ollama_status(), ollama_test(), RecoveryRequest, RecoveryResponse, root() (+7 more)

### Community 1 - "App.tsx"
Cohesion: 0.13
Nodes (24): API_FAILURE_TYPES, API_FALLBACK_STRATEGIES, App(), DEFAULT_CONFIG, HistoryScreen(), HistoryScreenProps, OverviewScreen(), OverviewScreenProps (+16 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (26): name, private, scripts, build, clean, dev, lint, preview (+18 more)

### Community 3 - "types.ts"
Cohesion: 0.14
Nodes (19): RecoveryPlanResponse, FAILURE_TYPES, FALLBACK_STRATEGIES, PlannerScreenProps, DEFAULT_STAGES, ScenarioType, SimulatorScreenProps, SkillsScreenProps (+11 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+9 more)

### Community 5 - "api.ts"
Cohesion: 0.21
Nodes (15): ApiFailureType, ApiFallbackStrategy, fetchBackend(), generateRecoveryPlan(), getOllamaStatus(), isRecoveryPlanResponse(), OllamaStatus, OllamaTestResult (+7 more)

### Community 6 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, dotenv, express, @google/genai, lucide-react, motion, react, react-dom (+3 more)

### Community 7 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express, @types/node, @types/react (+2 more)

### Community 8 - "API Recovery & Resilience Skill"
Cohesion: 0.29
Nodes (8): Failure diagnosis and error fingerprinting, Fallback strategy selection, API Recovery & Resilience Skill, ollama-gemma, Resilient Python wrapper synthesis, Retry invariants, Retry policy formulation, Safeguard verification

### Community 9 - "Recovery recommendation workflow"
Cohesion: 0.40
Nodes (5): Recovery recommendation workflow, API Recovery Skill, Fallback guidance options, Safety rules and required output, Retry guidelines

### Community 10 - "Graphify repository navigation instructions"
Cohesion: 0.50
Nodes (4): Graphify repository navigation instructions, /graphify, Graphify navigation artifacts, Graphify query, path, and explain

## Knowledge Gaps
- **23 isolated node(s):** `autoprefixer`, `dotenv`, `esbuild`, `express`, `@google/genai` (+18 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 96 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`, `types.ts`, `api.ts`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **What connects `autoprefixer`, `dotenv`, `esbuild` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10317460317460317 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `App.tsx` to `package.json`, `types.ts`, `api.ts`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12688172043010754 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07389162561576355 - nodes in this community are weakly interconnected._