import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ Read from environment variables to prevent secret leaking.
const API_KEY = process.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const prompt = `
Return ONLY this JSON.

{
  "nodes": [
    {
      "id": "frontend",
      "data": {
        "label": "React Frontend"
      }
    },
    {
      "id": "backend",
      "data": {
        "label": "FastAPI Backend"
      }
    },
    {
      "id": "database",
      "data": {
        "label": "PostgreSQL Database"
      }
    }
  ],

  "edges": [
    {
      "id": "frontend-backend",
      "source": "frontend",
      "target": "backend"
    },
    {
      "id": "backend-database",
      "source": "backend",
      "target": "database"
    }
  ]
}
`;

    console.log("Sending request...");

    const result = await model.generateContent(prompt);

    console.log("\n===== RESPONSE =====\n");
    console.log(result.response.text());
  } catch (error) {
    console.error("\n===== ERROR =====\n");
    console.error(error);
  }
}

main();