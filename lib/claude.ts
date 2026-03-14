import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeProject(description: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    system: `You are a senior project manager and technical 
architect. A client has described a project they want built. 
Your job is to analyze it and return a precise project plan.

You MUST return only valid JSON. No explanation, no markdown,
no code blocks. Raw JSON only.

Return this exact structure:
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
- Minimum 3 milestones, maximum 8 milestones
- Each milestone must have 3-5 success criteria
- success_criteria must be specific and testable, not vague
- payment_percentage across all milestones must sum to 100
- deadline_days must be realistic for estimated_hours
- If description is too vague return:
  { "error": "description_too_vague", 
    "message": "explain what is missing" }`,
    messages: [
      {
        role: "user",
        content: description,
      },
    ],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error("Claude returned invalid JSON: " + rawText);
  }
}

export async function evaluateSubmission(
  milestoneCriteria: string[],
  projectContext: string,
  submissionContent: string,
  freelancerHistory: object[]
) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    system: `You are an expert quality assurance evaluator 
for a freelance platform. You evaluate submitted work against 
milestone success criteria objectively and fairly.

You MUST return only valid JSON. Raw JSON only, no markdown.

Return this exact structure:
{
  "score": number between 0 and 1,
  "verdict": "pass" | "partial" | "fail",
  "passed_criteria": ["criterion that was met"],
  "failed_criteria": ["criterion that was not met"],
  "feedback": "detailed constructive feedback for freelancer",
  "reasoning": "explanation of how score was calculated"
}

Verdict rules:
- pass: score >= 0.8
- partial: score >= 0.4 and < 0.8
- fail: score < 0.4`,
    messages: [
      {
        role: "user",
        content: `PROJECT CONTEXT:
${projectContext}

MILESTONE SUCCESS CRITERIA:
${milestoneCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

FREELANCER HISTORY (last 5 submissions):
${JSON.stringify(freelancerHistory, null, 2)}

SUBMITTED WORK:
${submissionContent}

Evaluate this submission against the criteria above.`,
      },
    ],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error("Claude returned invalid JSON: " + rawText);
  }
}
