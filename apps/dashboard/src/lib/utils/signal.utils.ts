export function extractTopicsFromJsonLogic(logic: any): string[] {
  const topics: string[] = [];

  function traverse(node: any) {
    if (!node || typeof node !== "object") return;
    // Check for topic object
    if (
      node.topic &&
      Array.isArray(node.topic) &&
      typeof node.topic[0] === "string"
    ) {
      topics.push(node.topic[0]);
    }
    // Traverse arrays
    if (Array.isArray(node)) {
      node.forEach(traverse);
    } else {
      // Traverse object values
      Object.values(node).forEach(traverse);
    }
  }

  traverse(logic);
  return topics;
}
