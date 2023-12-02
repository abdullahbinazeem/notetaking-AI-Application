import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// /api/completion

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a helpful AI embedded in a notion text editor app that is used to autocomplete sentences
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual. Do not stream one character at a time, stream at least one word.
        `,
      },
      {
        role: "user",
        content: `
        I am writing a piece of text in a notion text editor app.
        Complete this sentence: ${prompt}
        keep the tone of the text consistent with the rest of the text.
        keep the response short.
        `,
      },
    ],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
