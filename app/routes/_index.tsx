import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { CoreMessage, streamText } from "ai";
import { useChat } from "ai/react";
import React from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Vercel AI SDK Example" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const providers = ["gemini-1.5-flash", "gpt-3.5-turbo"] as const;
type Provider = (typeof providers)[number];

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
    return result.toDataStreamResponse();
  } else if (provider === "gpt-3.5-turbo") {
    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      system: "You are a helpful assistant.",
      messages,
    });
    return result.toDataStreamResponse();
  }
};

export default function Index() {
  const [provider, setProvider] = React.useState<Provider>("gemini-1.5-flash");
  const { messages, input, handleSubmit, handleInputChange, isLoading } =
    useChat({
      api: "?index&_data",
      body: { provider },
      onResponse: (response) => {
        console.log(response);
      },
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col p-2 gap-2">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-row gap-2">
            <div className="w-24 text-zinc-500">{`${message.role}: `}</div>
            <div className="w-full">{message.content}</div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 flex p-2 gap-2 w-full"
      >
        <select
          value={provider}
          onChange={(v) => setProvider(v.currentTarget.value as Provider)}
          className="border rounded-lg p-2"
        >
          {providers.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>

        <input
          value={input}
          placeholder="Send message and press ENTER to submit"
          onChange={handleInputChange}
          className="bg-zinc-100 text-black border-2 border-violet-300 w-full p-2 rounded-lg text-sm"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
