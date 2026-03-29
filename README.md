# TrueOdds - 60% Trap

A fast, mobile-friendly probability simulation game built with React + Vite.

Live site:
https://trueoddscoin.netlify.app

## What It Does

- Start with a configurable balance.
- Pick Heads or Tails each round.
- Place a bet (decimal values supported).
- One configured side is biased by a configurable percentage.
- Try to reach the target balance before going bankrupt or running out of time.

## Config

All main settings are in src/config.js:

- currencySymbol: Display currency symbol.
- totalBalance: Starting balance.
- defaultTheme: "light" or "dark".
- timeMinutes: Round timer duration.
- biasPercent: Probability percentage for the biased side.
- biasSide: "heads" or "tails".
- flipAnimationMs: Flip animation delay.
- resultRevealMs: Result reveal delay after flip.

Example:

```js
export const APP_CONFIG = {
  currencySymbol: "$",
  totalBalance: 25,
  defaultTheme: "light",
  timeMinutes: 5,
  biasPercent: 60,
  biasSide: "heads",
  flipAnimationMs: 2000,
  resultRevealMs: 1000,
};
```

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## UI Notes

- Landing page includes dynamic bias note based on config.
- Results page includes share action (native share, WhatsApp fallback, clipboard fallback).
- About page is accessible from the hamburger menu and includes game rules.

## Deploy

This project is deployed on Netlify.
When Git auto-deploy is connected to the GitHub repository, pushing commits to the production branch triggers a new deployment.

## Copyright

Copyright (c) Vasu Kumar
