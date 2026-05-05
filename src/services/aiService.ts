import Groq from "groq-sdk";

// Initialize the Groq client using your environment variable
// In Expo, variables must be prefixed with EXPO_PUBLIC_ to be accessible via process.env
const groq = new Groq({
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || "",
    dangerouslyAllowBrowser: true
});

export const getFitnessPlan = async (userData: {
    age: string;
    weight: string;
    height: string;
    goal: string;
}) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a professional IronFit health coach. Provide concise, expert advice."
                },
                {
                    role: "user",
                    content: `User Profile: Age ${userData.age}, Weight ${userData.weight}kg, Height ${userData.height}cm. 
          Goal: ${userData.goal}. 
          Please provide: 
          1. BMI calculation. 
          2. Daily calorie target. 
          3. 1-day meal plan. 
          4. Recommended step goal.`
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Groq AI Error:", error);
        throw error;
    }
};