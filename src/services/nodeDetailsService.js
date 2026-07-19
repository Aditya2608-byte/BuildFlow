import { GoogleGenerativeAI } from "@google/generative-ai";
import { callGeminiWithRetry } from "../Utils/retry";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

export async function generateNodeDetails(
  selectedNode,
  incomingConnections = [],
  outgoingConnections = []
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
  });

  const prompt = `
You are a Principal Software Architect at Google.

Analyze the following software component (selectedNode) in the context of its incoming and outgoing network/service connections.

SELECTED COMPONENT:
${JSON.stringify(selectedNode, null, 2)}

INCOMING CONNECTIONS (dependencies calling this component):
${JSON.stringify(incomingConnections, null, 2)}

OUTGOING CONNECTIONS (components this component calls):
${JSON.stringify(outgoingConnections, null, 2)}

Provide a detailed component blueprint.
Return ONLY valid JSON matching this schema:
{
  "purpose": "A clear, professional description of the component's primary role in the architecture.",
  "responsibilities": [
    "Key responsibility 1",
    "Key responsibility 2",
    "Key responsibility 3"
  ],
  "techStack": [
    { "name": "TechnologyName", "role": "Specific role, e.g., Primary database for persistence, middleware for authentication" }
  ],
  "folderStructure": [
    {
      "name": "src",
      "type": "directory",
      "children": [
        {
          "name": "controllers",
          "type": "directory",
          "children": [
            { "name": "userController.js", "type": "file" }
          ]
        }
      ]
    }
  ],
  "implementation": [
    {
      "title": "Phase 1: Setup",
      "description": "Short explanation of this phase.",
      "tasks": [
        "Task description 1",
        "Task description 2"
      ]
    }
  ],
  "bestPractices": [
    "Best practice/design pattern 1",
    "Best practice/design pattern 2"
  ],
  "estimatedTime": "Estimated development time, e.g., 8-12 hours"
}

RULES:
1. Return ONLY the JSON object. Do NOT explain anything or wrap it in markdown formatting (like \`\`\`json).
2. The folderStructure must be a nested array of folder/file objects, exactly matching the tree structure specified. Keep it realistic and typical for the technologies used. Keep it brief (maximum 8-10 entries total).
3. Tech stack roles must be tailored specifically to this component.
4. Keep the response clean and perfectly parsable.
`;

  try {
    const result = await callGeminiWithRetry(() => model.generateContent(prompt));
    let text = result.response.text().trim();

    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating node details:", error);
    throw error;
  }
}