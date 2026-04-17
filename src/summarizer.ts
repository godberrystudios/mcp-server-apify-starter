import Anthropic from '@anthropic-ai/sdk';

export interface SummarizeOptions {
  text: string;
  maxSentences?: number;
  apiKey: string;
}

export async function summarizeText({
  text,
  maxSentences = 3,
  apiKey,
}: SummarizeOptions): Promise<string> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Summarize the following text in at most ${maxSentences} sentences. Return only the summary, no preamble.\n\n---\n\n${text}`,
      },
    ],
  });

  const first = response.content[0];
  if (first.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic API');
  }
  return first.text.trim();
}
