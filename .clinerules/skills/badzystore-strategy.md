---
name: badzystore-strategy
description: Use when working on BadzyStore (gaming accessory e-commerce, Egypt/Alexandria) — product decisions, marketing copy, positioning, admin/store features, or growth planning. Loads competitor landscape and strategic playbook.
---

# BadzyStore Context

**What it is:** Gaming accessory e-commerce store based in Alexandria, Egypt.
Tech stack: TanStack Start (React 19) + Supabase (Postgres, RLS) + Zustand +
Tailwind v4. Deployed/edited via Lovable. Key routes: shop, product/[slug],
cart, checkout, admin, manage, returns, warranty, FAQ.

**Market position:** Competing against Games 2 Egypt (largest, console-focused,
1.1M+ FB followers, but return/warranty friction and payment UX complaints),
Games World Egypt, HardwareMarket, HQ-Store, The Game Cave Egypt, Alfrensia,
plus marketplaces Amazon Egypt and Noon (price-competitive but weak on
gaming-specific curation/support).

## Core differentiation strategy (from strategy doc)
1. **Returns & warranty as a product feature, not an afterthought** — competitors
   have documented friction here (e.g. refusing returns after 48h on defective
   items). Make the policy generous, visible, and fast.
2. **Trust & payment experience** — COD friction is a recurring complaint
   industry-wide; prioritize a smooth, low-anxiety checkout.
3. **Specialize instead of going broad** — competitors spread thin across
   consoles + PC + generic electronics. Depth in a focused category beats
   breadth here.
4. **Shipping/packaging as a brand moment** — no competitor owns this; unboxing
   experience is a gap.
5. **Community over transactional selling** — UGC, engagement, not just listings.
6. **Alexandria home-base advantage** — faster local fulfillment, local trust,
   local-first marketing before nationwide scale.
7. **Pricing** — compete on value/trust, not a race to the bottom against
   Amazon/Noon on raw price.

## When Cline should apply this
- Writing product copy, landing pages, or marketing content → tone should
  emphasize trust, fast/generous returns, and specialization — not generic
  "best prices" claims that just copy competitors.
- Building store features (checkout, returns flow, admin) → prioritize
  reducing friction at exactly the points competitors are criticized for
  (payment clarity, return windows, order status visibility).
- Any messaging should stay evidence-based — don't fabricate stats about
  competitors or BadzyStore that aren't in the source research.

## Do NOT do
- Don't paste raw competitor complaint quotes verbatim into public-facing copy
  (legal/reputational risk) — paraphrase strategic takeaways only.
- Don't commit `.env` or any file containing `SUPABASE_SERVICE_ROLE_KEY` /
  `ADMIN_PASSKEY` — these must stay server-side only.
