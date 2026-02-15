# Example Prompts and Transcripts

## Prompt 1: Basic computation

User prompt:

```text
What is 7 + 35?
```

Observed tool call:

```json
{
  "name": "sum",
  "arguments": { "a": 7, "b": 35 }
}
```

Expected result:

```json
{ "ok": true, "result": { "value": 42 } }
```

## Prompt 2: Session-scoped write

User prompt:

```text
Remember this note for this session: finalize roadmap milestones.
```

Observed tool call:

```json
{
  "name": "append_note",
  "sessionId": "agent-session",
  "confirmed": true,
  "arguments": { "text": "finalize roadmap milestones" }
}
```

Expected result:

```json
{ "ok": true, "result": { "added": true, "count": 1 } }
```

## Prompt 3: Session-scoped read

User prompt:

```text
List my notes for this session.
```

Observed tool call:

```json
{
  "name": "list_notes",
  "sessionId": "agent-session",
  "arguments": {}
}
```

Expected result:

```json
{ "ok": true, "result": { "notes": ["finalize roadmap milestones"] } }
```

## Prompt 4: Confirmation guard failure

User prompt:

```text
Clear all session notes.
```

If `confirmed` is missing/false:

```json
{
  "ok": false,
  "error": {
    "code": "CONFIRMATION_REQUIRED",
    "message": "Tool \"clear_notes\" requires explicit confirmation (confirmed=true)."
  }
}
```
