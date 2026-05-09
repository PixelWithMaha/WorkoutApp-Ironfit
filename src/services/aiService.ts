import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || "",
    dangerouslyAllowBrowser: true
});

export interface FitnessPlanResult {
    bmi: number;
    bmiCategory: string;
    bmiAdvice: string;
    dailyCalories: number;
    calorieDeficit: number;
    dailySteps: number;
    exerciseMinutes: number;
    exerciseTypes: string[];
    diet: {
        breakfast: string;
        lunch: string;
        dinner: string;
        snacks: string;
    };
    hydration: string;
    weeklyGoal: string;
    motivationalTip: string;
}

export const getFitnessPlan = async (userData: {
    age: string;
    weight: string;
    height: string;
    goal: string;
}): Promise<FitnessPlanResult> => {
    const prompt = `You are IronFit AI, a world-class personal health coach. 
Analyze the following user and respond ONLY with a valid JSON object. No markdown, no explanation, just raw JSON.

User: Age ${userData.age}, Weight ${userData.weight}kg, Height ${userData.height}cm, Goal: ${userData.goal}.

Respond with this exact JSON structure:
{
  "bmi": <number, 1 decimal>,
  "bmiCategory": "<Underweight|Normal|Overweight|Obese>",
  "bmiAdvice": "<1 sentence specific advice for their BMI>",
  "dailyCalories": <integer, maintenance calories for their goal>,
  "calorieDeficit": <integer, deficit or surplus — negative means surplus, 0 if maintaining>,
  "dailySteps": <integer, recommended daily step count>,
  "exerciseMinutes": <integer, minutes per day>,
  "exerciseTypes": ["<exercise 1>", "<exercise 2>", "<exercise 3>"],
  "diet": {
    "breakfast": "<specific meal suggestion>",
    "lunch": "<specific meal suggestion>",
    "dinner": "<specific meal suggestion>",
    "snacks": "<specific snack suggestions>"
  },
  "hydration": "<daily water intake in liters e.g. 2.5L>",
  "weeklyGoal": "<1 sentence measurable weekly goal>",
  "motivationalTip": "<1 short motivational sentence personalised to their goal>"
}`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are IronFit AI. Always respond with valid JSON only. No markdown fences, no extra text."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.4,
        });

        const raw = chatCompletion.choices[0]?.message?.content || "{}";
        const clean = raw.replace(/```json|```/g, "").trim();
        return JSON.parse(clean) as FitnessPlanResult;
    } catch (error) {
        console.error("Groq AI Error:", error);
        throw error;
    }
};