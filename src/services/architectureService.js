import { GoogleGenerativeAI } from "@google/generative-ai";
import { callGeminiWithRetry } from "../Utils/retry";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

export async function generateArchitecture(idea) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
  });

  const prompt = `
You are a Principal Software Architect at Google.

Design a modern production-ready architecture.

Return ONLY valid JSON.

DO NOT wrap in markdown.

DO NOT explain anything.

Return EXACTLY this schema.

{
  "nodes":[
    {
      "id":"frontend",
      "data":{
        "label":"React Frontend",
        "subtitle":"Client",
        "category":"Frontend",
        "technology":"React",
        "icon":"globe",
        "color":"blue",
        "description":"Handles user interface and routing."
      }
    }
  ],

  "edges":[
    {
      "id":"frontend-api",
      "source":"frontend",
      "target":"gateway"
    }
  ]
}

=========================
NODE RULES
=========================

Each node MUST contain

label

subtitle

category

technology

icon

color

=========================

VALID CATEGORIES

Frontend

Gateway

Backend

Database

Cache

Queue

Storage

External

AI

Monitoring

Authentication

=========================

VALID ICONS

globe

server

database

shield

cpu

cloud

hard-drive

search

message

credit-card

brain

settings

=========================

VALID COLORS

blue

purple

green

orange

red

cyan

yellow

pink

=========================

ARCHITECTURE RULES

Layer 1

Frontend

↓

Layer 2

Gateway

↓

Layer 3

Services

↓

Layer 4

Infrastructure

↓

Layer 5

External APIs

Clients ONLY connect to Gateway.

Gateway ONLY connects to Services.

Services connect to Databases.

Services connect to Cache.

Services connect to Queue.

Services MAY connect to External APIs.

Databases NEVER connect directly to Frontend.

External APIs NEVER connect to Frontend.

Avoid unnecessary edges.

No cycles.

No duplicate edges.

Between 8 and 12 nodes.

NO position.

NO implementation.

NO description.

NO tasks.

NO folder structure.

Project Idea:

${idea}
`;

  try {
    const result = await callGeminiWithRetry(() => model.generateContent(prompt));

    return result.response.text();
  } catch (error) {
    console.error(error);
    throw error;
  }
}