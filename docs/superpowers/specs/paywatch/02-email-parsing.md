# PayWatch — Email Parsing Pipeline

**Source:** `2026-03-27-paywatch-design.md` section 4
**Status:** Approved

---

## Flow

```
Gmail API -> Fetch unread messages since last_synced_at
   |
   v
Filter: subject/sender heuristics (keywords: "bill", "statement",
        "payment", "invoice", "due", "autopay", known biller domains)
   |
   v
For each candidate email:
   |
   |-> Match against known billers (sender domain + subject pattern)
   |     |
   |     |-> Match found -> Rule-based extraction (regex on HTML/text body)
   |     |     -> Extract: biller name, amount, due date
   |     |     -> confidence: 0.90-1.00
   |     |
   |     |-> No match -> LLM extraction (structured output)
   |           -> Prompt: "Extract biller, amount, due_date from this email"
   |           -> confidence: 0.60-0.90
   |
   v
Validate extracted data (amount > 0, due_date is future or recent past)
   |
   v
Upsert bill record + update/create biller
   |
   v
Run fee detection engine on new bill
   |
   v
Update last_synced_at
```

## Rule-Based Parser

A registry of known biller patterns stored as configuration (not database):

```typescript
type BillerRule = {
  name: string;
  senderPatterns: string[];      // e.g., ["netflix.com", "info@netflix.com"]
  subjectPatterns: RegExp[];     // e.g., [/your .* statement/i]
  extractors: {
    amount: RegExp;              // Applied to email body
    dueDate: RegExp;
  };
};
```

Initial rules for common billers: Netflix, Spotify, Chase, Amex, Con Edison, AT&T, Verizon, AWS, Google Cloud, Adobe, etc. (~20 rules to start).

## LLM Fallback

- Provider: OpenAI (`gpt-4o-mini`) or Anthropic (`claude-3-haiku`) -- cheapest model that handles structured extraction
- Input: Email body text (stripped HTML), truncated to 2000 tokens
- Output: JSON schema `{ biller: string, amount: number, due_date: string | null }`
- Rate limiting: Max 50 LLM calls per sync cycle per user
- Cost control: Only invoked when rule-based parser fails to match
