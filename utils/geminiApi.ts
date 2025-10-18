const RENDER_BACKEND_URL = 'https://mAIstermind-Teleprompter.onrender.com';

export async function callApi(
  prompt: string,
  config: any = {},
  onChunk?: (chunk: string) => void
): Promise<string> {
  const body = {
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: config || {},
  };

  // FIX: Cast import.meta to any to resolve TypeScript error about 'env' property.
  const apiUrl = (import.meta as any).env.DEV ? '/api/generate' : `${RENDER_BACKEND_URL}/api/generate`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData;
      const errorText = await response.text();
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(errorText || `API request failed with status: ${response.status}`);
      }
      throw new Error(errorData.error || `API request failed with status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Could not read response stream.");
    }

    const decoder = new TextDecoder();
    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      if (onChunk) {
        onChunk(chunk);
      }
    }
    
    return fullText;

  } catch (err: any) {
    throw err;
  }
}
