import { GoogleGenerativeAI } from "@google/generative-ai";
import { callGeminiWithRetry } from "../Utils/retry";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

export async function generateImplementation(selectedNode, details) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
  });

  const prompt = `
You are a Staff Software Engineer at Google.

Generate primary implementation boilerplate files for the following component:
Component: ${selectedNode.data?.label || selectedNode.id} (${selectedNode.data?.technology || "Generic"})
Purpose: ${details.purpose}
Tech Stack: ${JSON.stringify(details.techStack)}

Provide 2 to 3 main code files that are most critical to this component's functionality (e.g., routing controllers, schema definitions, config files, or frontend components).
Write high-quality, professional code with comments. Avoid placeholders like "TODO" - make the code look complete and working.

Return ONLY a valid JSON array matching this schema:
[
  {
    "path": "path/relative/to/project/root/filename.js",
    "language": "javascript",
    "code": "/* Professional code contents here */"
  }
]

RULES:
1. Return ONLY the JSON array. Do NOT explain anything or wrap in markdown formatting (like \`\`\`json).
2. Provide complete code in the "code" field. Avoid ellipses or partial implementations.
3. Make sure the JSON is valid and parsable. Escape special characters and newlines correctly.
`;

  try {
    const result = await callGeminiWithRetry(() => model.generateContent(prompt));
    let text = result.response.text().trim();

    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating implementation:", error);
    throw error;
  }
}