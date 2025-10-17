const RENDER_BACKEND_URL = 'https://maistermind-teleprompter.onrender.com';

export async function callApi(prompt: string, config?: any) {
  const body = {
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: config || {},
  };

  // Use the development proxy or the production URL
  // FIX: Cast import.meta to any to resolve TypeScript error about 'env' property, a common workaround when Vite's client types are not globally available.
  const apiUrl = (import.meta as any).env.DEV ? '/api/generate' : `${RENDER_BACKEND_URL}/api/generate`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // Try to parse the error message from the backend
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If the response isn't JSON, use the status text
      throw new Error(response.statusText || 'API request failed with no error message.');
    }
    // Throw an error with the message from the backend, or a generic one
    throw new Error(errorData.error || `API request failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}