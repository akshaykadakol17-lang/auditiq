export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

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
            content: 'You are a marketing audit engine. Always respond with valid raw JSON only. No markdown. No explanation. No code blocks. Just the JSON object.'
          },
          {
            role: 'user',
            content: `Analyse the brand at: ${cleanUrl}. Respond ONLY with this JSON structure:
{
  "brandName": "Full brand name",
  "industry": "Specific industry",
  "overallScore": 58,
  "scores": { "paidMedia": 52, "emailMarketing": 65, "seo": 44, "website": 70 },
  "findings": [
    { "channel": "Paid Media", "severity": "high", "title": "Finding title", "detail": "Two sentences about this specific brand." },
    { "channel": "Email Marketing", "severity": "medium", "title": "Finding title", "detail": "Two sentences." },
    { "channel": "SEO", "severity": "high", "title": "Finding title", "detail": "Two sentences." },
    { "channel": "Website", "severity": "low", "title": "Finding title", "detail": "Two sentences." }
  ],
  "topPriority": "One sentence on the highest-leverage fix.",
  "outreachEmail": {
    "subject": "Subject line",
    "body": "Hi [First Name],\\n\\nI took a look at ${cleanUrl} and a few things stood out.\\n\\n[2-3 specific sentences about their actual gaps.]\\n\\nI put together a quick audit — happy to walk you through it on a short call.\\n\\nWorth 20 minutes?\\n\\n[Your name]\\nOPTYO"
  }
}`
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
      return res.status(500).json({ error: 'Parse failed', raw: text });
    }

    return res.status(200).json(audit);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
