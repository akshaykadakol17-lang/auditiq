# AuditIQ — Marketing Audit Prototype

A proof-of-concept prototype demonstrating the core AuditIQ pipeline built for OPTYO.

## What it does

Enter any brand's website URL. The engine analyses their marketing presence across paid media, email, SEO, and web performance — then generates a scored audit report and a ready-to-send outreach email.

## How it works

```
URL input → AI analysis → Scored audit → Outreach email
```

This prototype demonstrates the core logic of the AuditIQ pipeline. The production version would run inside n8n with Monday.com webhook triggers, real web scraping, and PDF generation — but this shows the end-to-end flow working.

## Stack

- Frontend: Vanilla HTML/CSS/JS
- Backend: Vercel serverless function (Node.js)
- AI: Claude API (claude-sonnet)

## Deploy

1. Clone this repo
2. Connect to Vercel
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy

## Built by

Akshay Kadakol — akshaykadakol17@gmail.com
