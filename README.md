# MCP Server — Apify Starter

> Production-ready starter for building a **pay-per-use MCP server** on the Apify platform. Fork it, replace the example tools, deploy in an afternoon.

Built and maintained by [Godberry Studios](https://godberrystudios.com) — we ship MCP servers for a living.

---

## Why this starter

Most MCP tutorials leave you with a `stdio` demo running on localhost. That's not a product. Turning it into something customers can pay for means solving:

- **Transport** — `stdio` is fine for desktop clients; for remote callers you need **Streamable HTTP**.
- **Hosting** — who keeps the server running? Your server, a VPS, a serverless runtime?
- **Billing** — how do you charge per call without building a Stripe integration?
- **Distribution** — how do agents actually find and authenticate against your server?

This starter gives you all four, wired end-to-end, using **[Apify Actors](https://apify.com/actors)** as the runtime and their **pay-per-event** billing.

## What you get

- **MCP server** using the official `@modelcontextprotocol/sdk` (TypeScript).
- **Streamable HTTP transport** on `POST /mcp` — the remote-ready protocol.
- **Apify Actor Standby mode** — keeps the server warm for low-latency calls, scales to zero when idle.
- **Pay-per-event billing** — charge a flat fee per tool call, configured in `.actor/pay_per_event.json`.
- **One free tool + one paid tool** showing both patterns.
- **Dockerfile** and `.actor/actor.json` ready for `apify push`.
- **MIT licensed**. Do whatever you want with it.

## Project layout

```
.
├── .actor/
│   ├── actor.json            # Apify Actor manifest (Standby mode enabled)
│   └── pay_per_event.json    # Per-tool pricing
├── src/
│   ├── main.ts               # Express + MCP server wiring
│   ├── tools.ts              # Register your MCP tools here
│   ├── billing.ts            # chargeEvent() wrapper
│   └── summarizer.ts         # Example paid-tool implementation
├── Dockerfile
├── tsconfig.json
└── package.json
```

## Quickstart

### 1. Clone and install

```bash
git clone https://github.com/godberrystudios/mcp-server-apify-starter.git
cd mcp-server-apify-starter
npm install
```

### 2. Run locally

```bash
export ANTHROPIC_API_KEY=sk-ant-...  # needed for the summarize-text example
npm run dev
```

The server starts on `http://localhost:4321/mcp`.

### 3. Inspect with the MCP Inspector

In another terminal:

```bash
npm run inspect
```

The Inspector opens in your browser. Point it at `http://localhost:4321/mcp` and you can call the tools interactively.

### 4. Deploy to Apify

```bash
npm install -g apify-cli
apify login
apify push
```

Then on the Apify dashboard for your Actor:
- Set the `ANTHROPIC_API_KEY` environment variable.
- Enable **Standby mode**.
- Publish the Actor.

Your MCP endpoint is now live at:

```
https://<your-username>--<actor-name>.apify.actor/mcp
```

Callers authenticate with their Apify API token as a bearer header.

## How to replace the example tools with your own

1. **Drop the summarizer.** Delete `src/summarizer.ts` — it's just the example implementation.
2. **Edit `src/tools.ts`.** Replace the `word-count` and `summarize-text` tools with yours. Use Zod schemas for the input types.
3. **Update pricing.** Edit `.actor/pay_per_event.json` — one entry per paid tool. `eventName` must match the string passed to `chargeEvent()` in your tool.
4. **Charge before the expensive work.** In each paid tool:

   ```ts
   await chargeEvent('your-event-name');
   const result = await yourExpensiveOperation();
   ```

   This prevents giving free compute to users whose billing fails.

## Free tools vs paid tools — the pattern

The starter ships one of each on purpose. Free tools are high-leverage:

- **`extract-preview`-style tools** — let callers see the data they'd get before paying.
- **`count`, `validate`, `inspect`** — cheap reads that build trust.
- **`pricing`, `status`** — meta-tools that help callers reason about the server.

Every paid tool should have a free tool next to it if possible. It reduces friction and gives the agent an obvious first move.

## Authentication and clients

Apify Standby actors accept an Apify API token as `Authorization: Bearer <token>`. Any MCP client can call them. Known-good setups:

- **Claude Desktop** — add the Actor URL + token as a remote MCP server in settings.
- **Claude Code** — `claude mcp add --url ...` with the token in headers.
- **Cursor** — remote MCP support in settings.
- **Custom code** — any HTTP client that speaks MCP's Streamable HTTP transport.

## What this starter is not

- **Not** a self-hosted setup. If you want full control, use the official [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) directly and host anywhere.
- **Not** Stripe or x402 billing. Those are separate patterns; this one uses Apify's built-in billing rail because it's the fastest path to paying customers today.
- **Not** an all-in-one agent framework. One server, one job, composable.

For a Stripe/x402 version, watch this org — we'll ship it next.

## See it in production

The authors run live MCP servers built on this same pattern:

- **[Content-to-Social MCP Server](https://apify.com/godberry/content-to-social-mcp)** — `$0.07` / call.
- **[Google Reviews Scraper](https://apify.com/godberry/google-reviews-scraper)** — from `$0.10` / place.

If you ship something with this starter, tell us at **hello@godberrystudios.com** and we'll link it back.

## Contributing

PRs welcome. Keep it minimal — the value of a starter is what it *doesn't* include. If you want to add features, open an issue first so we can discuss whether it belongs in the core or as a documented extension.

## License

[MIT](LICENSE) — do what you want.
