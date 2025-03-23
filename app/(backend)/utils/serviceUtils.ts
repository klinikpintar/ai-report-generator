export function validateServiceInput(data: unknown) {
  return data;
}

export function handleError(error: unknown, context: string) {
  return new Response(JSON.stringify({ error: `${context}: ${String(error)}` }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
