# {D} dreamDEX Analytics Hub

> Independent on-chain market intelligence, verifiable order book depth, real-time trade telemetry, and liquidity analytics for the **dreamDEX** central limit order book (CLOB) on the **Somnia** blockchain.

---

## Official Links & Ecosystem Resources

### Somnia Network
- **Official Website:** [https://somnia.network](https://somnia.network)
- **Developer Documentation:** [https://docs.somnia.network](https://docs.somnia.network)
- **Somnia Block Explorer:** [https://somniascan.com](https://somniascan.com)
- **Alternative Explorer:** [https://explorer.somnia.network](https://explorer.somnia.network)
- **Official X (Twitter):** [https://twitter.com/Somnia_Network](https://twitter.com/Somnia_Network)

### dreamDEX
- **Trading Venue & DApp:** [https://app.dreamdex.io](https://app.dreamdex.io)
- **Protocol Documentation:** [https://app.dreamdex.io/docs](https://app.dreamdex.io/docs)
- **HTTP REST API Reference:** [https://app.dreamdex.io/docs/developers/http-api](https://app.dreamdex.io/docs/developers/http-api)
- **WebSocket Streaming API:** [https://app.dreamdex.io/docs/developers/websocket-api](https://app.dreamdex.io/docs/developers/websocket-api)
- **Official X (Twitter):** [https://twitter.com/dreamdex_io](https://twitter.com/dreamdex_io)

---

## Overview & Core Capabilities

The **dreamDEX Analytics Hub** provides institutional-grade market visibility and verifiable transparency for on-chain traders, market makers, liquidity providers, and researchers.

- **Real-Time CLOB Telemetry:** Direct subscription to live trade fills, ticker quotes, and resting depth levels via WebSocket streaming (`wss://api.dreamdex.io/v0/ws/public`).
- **Verifiable Depth Visualizer:** Visual representation of cumulative bid and ask order distributions relative to market mid-price, with high-contrast depth ribbons and spread tracking.
- **OHLCV Candlestick Engine:** Accurate historical candle series across multiple timeframes (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`) compiled directly from executed order book trades.
- **Liquidity & Gaussian Yield Model:** Mathematical modeling and tracking of dreamDEX's proximity-weighted Gaussian collateral yield algorithm ($W = \exp(-\Delta P^2 / 2\sigma^2)$) incentivizing resting depth near mid-price.
- **Volume Breakdown & Analytics:** 24-hour, 7-day, 30-day, and 90-day volume aggregation across active spot pairs (`SOMI:USDso`, `WETH:USDso`, `WBTC:USDso`, `USDC.e:USDso`).
- **Protocol Activity Stream:** Real-time stream of validated on-chain settlements with transaction hashes linked to the Somnia block explorer.
- **System Health Probes:** Live availability and round-trip latency monitoring of public gateways, RPC endpoints, and WebSocket heartbeats.

---

## Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Type-safe declarative UI components |
| **Bundler** | [Vite 6](https://vitejs.dev/) | Lightning-fast development & optimized production bundling |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + Custom CSS Tokens | Strict monochrome institutional financial terminal design |
| **Animations** | [GSAP 3](https://gsap.com/) + [@gsap/react](https://gsap.com/react) | Narrative scroll reveals and choreography |
| **Web3 / EVM** | [Viem](https://viem.sh/) | Somnia smart contract queries and ABI decoding |
| **Edge Backend** | [Hono](https://hono.dev/) + [Cloudflare Workers](https://workers.cloudflare.com/) | Edge-proxied REST/WS routing with low latency |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent iconography |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lrmn7/dreamdex-analytics.git
   cd dreamdex-analytics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

- `npm run dev` — Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build` — Runs TypeScript compiler check (`tsc`) and compiles the production bundle via Vite.
- `npm run preview` — Locally previews the compiled production build.
- `npm run deploy` — Deploys the application and Cloudflare Worker using [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

---

## Deployment to Cloudflare Workers

The project is structured with Cloudflare Workers / Pages edge compatibility via `@cloudflare/vite-plugin` and `wrangler`:

```bash
# Login to Cloudflare
npx wrangler login

# Deploy to Cloudflare network
npm run deploy
```

---

## License

This project is licensed under the MIT License.
