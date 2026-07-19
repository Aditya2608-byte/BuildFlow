import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

export async function generateProjectRoadmap(idea) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
  });

  const prompt = `
You are a senior software architect.

Generate a software architecture roadmap.

Return ONLY valid JSON.

Format:

{
  "nodes": [
    {
      "id": "1",
      "position": {
        "x": 100,
        "y": 100
      },
      "data": {
        "label": "React Frontend"
      }
    }
  ],

  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",

      "data": {
        "steps": [
          {
            "title": "Create API Layer",

            "description":
              "Explain why this step is required.",

            "tasks": [
              "Task 1",
              "Task 2",
              "Task 3"
            ]
          }
        ]
      }
    }
  ]
}

Rules:

1. Return ONLY JSON.
2. Every edge must have 3-5 detailed steps.
3. Every step must contain:
   - title
   - description
   - tasks
4. Tasks should be actionable.
5. Architecture should be realistic.

Project Idea:
${idea}
`;

  try {
    console.log("Sending request to Gemini...");

    const result =
      await model.generateContent(prompt);

    console.log("Gemini responded successfully.");

    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:");
    console.error(error);

    throw error;
  }
}