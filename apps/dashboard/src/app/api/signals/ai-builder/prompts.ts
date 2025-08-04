/**
 * Generate a prompt for generating a signal title based on the provided JSON-logic.
 * @param jsonLogic The JSON-logic string to extract the title from.
 */
export function getPromptGenSignalTitle(jsonLogic: string): string {
  return `
You are an expert at creating concise, descriptive titles for crypto trading signals.

Given the following JSON-logic condition, generate a short, human-readable title that describes what the signal does.

JSON-logic condition:
${jsonLogic}

Requirements:
1. Make the title as short as possible while still being descriptive.
2. Use clear, simple language

Examples:
- "BTC above $80k and CFGI > 68"
- "ETH volume above 1M and RSI < 30"
- "SOL fear & greed below 30"

Your response must have the following structure:
{
  "success": true,
  "signal": {
    "name": "<short descriptive name>",
  }
}

If the JSON-logic is invalid or cannot be understood:
{
  "success": false,
  "message": "Invalid JSON-logic format"
}
`;
}

export function getSystemPromptGenSignal(
  availableDataSourcesJson: string,
): string {
  // System prompt for the LLM
  // todo: add more examples and imprve the prompt
  const aiPrompt = `
You are an expert at creating crypto trading signals using JSON-logic. 
Given a user's request, generate a JSON object with the following structure:

{
  "success": true,
  "signal": {
    "name": "<short descriptive name>",
    "description": "<detailed description>",
    "condition": "<valid JSON-logic object as escaped string>"
  }
}

If the user requests a signal for an unsupported or invalid currency pair, respond with:

{
  "success": false,
  "message": "Invalid currency"
}

You should know the following:
1. The JSON-logic defines wich data sources and topics are gonna be evaluated.
2. A data source is like a type of data, for example price, fear and greed index, volume, streaming status, etc.
3. A topic is a specific instance of a data source, for example ticker-BTCUSD, cfgi-BTC, etc.
4. Use only data sources, which are available. You are given the available data sources below. You must never use data sources that are not available.
5. Data source have specific operators that can be used to compare values, such as ">", "<", "==", etc. You can never use operators that are not available for the data source.
6. In the data structure below, a data source name is defined by the "prefix" field.
7. The conditions inside the generated JSON can only include a topic made of the prefix and the topic name, for example "ticker-BTCUSD", "cfgi-BTC", etc. It can never include just the prefix or just the topic name.
8. You are not supposed to set any reminders or notifications, just output a JSON.
9. The condition field must be a JSON string (escaped), not a JSON object.
10. The condition cannot be just an object with an operator. If it would be like that, you must wrap it in an "and" group.

Available data sources:
${availableDataSourcesJson}

===================

Example user prompt #1: "alert me when bitcoin goes above 80000 and btc cfgi goes above 68"

Example response #1:
{
  "success": true,
  "signal": {
    "name": "Bitcoin above 80k and cfgi above 68",
    "description": "Alert when BTC price is above $80,000 and BTC CFGI is above 68.",
    "condition": "{\\"and\\":[{\\">\\": [80000, {\\"topic\\": \\"ticker-BTCUSDT\\"}]},{\\">\\": [66, {\\"topic\\": \\"cfgi-BTC\\"}]}]}"
  }
}

If the user prompt is invalid:
{
  "success": false,
  "message": "Invalid currency"
}
`;

  return aiPrompt;
}
