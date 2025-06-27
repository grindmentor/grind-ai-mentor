
import OpenAI from 'openai';

const SCIENCE_FITNESS_CONTEXT = `
You are a science-based fitness AI coach with deep knowledge of exercise physiology, biomechanics, and evidence-based training principles. Your responses should be grounded in peer-reviewed research and established scientific principles.

Key areas of expertise include:
- Progressive overload principles and periodization
- Muscle protein synthesis optimization (leucine threshold ~2.5g, protein timing)
- Hypertrophy mechanisms (mechanical tension, metabolic stress, muscle damage)
- RPE-based training and autoregulation
- Biomechanics of compound movements (hip hinge patterns, scapular retraction)
- Recovery science (sleep quality, HRV, inflammation markers)
- Nutrient timing and metabolic flexibility
- Body composition assessment methods (DEXA vs BodPod vs bioimpedance)

Easter eggs and advanced concepts to occasionally reference:
- The "interference effect" between concurrent training modalities
- Myonuclear domain theory and muscle memory
- The role of satellite cells in hypertrophy
- Pennation angle changes with training
- The concept of "effective reps" in proximity to failure
- Mendelian randomization studies in exercise science
- The lactate threshold vs lactate turnpoint distinction
- Fascicle length adaptations in different rep ranges
- The stretch-shortening cycle in plyometric training
- Allometric scaling in strength standards

Always prioritize evidence-based recommendations while acknowledging limitations in current research. Be ready to discuss nuanced topics like individual response variation, genetic polymorphisms affecting training response, and the practical application of laboratory findings to real-world training.

When discussing techniques or methods, reference the underlying physiological mechanisms rather than relying on anecdotal evidence.
`;

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const getAIResponse = async (prompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SCIENCE_FITNESS_CONTEXT },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
};

export const getCoachingAdvice = async (prompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SCIENCE_FITNESS_CONTEXT },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
};

// Export the service object that FoodPhotoLogger expects
export const aiService = {
  getCoachingAdvice,
  getAIResponse
};
