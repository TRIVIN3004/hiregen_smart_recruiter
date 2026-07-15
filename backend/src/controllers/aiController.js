const Groq = require("groq-sdk");

let groq;
function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("The GROQ_API_KEY environment variable is missing or empty; please provide it in your backend/.env file.");
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are HireGen AI, an intelligent recruitment assistant. Help recruiters and candidates with resumes, interview preparation, job descriptions, and hiring advice.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      success: true,
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};