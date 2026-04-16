# Product Roadmap — Growth Radar

> Last updated: 2026-04-15
> Format: Each phase ships a complete, demo-able product increment

---

## Guiding Principle

Each phase ends with a product you can **show to a real user and charge for**.
No phase ends with a half-built backend waiting on a frontend, or vice versa.

---

## Phase 1 — "See Yourself" (Digital Audit Engine)
**Goal:** A business can see exactly where their digital presence stands.
**Target:** Functional MVP ready for first paying customers.

### Deliverables
- Company registration + onboarding
- Full digital audit: performance, SEO, social, reputation
- Health Score with AI-generated recommendations
- Audit history + comparison
- PDF report export

### Key Metrics (success = ✓ all of these)
- Audit completes in < 3 minutes for 95% of domains
- Claude recommendations rated "useful" by 80%+ of test users
- First 5 external users complete an audit without asking for help (usability bar)

### Tech milestones
- [ ] Docker Compose local dev environment working
- [ ] FastAPI + Celery + PostgreSQL + Redis running locally
- [ ] Google PageSpeed integration live
- [ ] Claude API integration for recommendations
- [ ] Next.js dashboard rendering first real audit report
- [ ] Deployed on Railway (staging)

**Estimated scope:** 6-8 weeks of focused development

---

## Phase 2 — "See Opportunities" (Lead Discovery Engine)
**Goal:** A business can see a curated list of prospects who need their services.
**Prerequisite:** Phase 1 complete and stable.

### Deliverables
- Service profile setup: user describes what their company offers
- Lead discovery job: AI finds prospects based on service profile + location
- Opportunity score per prospect with explanation ("why this lead")
- Lead management: list, filter, sort, mark status
- Mini-audit preview per prospect (top 3 gaps)

### Key Metrics
- Discovery job returns at least 20 qualified leads per run
- 70%+ of presented leads rated "plausible" by the client
- Average opportunity score correlates with client's actual conversion rate (validated after Phase 3)

### Tech milestones
- [ ] Lead entity and CRUD in database
- [ ] Claude service-description → search-strategy prompt
- [ ] Google Maps + directory scraping for prospect discovery
- [ ] Mini-audit runner (lightweight version of Audit Engine)
- [ ] Opportunity scoring model v1
- [ ] Lead list UI with filters and status management

**Estimated scope:** 6-8 weeks

---

## Phase 3 — "Connect with Them" (Outreach Engine)
**Goal:** A business can contact qualified prospects with personalized messages in one click.
**Prerequisite:** Phase 2 complete and at least 10 active users using lead lists.

### Deliverables
- Campaign creation: select leads, choose channel (email / contact form)
- AI-generated personalized message per lead (preview before send)
- Bulk send with per-day rate limiting
- Tracking: open rates, replies, conversions
- Suppression list management (opt-outs)
- Campaign analytics dashboard

### Key Metrics
- Cold email open rate > 30% (industry average is ~20%)
- Reply rate > 5% (industry average is ~1-3%)
- Zero compliance incidents (no spam reports, no domain blacklisting)

### Tech milestones
- [ ] Resend API integration for email sending
- [ ] Custom sending domain setup per client
- [ ] Claude outreach message prompt (with ai_reasoning stored)
- [ ] Playwright contact form filler
- [ ] Campaign entity + outreach message entity in database
- [ ] Tracking pixel / reply detection
- [ ] Rate limiter middleware for sending jobs
- [ ] Campaign analytics UI

**Estimated scope:** 8-10 weeks

---

## Phase 4 — "Grow with It" (Retention + Monetization)
**Goal:** Turn the product into a sustainable business.
**Prerequisite:** Phase 3 complete with at least 3 customers actively using outreach.

### Deliverables
- Subscription billing (Stripe)
- Tiered plans: Starter (audit only) / Growth (+ leads) / Pro (+ outreach)
- Scheduled re-audits (weekly/monthly auto-audit)
- Email digest: "Your health score changed, here's what happened"
- Agency mode: manage multiple client companies under one account
- Spanish-language UI (LATAM focus)

### Tech milestones
- [ ] Stripe Checkout + webhook integration
- [ ] Plan-based feature gating middleware
- [ ] Scheduled Celery beat jobs for recurring audits
- [ ] Email notification system (audit complete, new leads, replies)
- [ ] Multi-company account structure
- [ ] i18n setup for Spanish

**Estimated scope:** 4-6 weeks

---

## Future Exploration (Post Phase 4)

These are not committed — evaluate based on user feedback and traction:

- **Browser extension** — audit any competitor's site in one click
- **CRM integration** — sync leads and contacts to HubSpot, Pipedrive
- **Social media automation** — schedule posts to improve social score
- **Competitor tracking** — alert when a competitor's score improves significantly
- **Marketplace** — connect businesses with verified service providers to fix specific gaps
- **White-label** — agencies resell Growth Radar under their own brand

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Google PageSpeed API rate limits | Medium | High | Cache results, request quota increase |
| SerpAPI costs scale unexpectedly | Medium | High | Set hard spend limits, evaluate DataForSEO as cheaper alternative |
| Cold email deliverability degrades | High | Critical | Dedicated sending domains, strict rate limits, warm-up sequences |
| LinkedIn / Instagram block scraping | High | Medium | Use official APIs where available, fail gracefully |
| Legal challenge for cold email | Low | Critical | Full CAN-SPAM / GDPR compliance from day 1, legal review before Phase 3 launch |
| Claude API latency spikes during audits | Low | Medium | Queue-based architecture absorbs spikes, SLA monitoring |

---

## Decision Log

Decisions made and why — to avoid revisiting settled questions.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-15 | Python + FastAPI for backend | Best ecosystem for AI/scraping tasks, async-native |
| 2026-04-15 | Start with Phase 1 only (audit) | Immediate value, no legal risk, validates core data collection |
| 2026-04-15 | Target LATAM market first | Underserved, price-tolerant, lower English-tool competition |
| 2026-04-15 | Claude API for all AI tasks | Best reasoning for analysis + message generation, matches dev environment |
| 2026-04-15 | Railway for initial hosting | Fastest path from code to deployed URL without DevOps overhead |
