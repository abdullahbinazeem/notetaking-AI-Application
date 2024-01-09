import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// /api/completion

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { prompt, length, AiStyle } = await req.json();

  console.log(length);

  let AiAddition = "";
  let AiLength = "";

  switch (AiStyle) {
    case "Academic":
      AiAddition =
        "After the response, in this format write: Source - [cite an exact url of website where students can find this information].";
      break;
    case "Formal":
      AiAddition = "The response should be formal and sound sophisticated.";
      break;
    case "Casual":
      AiAddition =
        "The response should in layman’s terms specific to a 10th grader’s comprehension";
      break;
    case "Slang":
      AiAddition = "The response should be in slang.";
      break;
  }

  switch (length) {
    case "Short":
      AiLength = "5 to 10 words.";
      break;
    case "Regular":
      AiLength = "15 to 30 words.";
      break;
    case "Long":
      AiLength = "35 to 50 words.";
      break;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a helpful AI embedded in a text editor app that is used to autocomplete sentences
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual. 
             ${AiAddition}
            Keep the response between ${AiLength}.
        `,
      },
      {
        role: "user",
        content: `
        I am writing a piece of text in a text editor app.
        Complete this sentence: ${prompt}
        keep the tone of the text consistent with the rest of the text.
        `,
      },
    ],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
