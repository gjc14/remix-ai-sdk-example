import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { ActionFunctionArgs } from "@remix-run/node";
import { CoreMessage, streamText } from "ai";

export const providers = ["gemini-1.5-flash", "gpt-3.5-turbo"] as const;
export type Provider = (typeof providers)[number];

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    messages,
    provider,
  }: { messages: CoreMessage[]; provider: Provider } = await request.json();

  if (provider === "gemini-1.5-flash") {
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: "You are a helpful assistant.",
      messages,
    });

    // Create a ReadableStream from the result, instead of making a Response
    const stream = result.toDataStream();
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } else if (provider === "gpt-3.5-turbo") {
    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      system: "You are a helpful assistant.",
      messages,
    });

    // Create a ReadableStream from the result, instead of making a Response
    const stream = result.toDataStream();
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  }
};
