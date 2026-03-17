# Oreva — AI Agent on pump.fun

Oreva is a tokenized AI agent on [pump.fun](https://pump.fun). One prompt generates stunning images, builds websites, and creates videos. Every paid generation creates an on-chain Solana payment — 85% of revenue is used to buy back and burn $OREVA automatically.

Built on top of the [Pump.fun Agent Payments SDK](https://github.com/pump-fun/pump-fun-skills).

---

## How It Works

1. User requests a generation (image / video / code)
2. Oreva creates a Solana invoice
3. User signs and sends the payment transaction
4. Oreva verifies payment on-chain via `PumpAgent.validateInvoicePayment`
5. Generation runs and is delivered
6. 85% of revenue buybacks $OREVA — all bought tokens are burned

---

## Pricing

| Generation  | Price     | Details                          |
|-------------|-----------|----------------------------------|
| Chat & Code | 0.003 SOL | 8k context, live preview, export |
| Image       | 0.005 SOL | Up to 4K, 1:1 / 16:9 / 9:16, oreva.v1 |
| Video       | 0.01 SOL  | 5s–30s, 720p–4K, 24/30fps, MP4  |

---

## Revenue Distribution

| Allocation  | Share |
|-------------|-------|
| Buyback     | 85%   |
| Burn        | 85%   |
| Operations  | 15%   |

All bought-back tokens are sent to a dead wallet and permanently removed from circulation.

---

## JavaScript SDK

### Installation

```bash
npm install oreva-sdk
```

### Quick Start

```javascript
import { OrevaClient } from 'oreva-sdk';

const client = new OrevaClient({
  apiKey:  'your_api_key',
  baseUrl: 'https://oreva-7ti0.onrender.com', // optional
  timeout: 30000,                              // optional, ms
  retries: 3                                   // optional
});

// Chat
const reply = await client.chat.send('Hello');

// Code generation
const code = await client.code.generate('Create a responsive navbar');

// Image generation
const image = await client.image.generate('A futuristic city at night');

// Video generation
const video = await client.video.generate('Ocean waves at sunset');
```

### Modules

| Module | Description |
|--------|-------------|
| [`chat`](./modules/chat.js)   | Conversational AI with context awareness     |
| [`code`](./modules/code.js)   | HTML/CSS/JS code generation and editing      |
| [`image`](./modules/image.js) | AI image generation from text prompts        |
| [`video`](./modules/video.js) | AI video generation from text prompts        |

### Error Handling

```javascript
import { OrevaError, RateLimitError, AuthError } from 'oreva-sdk';

try {
  const reply = await client.chat.send('Hello');
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log('Rate limit hit, retry after:', err.retryAfter);
  } else if (err instanceof AuthError) {
    console.log('Invalid API key');
  } else {
    console.log('Error:', err.message);
  }
}
```

---

## Payment Endpoints

### Create Invoice

```
POST /api/payments/invoice
```

**Request**
```json
{
  "type": "image",
  "payer": "<solana_wallet_address>"
}
```

**Response**
```json
{
  "invoiceId": "string",
  "transaction": "<base64_encoded_transaction>",
  "amount": 0.005,
  "expiresAt": "2025-01-01T00:05:00.000Z"
}
```

### Verify Payment

```
POST /api/payments/verify
```

**Request**
```json
{
  "invoiceId": "string"
}
```

**Response**
```json
{
  "paid": true,
  "invoiceId": "string",
  "amount": 0.005,
  "paidAt": "2025-01-01T00:00:00.000Z"
}
```

---

## Pump.fun SDK Integration

```bash
npm install @pump-fun/agent-payments-sdk
```

### Initialize Agent

```javascript
import { PumpAgentOffline } from "@pump-fun/agent-payments-sdk";

const agentInitializeIx = await PumpAgentOffline.load(mint).create({
  authority:      creator,
  mint,
  agentAuthority: creator,
  buybackBps:     8500, // 85% of revenue to buyback & burn
});
```

### Verify Payment (Backend)

```javascript
import { PumpAgent } from "@pump-fun/agent-payments-sdk";

const agent = new PumpAgent(OREVA_MINT, "mainnet", connection);
const paid  = await agent.validateInvoicePayment({ user, currencyMint, amount, memo, startTime, endTime });

if (paid) {
  // fulfill generation request
}
```

### Generate Invoice (Backend)

```javascript
const agent = PumpAgentOffline.load(OREVA_MINT, connection);

const { invoiceId, transaction } = await agent.buildAcceptPaymentInstructions({
  user:         userWalletAddress,
  currencyMint: SOL_MINT,
  amount:       5000000, // lamports
  memo:         Date.now(),
  startTime,
  endTime,
});
```

---

## Token

| Field    | Value                              |
|----------|------------------------------------|
| Ticker   | $OREVA                             |
| Chain    | Solana                             |
| Platform | pump.fun                           |
| Buyback  | Every generation, automatic        |
| Burn     | 100% of bought-back tokens burned  |

---

## Project Structure

```
api/
├── index.js           — main entry point
├── client.js          — base HTTP client
├── SKILL.md           — this file
├── modules/
│   ├── chat.js        — chat module
│   ├── code.js        — code generation module
│   ├── image.js       — image generation module
│   └── video.js       — video generation module
└── utils/
    ├── errors.js      — custom error classes
    └── validator.js   — input validation helpers
```

---

## Links

- Website — [oreva.xyz](https://oreva.xyz)
- X — [@orevaagent](https://x.com/orevaagent)
- GitHub — [orevaagent/Oreva-PumpFun-Agent](https://github.com/orevaagent/Oreva-PumpFun-Agent)
- pump.fun — [pump.fun](https://pump.fun)
