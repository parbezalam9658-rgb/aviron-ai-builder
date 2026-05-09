export async function generateWebsite(prompt: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
    if (!apiKey) {
      throw new Error("Missing OpenRouter API key");
    }
  
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
  
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
  
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free",
  
          messages: [
            {
              role: "user",
              content: `Create a premium modern SaaS homepage using black, white, and purple tones for: ${prompt}`,
            },
          ],
        }),
      },
    );
  
    const data = await response.json();
  
    console.log(data);

return (
  data?.choices?.[0]?.message?.content ||
  JSON.stringify(data, null, 2)
);
  }