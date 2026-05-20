import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import twilio from 'twilio';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // In production, replace with specific origins
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// System prompt for Sol
const SOL_SYSTEM_PROMPT = `You are Sol, a warm, non-judgmental mental wellness companion. 
Respond with empathy, short supportive messages (1-3 sentences max), and never give medical or professional advice. 
Always show warmth and compassion. If the user expresses hopelessness, self-harm intent, or crisis language, 
gently acknowledge their pain and ask if they'd like to reach out to someone they trust, and remind them that they are not alone.
Never state you are a doctor, therapist, or medical professional. Keep the tone gentle and human-like.`;

// Sentiment Analysis Rules
const CRITICAL_KEYWORDS = [
  "can't go on", "want to disappear", "end it", "not safe", "suicide", 
  "kill myself", "want to die", "end my life", "better off dead", 
  "disappear forever", "cutting myself", "hurt myself"
];

const CONCERNING_KEYWORDS = [
  "hopeless", "lonely", "depressed", "give up", "so sad", 
  "anxious", "scared", "can't take it", "hurt inside", "hate myself", 
  "everything hurts", "no one cares", "feeling down"
];

// Helper to analyze risk
function analyzeRisk(message, cadence) {
  const text = (message || '').toLowerCase();
  
  // 1. Keyword check
  let keywordRisk = 'NORMAL';
  if (CRITICAL_KEYWORDS.some(keyword => text.includes(keyword))) {
    keywordRisk = 'CRITICAL';
  } else if (CONCERNING_KEYWORDS.some(keyword => text.includes(keyword))) {
    keywordRisk = 'CONCERNING';
  }

  // 2. Cadence analysis (Distress signals)
  let cadenceDistress = false;
  if (cadence) {
    const { typingSpeed, backspaceCount, longPauses } = cadence;
    
    // Thresholds:
    // - typingSpeed: slow typing (< 1.5 chars/sec) when typing at all
    // - backspaceCount: high backspace count (> 5)
    // - longPauses: 1 or more pause longer than 5 seconds
    const speedDistress = (typingSpeed > 0 && typingSpeed < 1.5);
    const backspaceDistress = (backspaceCount > 5);
    const pauseDistress = (longPauses >= 1);

    // Distress triggered if at least 2 of 3 signals are active
    const activeSignalsCount = (speedDistress ? 1 : 0) + (backspaceDistress ? 1 : 0) + (pauseDistress ? 1 : 0);
    cadenceDistress = (activeSignalsCount >= 2);
  }

  // 3. Combined risk calculation
  let finalRisk = keywordRisk;
  if (keywordRisk === 'CRITICAL') {
    finalRisk = 'CRITICAL';
  } else if (keywordRisk === 'CONCERNING') {
    finalRisk = cadenceDistress ? 'CRITICAL' : 'CONCERNING';
  } else {
    finalRisk = cadenceDistress ? 'CONCERNING' : 'NORMAL';
  }

  return {
    riskLevel: finalRisk,
    cadenceDistress
  };
}

// Empathy Engine Fallback for Demo Mode (when Gemini API key is missing)
function getMockEmpatheticResponse(message, riskLevel) {
  const text = (message || '').toLowerCase();
  
  if (riskLevel === 'CRITICAL') {
    return "I hear how much pain you're in, and I want you to know I'm listening. It sounds really heavy right now. Would it be okay to pause and reach out to someone you trust, or perhaps let me help you connect with your safety circle?";
  }
  
  if (text.includes('hello') || text.includes('hi ') || text.includes('hey')) {
    return "Hello! I'm Sol, your self-care companion. How are you feeling in this moment?";
  }
  if (text.includes('anxious') || text.includes('scared') || text.includes('panic')) {
    return "I hear you. Feeling anxious can make everything feel overwhelming. Let's take a slow breath together if you're open to it. I'm right here with you.";
  }
  if (text.includes('tired') || text.includes('exhausted') || text.includes('sleep')) {
    return "It sounds like your mind and body are carrying a lot. Please give yourself permission to rest. You've done enough for today.";
  }
  if (text.includes('lonely') || text.includes('alone')) {
    return "I know it can feel really isolating, but I'm here, and I'm listening. Your presence matters to me, and we can just sit together for a while.";
  }
  if (text.includes('sad') || text.includes('cry') || text.includes('low')) {
    return "I'm so sorry you're feeling down. It's completely okay to feel sad and cry. I'm sending you a warm, gentle hug. I'm here for you.";
  }
  
  // Generic empathetic fallbacks
  const fallbacks = [
    "Thank you for sharing that with me. I'm here to listen without judgment. How are you holding up?",
    "I'm here with you. Whatever you're going through, your feelings are valid. What would feel most supportive right now?",
    "That sounds like a lot to carry. I'm listening, and I want to support you in any small way I can."
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// 1. AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, cadence } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Run risk classification
    const { riskLevel, cadenceDistress } = analyzeRisk(message, cadence);

    let reply = '';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        // Initialize Gemini SDK
        const ai = new GoogleGenerativeAI(geminiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Build chat context
        const chatSession = model.startChat({
          generationConfig: {
            maxOutputTokens: 150,
          },
          systemInstruction: SOL_SYSTEM_PROMPT,
          history: (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }))
        });

        const result = await chatSession.sendMessage(message);
        reply = result.response.text();
      } catch (geminiError) {
        console.error("Gemini API Error, falling back to mock response:", geminiError);
        reply = getMockEmpatheticResponse(message, riskLevel);
      }
    } else {
      // Demo Mode response
      reply = getMockEmpatheticResponse(message, riskLevel);
    }

    res.json({
      reply: reply.trim(),
      riskLevel,
      cadenceDistress,
      mode: geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE' ? 'production' : 'demo'
    });

  } catch (error) {
    console.error("Server Error in /api/chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. Twilio SMS Alert Endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { contactName, contactPhone, userName, messageType } = req.body;

    if (!contactName || !contactPhone || !userName) {
      return res.status(400).json({ error: "Missing required fields (contactName, contactPhone, userName)" });
    }

    // Format message text
    let smsText = '';
    if (messageType === 'silent') {
      smsText = `${userName} needs support right now.`;
    } else {
      smsText = `Hi ${contactName}, ${userName} wanted you to know they're having a hard time and could use your support. — SoulSync`;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    const hasTwilioCreds = accountSid && authToken && twilioPhone && 
                           accountSid !== 'YOUR_TWILIO_ACCOUNT_SID_HERE' && 
                           authToken !== 'YOUR_TWILIO_AUTH_TOKEN_HERE';

    if (hasTwilioCreds) {
      try {
        const client = twilio(accountSid, authToken);
        const messageResult = await client.messages.create({
          body: smsText,
          from: twilioPhone,
          to: contactPhone
        });

        console.log(`[SMS Sent] SID: ${messageResult.sid} | To: ${contactPhone}`);
        return res.json({
          success: true,
          message: `SMS successfully sent to ${contactName} at ${contactPhone}`,
          mode: 'production'
        });
      } catch (twilioError) {
        console.error("Twilio Service Error:", twilioError);
        return res.status(500).json({ 
          error: "Failed to dispatch SMS through Twilio", 
          details: twilioError.message 
        });
      }
    } else {
      // Demo Mode SMS (simulate send and log to server console)
      console.log("\n=================== DEMO MODE SMS ALERT ===================");
      console.log(`TIME: ${new Date().toISOString()}`);
      console.log(`TO: ${contactName} (${contactPhone})`);
      console.log(`MESSAGE: "${smsText}"`);
      console.log("===========================================================\n");

      return res.json({
        success: true,
        message: `[Demo Mode] Alert logged to console for ${contactName} (${contactPhone})`,
        mode: 'demo',
        simulatedSms: smsText
      });
    }

  } catch (error) {
    console.error("Server Error in /api/send-sms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`SoulSync Backend listening on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.GEMINI_API_KEY ? 'Production (AI Active)' : 'Demo Mode (Mock AI Active)'}`);
});
