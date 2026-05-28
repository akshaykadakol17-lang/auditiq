export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const prompt = `You are the audit engine inside AuditIQ, a tool built for OPTYO — a performance marketing agency for sports, fitness, and wellness brands.

Analyse the brand at: ${cleanUrl}

Respond ONLY with valid JSON, no markdown, no explanation, no code blocks. Just raw JSON:
{
  "brandName": "Full brand name",
  "industry": "Specific industry e.g. Performance Apparel",
  "overallScore": 58,
  "scores": {
    "paidMedia": 52,
    "emailMarketing": 65,
    "seo": 44,
    "website": 70
  },
  "findings": [
    {
      "channel": "Paid Media",
      "severity": "high",
      "title": "Specific concrete finding title",
      "detail": "Two sentences. First: the specific gap. Second: the opportunity for OPTYO to add value."
    },
    {
      "channel": "Email Marketing",
      "severity": "medium",
      "title": "Specific finding",
      "detail": "Two specific sentences about this brand."
    },
    {
      "channel": "SEO",
      "severity": "high",
      "title": "Specific finding",
      "detail": "Two specific sentences."
    },
    {
      "channel": "Website",
      "severity": "low",
      "title": "Specific finding",
      "detail": "Two specific sentences."
    }
  ],
  "topPriority": "One sentence naming the single highest-leverage fix for this specific brand.",
  "outreachEmail": {
    "subject": "Compelling subject line referencing a specific finding",
    "body": "Hi [First Name],\n\nI took a look at ${cleanUrl} — [one specific observation that shows you actually looked].\n\n[2-3 sentences referencing 2 specific findings by name. Be concrete, not generic.]\n\nI put together a quick audit covering paid, email, SEO, and site. Happy to walk you through it on a short call.\n\nWorth 20 minutes?\n\n[Your name]\nOPTYO"
  }
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: 'You are a marketing audit engine. You always respond with valid raw JSON only. No markdown. No explanation. No code blocks. Just the JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: 'Groq request failed', detail: err });
    }

    const data = await response.json();
    const text = data.choices[0].message.content.trim();

    let audit;
    try {
      audit = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'Could not parse response', raw: text });
    }

    return res.status(200).json(audit);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
