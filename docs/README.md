# Documentation

This folder holds the reference docs that Claude Code uses for context.

## Files in this folder

- **`PROMPT_GUIDE.md`** — Ready-to-use prompts for Claude Code, organised by phase.
- **`PRD.md`** *(you add this)* — The Product Requirements Document.
- **`Functional_Flow.md`** *(you add this)* — Screen-by-screen user flows.

## Adding the PRD and Functional Flow Doc

You have two options:

### Option A: Use the .docx files directly (easiest)

1. Drop `EstateHub_PRD.docx` and `EstateHub_Functional_Flow.docx` straight into this folder.
2. Claude Code can read .docx files when you reference them in prompts.

### Option B: Convert to Markdown (better for diffs and version control)

1. Open each .docx file in Microsoft Word or Google Docs.
2. Export as Markdown (or copy-paste content into a new `.md` file).
3. Save as `PRD.md` and `Functional_Flow.md` in this folder.

Markdown is preferable because:
- Claude Code reads it more reliably.
- You can edit small sections in VS Code without opening Word.
- Diffs in git history are readable.

## When to update these docs

Treat the PRD and Flow doc as living documents. Update them when:
- You decide to cut or change a feature.
- A user research session reveals a new requirement.
- A technical constraint forces a flow change.

Keeping these docs accurate matters because Claude Code relies on them as the
source of truth for what to build.
