import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import twilio from 'twilio';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
  console.warn('GEMINI_API_KEY is not configured, chat will run in demo mode with fallback responses only.');
} else {
  console.info('GEMINI_API_KEY loaded, Gemini production responses enabled.');
}

app.use(cors({
  origin: '*', // In production, replace with specific origins
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// System prompt for Sol
const SOL_SYSTEM_PROMPT = `You are Sol, a warm, non-judgmental mental wellness companion.
Respond with empathy, emotional awareness, and context-specific support. Keep replies short and human (1-3 sentences), and never provide medical advice.
If the user expresses hopelessness, self-harm intent, or crisis language, acknowledge their pain, validate their experience, and gently invite them to reach out to someone they trust or use their safety circle.
Avoid repeating the same phrases from one response to the next. Reflect on the user's emotion and either mirror it or offer a calm next step. Stay grounded, gentle, and focused on the user's current message.`;

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
  const trimmed = (message || '').trim();
  const text = trimmed.toLowerCase();
  const seed = Math.floor(Math.random() * 3);

  if (riskLevel === 'CRITICAL') {
    return `I can hear how painful this is for you. It's okay to feel overwhelmed right now, and you don't have to carry it alone. Would you like to consider reaching out to someone trusted or your safety circle?`;
  }

  if (text.includes('hello') || text.includes('hi ') || text.includes('hey')) {
    const replies = [
      "Hello. I'm Sol, and I'm here to listen. What are you feeling most clearly right now?",
      "Hi there. I'm glad you reached out. What's on your mind in this moment?",
      "Hey. Thanks for sharing. How are you feeling at the moment?"
    ];
    return replies[seed];
  }

  const reflections = [];

  if (text.includes('anxious') || text.includes('scared') || text.includes('panic')) {
    reflections.push(
      "I can tell your body is on edge. Let's take a moment together and notice what feels the most overwhelming right now."
    );
  }
  if (text.includes('tired') || text.includes('exhausted') || text.includes('sleep')) {
    reflections.push(
      "Your mind and body sound worn out. It may help to acknowledge that you've been carrying a lot today."
    );
  }
  if (text.includes('lonely') || text.includes('alone')) {
    reflections.push(
      "Feeling alone can be so heavy. I'm here with you, and your experience matters."
    );
  }
  if (text.includes('sad') || text.includes('cry') || text.includes('low')) {
    reflections.push(
      "That sounds really painful, and it's okay to feel that sadness. I'm here to hold space for you."
    );
  }

  if (reflections.length > 0) {
    return reflections[seed % reflections.length];
  }

  const genericFallbacks = [
    `Thank you for sharing. I'm listening closely to what you wrote, and I want to support you without judgment.`,
    `That sounds difficult. I'm here with you, and your feelings are valid. What feels most important to say next?`,
    `I can hear that this matters deeply to you. I'm here to listen and stay with you through it.`
  ];
  return genericFallbacks[seed];
}

function getCandidateText(candidate) {
  if (!candidate || !candidate.content || !Array.isArray(candidate.content.parts)) {
    return '';
  }

  return candidate.content.parts
    .map(part => (part && part.text ? part.text : ''))
    .filter(Boolean)
    .join(' ')
    .trim();
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
    const isGeminiEnabled = GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';

    if (isGeminiEnabled) {
      try {
        // Initialize Gemini SDK
        const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = ai.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.85,
            topP: 0.95,
            candidateCount: 3
          }
        });

        const historyContents = (history || []).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        const requestContents = [
          {
            role: 'system',
            parts: [{ text: SOL_SYSTEM_PROMPT }]
          },
          ...historyContents,
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ];

        const result = await model.generateContent({ contents: requestContents });
        const candidates = result?.response?.candidates || [];

        if (!candidates.length) {
          throw new Error('Gemini returned no candidates');
        }

        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        reply = getCandidateText(selected);

        if (!reply) {
          if (typeof result.response.text === 'function') {
            reply = result.response.text();
          }
        }

        if (!reply || !reply.trim()) {
          throw new Error('Gemini returned empty text candidate');
        }
      } catch (geminiError) {
        console.error('Gemini API Error, falling back to mock response:', geminiError);
        if (geminiError && geminiError.stack) {
          console.error(geminiError.stack);
        }
        reply = getMockEmpatheticResponse(message, riskLevel);
      }
    } else {
      console.warn('GEMINI_API_KEY not available, using fallback demo response.');
      reply = getMockEmpatheticResponse(message, riskLevel);
    }

    res.json({
      reply: reply.trim(),
      riskLevel,
      cadenceDistress,
      mode: isGeminiEnabled ? 'production' : 'demo'
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
  console.log(`Environment: ${GEMINI_API_KEY ? 'Production (AI Active)' : 'Demo Mode (Mock AI Active)'}`);
});
