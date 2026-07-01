export async function consumeSseStream(
  response: Response,
  onEvent: (event: string, data: any) => void
): Promise<void> {
  if (!response.body) {
    throw new Error("Streaming response body is unavailable.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      separatorIndex = buffer.indexOf("\n\n");

      if (!rawEvent.trim()) {
        continue;
      }

      const eventMatch = rawEvent.match(/^event:\s*(.+)$/m);
      const dataMatch = rawEvent.match(/^data:\s*(.+)$/m);

      if (!dataMatch) {
        continue;
      }

      const event = eventMatch?.[1] ?? "message";
      const data = JSON.parse(dataMatch[1]);
      onEvent(event, data);
    }
  }
}