import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { chargeEvent } from './billing.js';
import { summarizeText } from './summarizer.js';

export function registerTools(server: McpServer): void {
  // ──────────────────────────────────────────────
  // Free tool — no charge, no API key required.
  // Use free tools for lookups and previews that
  // help users decide before paying.
  // ──────────────────────────────────────────────
  server.tool(
    'word-count',
    'Count words, characters, and sentences in a block of text. Free.',
    {
      text: z.string().min(1).describe('The text to analyze'),
    },
    async ({ text }) => {
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const characters = text.length;
      const sentences = (text.match(/[.!?]+(\s|$)/g) ?? []).length;

      return {
        content: [{
          type: 'text' as const,
          text: `Words: ${words}\nCharacters: ${characters}\nSentences: ${sentences}`,
        }],
      };
    },
  );

  // ──────────────────────────────────────────────
  // Paid tool — charges via Apify pay-per-event.
  // Charge BEFORE the expensive operation to avoid
  // giving free compute to users who would fail to pay.
  // ──────────────────────────────────────────────
  server.tool(
    'summarize-text',
    'Summarize a block of text into N sentences using Claude. Paid tool.',
    {
      text: z.string().min(50).describe('The text to summarize (minimum 50 characters)'),
      maxSentences: z.number().int().min(1).max(10).default(3).describe('Maximum number of sentences'),
    },
    async ({ text, maxSentences }) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return {
          content: [{
            type: 'text' as const,
            text: 'Error: ANTHROPIC_API_KEY is not configured in this Actor.',
          }],
          isError: true,
        };
      }

      try {
        await chargeEvent('summarize-text');
        const summary = await summarizeText({ text, maxSentences, apiKey });
        return {
          content: [{ type: 'text' as const, text: summary }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `Error summarizing text: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
