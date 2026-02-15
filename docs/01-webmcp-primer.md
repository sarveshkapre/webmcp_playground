# WebMCP Primer (Working Notes)

## Why WebMCP

WebMCP-like patterns help LLM apps call external capabilities through a clear tool interface.

## Core Pieces

- Tool discovery (`list_tools`)
- Tool invocation (`call_tool`)
- Typed request/response envelopes
- Error handling that the LLM can reason about

## What To Learn Here

- Define stable tool metadata.
- Validate arguments defensively.
- Keep tool outputs compact and machine-usable.
- Keep transport concerns separate from business logic.

## Next Iteration Ideas

- Add auth layer for non-local usage.
- Add streaming output support.
- Add session isolation support.
- Add tool side-effect classes and user confirmation hooks.
