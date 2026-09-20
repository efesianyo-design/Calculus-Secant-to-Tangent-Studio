import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI:", e);
    }
  }
  return aiClient;
}

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Calculus Secant-to-Tangent Studio API" });
});

// Socratic AI Coach endpoint
app.post("/api/socratic-hint", async (req, res) => {
  try {
    const {
      functionName,
      expression,
      xVal,
      hVal,
      secantSlope,
      exactSlope,
      level,
      studentName,
      query,
    } = req.body || {};

    const ai = getGeminiClient();

    if (ai) {
      const systemInstruction = `You are "Sir Eugene", an encouraging, brilliant high school and early college calculus mentor from Sir Eugene Technologies.
Your goal is SOCRATIC GUIDANCE: help the student understand difference quotients, secants converging to tangents, and derivatives from first principles.
RULES:
1. Do NOT bluntly give the direct formula or solve it immediately. Guide their mathematical intuition.
2. Ask 1-2 thought-provoking guiding questions about the delta y / delta x chord slope as h gets arbitrarily close to 0.
3. Keep the tone warm, concise (2-4 sentences max), inspiring, and pedagogically sound.
4. Reference the student's name (${studentName || "Scholar"}) and education level (${level || "Senior High School"}).
5. Use clear mathematical notation where appropriate.`;

      const prompt = `Current Context:
Function: f(x) = ${expression || functionName || "x^2"}
Point P: x = ${xVal ?? 1}
Interval step: h = ${hVal ?? 0.5}
Computed Secant Slope [f(x+h) - f(x)]/h = ${secantSlope ?? "N/A"}
Exact Instantaneous Derivative f'(x) = ${exactSlope ?? "N/A"}
Student Question/Observation: "${query || "How does this secant line become a tangent line as h decreases?"}"

Provide a crisp, illuminating Socratic hint to help them grasp the concept.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const hintText = response.text;
      if (hintText) {
        return res.json({
          hint: hintText.trim(),
          source: "gemini",
        });
      }
    }

    // Offline heuristic fallback
    const hNum = typeof hVal === "number" ? hVal : parseFloat(hVal) || 0.1;
    let fallbackHint = "";
    if (hNum > 0.5) {
      fallbackHint = `Greetings, ${studentName || "Scholar"}! Notice how when h is large (${hNum.toFixed(2)}), the blue secant chord cuts through the curve across two distant points, giving only an average rate of change. Try dragging the h-slider closer to 0.001—what happens to the distance between point P and point Q?`;
    } else if (hNum > 0.01) {
      fallbackHint = `Great investigation! As h shrinks to ${hNum.toFixed(4)}, points P and Q are drawing together. Notice the difference quotient [f(x+h) - f(x)]/h (${typeof secantSlope === 'number' ? secantSlope.toFixed(4) : secantSlope}) is getting closer to the instantaneous slope (${typeof exactSlope === 'number' ? exactSlope.toFixed(4) : exactSlope}). Can h ever truly equal 0 without dividing by zero?`;
    } else {
      fallbackHint = `Remarkable precision! At h = ${hNum.toFixed(4)}, the secant line has virtually merged with the tangent line. The difference quotient limit lim_{h→0} [f(x+h)-f(x)]/h has converged into the exact instantaneous rate of change f'(${xVal}) = ${typeof exactSlope === 'number' ? exactSlope.toFixed(4) : exactSlope}!`;
    }

    return res.json({
      hint: fallbackHint,
      source: "heuristic",
    });
  } catch (error: any) {
    console.error("Socratic hint error:", error);
    return res.json({
      hint: `Notice how shrinking the interval h causes the average secant slope [f(x+h) - f(x)]/h to converge directly onto the instantaneous tangent slope f'(x). Observe the algebraic cancellation of h in the difference quotient numerator!`,
      source: "fallback",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Calculus Secant-to-Tangent Studio running on http://localhost:${PORT}`);
  });
}

startServer();
