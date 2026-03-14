import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function analyzeProject(description: string) {
  const prompt = `You are a senior project manager and 
technical architect. Analyze this project and return a 
precise project plan.

Return ONLY this exact JSON structure, nothing else:
{
  "title": "short project title",
  "summary": "2 sentence project summary",
  "estimated_hours": number,
  "complexity": "low" | "medium" | "high",
  "milestones": [
    {
      "title": "milestone title",
      "description": "what will be built",
      "success_criteria": [
        "specific measurable criterion 1",
        "specific measurable criterion 2",
        "specific measurable criterion 3"
      ],
      "estimated_hours": number,
      "deadline_days": number,
      "payment_percentage": number,
      "order": number
    }
  ]
}

Rules:
- Minimum 3 milestones, maximum 8
- Each milestone needs 3-5 success criteria
- Criteria must be specific and testable
- All payment_percentage values must sum to exactly 100
- deadline_days must be realistic for estimated_hours
- If too vague return:
  { "error": "description_too_vague",
    "message": "explain what is missing" }

Project description: ${description}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  try {
    // Strip markdown code fences if present
    const json = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(json);
  } catch {
    throw new Error(
      "Gemini returned invalid JSON: " + rawText
    );
  }
}

export async function evaluateSubmission(
  milestoneCriteria: string[],
  projectContext: string,
  submissionContent: string,
  freelancerHistory: object[]
) {
  const prompt = `You are an expert quality assurance 
evaluator for a freelance platform. Evaluate submitted 
work against milestone criteria objectively.

Return ONLY this exact JSON structure, nothing else:
{
  "score": number between 0 and 1,
  "verdict": "pass" | "partial" | "fail",
  "passed_criteria": ["criterion that was met"],
  "failed_criteria": ["criterion that was not met"],
  "feedback": "detailed constructive feedback",
  "reasoning": "how score was calculated"
}

Verdict rules:
- pass: score >= 0.8
- partial: score >= 0.4 and < 0.8  
- fail: score < 0.4

PROJECT CONTEXT:
${projectContext}

MILESTONE SUCCESS CRITERIA:
${milestoneCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

FREELANCER HISTORY (last 5 submissions):
${JSON.stringify(freelancerHistory, null, 2)}

SUBMITTED WORK:
${submissionContent}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  try {
    const json = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(json);
  } catch {
    throw new Error(
      "Gemini returned invalid JSON: " + rawText
    );
  }
}
