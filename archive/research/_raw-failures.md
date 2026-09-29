# Adversarial postmortem research (raw)

**Product context:** HACK47 OFFGRID. Date of this pass: **21 Sep 2026**.  
**Rule:** evidence only. No application code. Status is verified as of this fetch, not assumed from memory.  
**Not a recommendation list.** Nothing here is a product to copy. Web3 / offensive-security products are out of scope.

## Method (what actually ran)

- `agent-reach doctor --json` first. Live: Jina Reader (`web`), V2EX, RSS, YouTube, Bilibili search. GitHub `gh` present but Doctor did not live-verify auth. Exa via mcporter: configured, then **hit free MCP 429** on some calls; later calls succeeded. Reddit / Twitter / LinkedIn not usable this pass.
- **Exa** (`mcporter call exa.web_search_exa`) for named companies.
- **Jina** (`curl -s "https://r.jina.ai/URL"`) for primary pages.
- **HN Algolia** (`https://hn.algolia.com/api/v1/search`).
- **GitHub** (`gh search repos`, `gh api repos/...`).
- Product Hunt: no authenticated PH API; used Exa hits that claimed PH launch postmortems.
- Failory homepage loaded; cemetery **did not yield a usable AI-devtools list** in the scrape. layoffs.fyi homepage loaded; **company table did not render** (JS). Sacra: not used (no successful page body). The Verge, Fortune, NYT: several Jina fetches returned **403 abuse / paywall**. Those URLs are cited only when another source independently carried the same fact.

Status labels used below:

| Label | Meaning |
|---|---|
| SHUTDOWN | Company or product stopped; primary notice or court/press on insolvency |
| ACQUIHIRE / PRODUCT SUNSET | Team/IP taken; original product wound down or gutted |
| PIVOT | Founders say they abandoned the original product |
| STAGNATION | Still exists; original thesis failed or usage collapsed |
| TRUST FAILURE | Still operating; the lesson is backlash / regulation / false claims |
| UNVERIFIED | Searched; could not confirm from a loadable primary |

---

## 1. Adept AI — generic enterprise “AI teammate”

- **URLs:** https://www.adept.ai/blog/adept-update · https://techcrunch.com/2024/06/28/amazon-hires-founders-away-from-ai-startup-adept/ · HN 28 Jun 2024 (6 pts): https://news.ycombinator.com/item?id=40825051 · playbook recap: https://www.theverge.com/2024/7/1/24190060/amazon-adept-ai-acquisition-playbook-microsoft-inflection
- **What it did:** Train multimodal models to *use existing software* as an enterprise agent (“AI teammate” that clicks through workplace apps).
- **Evidence (ACQUIHIRE / PRODUCT GUTTED, not a proven 2026 corpse):** Adept’s **28 Jun 2024** blog: co-founders and some staff join Amazon AGI; Amazon licenses “agent technology, family of state-of-the-art multimodal models, and a few datasets”; remaining company “focus entirely on solutions that enable agentic AI” under a new CEO. TechCrunch same day: raised **>$415M**, ~**$1B** valuation; “struggled to bring any product to market despite months and months of testing.” Jina fetch of https://www.adept.ai/ on 21 Sep 2026 returned **Cloudflare 403**, so current public site status is **not independently confirmed** here.
- **Why it looked valuable:** The painful job is real (tedious multi-app workflows). Demo of an agent driving Salesforce/browsers looks like the future of work.
- **Why it failed anyway:** (1) **Foundation-model economics** — Adept itself said continuing both AGI training *and* a product required endless fundraising. (2) **Incumbent absorption** — Amazon hired the founders and licensed the stack, same playbook as Microsoft/Inflection. (3) **Crowding** — TC notes Orby, Emergence, OpenAI, Rabbit all chasing “agent uses your software.” (4) **Demo vs production** — beta “dozens of steps” is not a shipped category winner.
- **Hackathon lesson:** A 3-week “generic agent that uses any tool” is Adept’s graveyard in miniature. Judges will compare you to Copilot/ChatGPT computer-use, not to a 2023 demo reel.

---

## 2. Inflection AI / Pi — “personal AI” chatbot

- **URLs:** https://techcrunch.com/2024/03/19/after-raising-1-3b-inflection-got-eaten-alive-by-its-biggest-investor-microsoft/ · https://www.reuters.com/technology/microsoft-agreed-pay-inflection-650-mln-while-hiring-its-staff-information-2024-03-21/ · https://techcrunch.com/2024/08/26/five-months-after-microsoft-hired-its-founders-inflection-adds-usage-caps-to-pi/ · UK CMA treated the deal as an acquisition of an enterprise (merger review PDFs indexed by Exa).
- **What it did:** Consumer companion chatbot **Pi** (“more personal AI”), own foundation models, huge GPU fleet.
- **Evidence (ACQUIHIRE + PIVOT):** Mar 2024: Microsoft hires co-founders Mustafa Suleyman and Karén Simonyan and most of ~70 staff; ~**$650M** licensing / non-sue package reported by Reuters/Bloomberg/The Information via TC. Inflection had raised **$1.3B** (Jun 2023) after **$225M** (2022), **$4B** valuation. Remaining shell pivots to “AI studio” for enterprises. Aug 2024 TC: company had been **planning to sunset Pi**, then reversed; added **usage caps**; “no immediate changes” in March was widely read as a death warrant.
- **Why it looked valuable:** Memory + warmth vs ChatGPT; celebrity founders (DeepMind, LinkedIn); Microsoft as both investor and customer.
- **Why it failed anyway:** **Incumbent bundling + compute arms race.** Microsoft also backs OpenAI. Google has distribution in search. Pi was “fine” (TC) and expensive. Personal-AI thesis never cleared ChatGPT/Gemini/Claude. Talent deal is the actual exit.
- **Hackathon lesson:** “A nicer chatbot that remembers you” is not a wedge. Distribution and model quality sit with labs that can hire your whole team.

---

## 3. Humane AI Pin — smartphone-replacement wearable

- **URLs (primary):** https://support.humane.com/hc/en-us/articles/34374173951373-Important-Update-for-Consumer-Ai-Pin-Customers · https://techcrunch.com/2025/02/18/humanes-ai-pin-is-dead-as-hp-buys-startups-assets-for-116m/ · https://www.reuters.com/markets/deals/ai-startup-humane-wind-down-wearable-pin-business-sell-assets-hp-2025-02-19/ · HN 2025-02-18: “HP is buying Humane and shutting down the AI Pin”
- **What it did:** $499–$699 chest-worn AI pin + subscription; voice/laser display; pitched as post-phone.
- **Evidence (SHUTDOWN of the product):** Customer letter: consumer Pin **wound down immediately**; devices work until **12:00 PST 28 Feb 2025**, then **no server connection**, data **permanently deleted**. HP buys assets for **$116M** (CosmOS, patents, team → “HP IQ”). Humane had raised **>$230M** (TC) / **$240M** (NYT via Exa). TC: returns **outpaced sales** (citing Verge; Verge itself 403’d this pass). Sought sale at **$750M–$1B** (Bloomberg via TC). Refunds only inside 90-day window.
- **Why it looked valuable:** Ex-Apple founders; Sam Altman-linked capital; CES-class “the phone is over” story.
- **Why it failed anyway:** **Hardware + cloud + incomplete agent.** Reviewers found it hot, slow, and worse than a phone. Battery-fire charging-case scare. Bricking paying customers destroyed trust. The OS/IP was the only salvageable asset — and it went to an incumbent PC vendor, not a new category.
- **Hackathon lesson:** If the demo requires a new device, a subscription, and your servers, you can strand users in days. OFFGRID must not hostage notes to a hosted brain.

---

## 4. Rabbit R1 — “Large Action Model” gadget

- **URLs:** Launch/hype coverage via Exa. **Not shutdown** as of a **5 Aug 2026** review: https://www.layer3labs.io/gear/reviews/rabbit-r1 (“still shipping… still getting updates in 2026”). Secondary teardown https://kasspian.com/teardowns/rabbit-r1 (29 Jun 2026) attributes to The Verge (Sep 2024) that ~**5,000 of ~100,000** buyers were active; **The Verge URL 403’d** this pass — treat that usage number as **unverified here**. HN/CES coverage of the 2024 launch is abundant; original promise was a $199 Teenage Engineering box that *drives your apps*.
- **What it did:** Handheld “agent” that would book Uber, play Spotify, etc., via a “LAM.”
- **Evidence (STAGNATION of original thesis, company still alive):** Layer3Labs 2026: original agent vision **has not arrived at consumer scale**; still not the demo. Kasspian (secondary): Android app-on-a-phone critique; battery; failed actions. Cubix “post-mortem” (May 2026) is SEO-ish — not used as a fact source.
- **Why it looked valuable:** Agentic “words → actions” is the right *category name*. Pre-order virality (~$10M / 100k units in secondary recaps).
- **Why the original product failed anyway:** **Demo vs production** + **no reason for hardware**. Phone already has the apps. Cloud LAM was slow/wrong. A second device that does less than the pocket computer is a souvenir.
- **Hackathon lesson:** Do not ship the *story of an agent*. Ship one job that works every time. Pre-orders / PH upvotes measure narrative, not retention.

---

## 5. Builder.ai — “AI builds your app”

- **URLs:** https://restofworld.org/2025/builderai-ai-explainer-bankrupt/ · https://restofworld.org/2025/builderai-ai-apps-downfall/ · https://techcrunch.com/2025/05/20/once-worth-over-1b-microsoft-backed-builder-ai-is-running-out-of-money/ · https://www.bloomberg.com/news/articles/2025-06-05/builder-ai-files-for-bankruptcy-after-creditors-seize-accounts · https://www.nytimes.com/2025/08/31/technology/builder-ai-collapse.html (title/abstract via Exa)
- **What it did:** Chatbot “Natasha” supposedly builds ~80% of an app; Lego-like feature blocks; marketed as AI software factory.
- **Evidence (SHUTDOWN / Ch.7):** May 2025 insolvency after Viola Credit seized cash; Jun 2025 US Chapter 7; NYT: **$1.5B → 0**; reported FY2023 revenue **$157M vs actual $42M**, FY2024 **$217M vs $51M** (NYT via Indian Express reprint in Exa). Rest of World: humans in India/Ukraine did most of the work; “AI washing”; customers walked from slow delivery. Microsoft + QIA among backers; ~**$445M** raised.
- **Why it looked valuable:** “Describe an app, get an app” is the most sellable sentence in software. Unicorn optics, Microsoft logo.
- **Why it failed anyway:** **The demo was a staffing company.** Economics of human delivery + alleged revenue inflation + debt seizure. When the AI cannot do the job, burn and fraud fill the gap until a creditor notices.
- **Hackathon lesson:** If the wow-path is a stub plus “AI,” you are Builder in week 1. Judges will paste garbage in and see whether a human would have to finish it.

---

## 6. Jasper AI — GPT wrapper unicorn, then the model vendor shipped the UI

- **URLs (primary-ish):** https://www.jasper.ai/blog/july-11-important-update-from-ceo (10 Jul 2023 CEO layoff / “AI copilot for marketing teams”) · https://www.theinformation.com/articles/jasper-an-early-generative-ai-winner-cuts-internal-valuation-as-growth-slows (28 Sep 2023; paywalled, **title used as evidence of the cut**) · Jasper still has a live marketing site as of this Jina fetch (GEO/agents pages). Secondary teardowns (Shuttergen 15 May 2026, Capital & Clarity Feb 2026) claim peak ARR ~**$120M → ~$55M** and ~20% internal valuation cut; **those ARR numbers are not independently re-verified here.** **Do not use** UnicornBurn’s “Closed 2023” — it contradicts Jasper’s own site and 2025 CEO update URL.
- **What it did:** GPT-3 templates for ads/blogs; early gen-AI marketing winner; **$125M at $1.5B** (Oct 2022, widely reported).
- **Evidence (STAGNATION / PIVOT, not shutdown):** Official 2023 layoff post: ChatGPT-era landscape, cut roles, focus on mid-market/enterprise marketing. Company **still ships in 2026**. The *original* “pay us $499/mo to wrap OpenAI” thesis is dead.
- **Why it looked valuable:** Before ChatGPT, a friendly UI on GPT-3 *was* the product. Real revenue, real customers, unicorn round.
- **Why it failed anyway:** **Incumbent shipped the interface for free.** Wrapper moat was timing, not workflow depth. Valuation locked in a future that reversed in weeks.
- **Hackathon lesson:** If ChatGPT/Claude/Gemini can do the job in the empty textarea, you do not have a product. Depth has to be *the user’s messy artifacts → a shippable artifact they cannot get from a chat tab*.

---

## 7. Mutable.ai — AI codebase wiki / “automate corporations”

- **URLs:** YC directory **Acquired** as of 21 Sep 2026: https://www.ycombinator.com/companies/mutable-ai · Launch HN 24 Feb 2022 (82 pts): https://news.ycombinator.com/item?id=30458465 · Show HN Auto Wiki: https://wiki.mutable.ai · **Ask HN 29 Dec 2024:** https://news.ycombinator.com/item?id=42542512 “Everything from them is down. Twitter, website.. EDIT: The CEO gave up. He is working at google”
- **What it did:** YC W22; later **Auto Wiki** (code → Wikipedia-style articles with citations). Positioning on YC: “Artificially Intelligent Corporations.”
- **Evidence (ACQUIHIRE / SITE DEAD):** YC status **Acquired**. HN Dec 2024: public surfaces down; CEO Omar Shams linked to Google. Jina fetch of http://mutable.ai/ on 21 Sep 2026: **hostname would not resolve**. GitHub org `mutable-ai/mutable` **404**. No loadable founder shutdown essay found.
- **Why it looked valuable:** Code understanding is a real pain; wiki-from-repo is a crisp demo; HN traction on Auto Wiki (183 pts Jan 2024).
- **Why it failed anyway:** **Crowding + Copilot/Cursor incumbents** ate “chat with repo.” Public product disappeared; talent went to Google. A clever RAG trick is not a company once every IDE ships the same trick.
- **Hackathon lesson:** “Chat/wiki over a GitHub repo” is a crowded graveyard. If Afterhours is *only* summarising a repo, Mutable already died of that.

---

## 8. Sweep (sweep.dev) — issue-to-PR “AI junior developer” → JetBrains plugin

- **URLs:** Launch HN 3 Aug 2023 (198 pts): https://news.ycombinator.com/item?id=36987454 · README now: https://github.com/sweepai/sweep · Founder pivot essay on HN: https://news.ycombinator.com/item?id=44573539 · YC: https://www.ycombinator.com/companies/sweep · Live product: https://sweep.dev/
- **What it did originally:** YC S23 bot that **turns GitHub issues into PRs** (“AI junior developer,” 7.6k+ stars).
- **Evidence (PIVOT; original agent SUNSET):** Repo **not archived**, last push **18 Sep 2025**, **7711** stars, description **“Sweep: AI coding assistant for JetBrains.”** README: “Thank you for all of the support… We’re now building an AI coding assistant for JetBrains.” Founders on HN: GitHub agent MVP in 4 days; **throughout 2024 almost all users moved to Cursor**; “this was many years out”; pivoted off the standalone agent. Current YC blurb: autocomplete for IntelliJ, “smarter than Cursor Tab.”
- **Why it looked valuable:** Tickets → PRs is the exact painful job. Open source, Launch HN love, self-host story.
- **Why the original failed anyway:** **Reliability + incumbent IDE agents.** Background agents that open mediocre PRs lose to in-editor Copilot/Cursor. The GitHub-bot form factor is a demo; daily coding happens in the IDE. Sweep *survived by abandoning the hackathon-shaped product.*
- **Hackathon lesson:** Kill “AI that opens PRs / pays down tech debt autonomously.” Sweep’s own founders called it years too early after shipping it.

---

## 9. Magician (Diagram) — Figma AI plugin

- **URLs:** Figma acquisition post **21 Jun 2023:** https://www.figma.com/blog/ai-the-next-chapter-in-design/ · Magician intro: https://blog.diagram.com/p/introducing-magician · Figma on Magician’s text API: https://www.figma.com/blog/how-magician-uses-figmas-text-review-api/ · Forum: plugin “no longer available” after acquisition https://forum.figma.com/ask-the-community-7/magician-access-key-33673 · HN 2023-06-21: “Diagram has been acquired by Figma”
- **What it did:** Figma plugin (Magic Icon / Image / Copy) from Diagram.
- **Evidence (ACQUIHIRE / PLUGIN SUNSET):** Figma: “Figma has acquired Diagram… welcome Jordan, Siddarth, Andrew, Marco, and Vincent.” Magician.design **did not load** this pass (Jina `ERR_BLOCKED_BY_CLIENT`). Figma community thread: Magician parent acquired; plugin gone; features expected inside Figma AI.
- **Why it looked valuable:** Designers already live in Figma; GPT-3 icon/copy demos went viral.
- **Why it failed as a standalone anyway:** **The platform bought you and shipped the feature.** ~100 AI Figma plugins already existed (Figma’s own post). Plugin businesses on someone else’s canvas are options, not companies.
- **Hackathon lesson:** Do not build the feature GitHub / Linear / Google / Figma will toggle on next quarter. Afterhours cannot be “AI in the host app.”

---

## 10. Rewind.ai → Limitless — lifelog + Pendant, then Meta

- **URLs:** TC 5 Dec 2025: https://techcrunch.com/2025/12/05/meta-acquires-ai-device-startup-limitless/ · Reuters: https://www.reuters.com/business/meta-acquires-ai-wearables-startup-limitless-2025-12-05/ · 9to5Mac: https://9to5mac.com/2025/12/05/rewind-limitless-meta-acquisition/ · HN: https://news.ycombinator.com/item?id=46166356 (28 pts) and https://news.ycombinator.com/item?id=46169414
- **What it did:** Desktop “record everything you see/hear” (Rewind); rebrand Limitless; **$99 Pendant** that records conversations.
- **Evidence (ACQUIHIRE / PRODUCT SUNSET):** Limitless acquired by Meta (Reality Labs wearables). **Stop selling Pendant**; support existing devices **≥1 year**; **Rewind capture disabled from 19 Dec 2025**; EU/UK and other regions **cut off 19 Dec 2025** with data deletion. HN: users deleting data rather than give Meta their life log; comments that the stack was “mic + GPT/Claude.”
- **Why it looked valuable:** Searchable memory of your workweek is the fantasy behind every “second brain.” Sam Altman-linked raise cited in secondary roundups.
- **Why it failed anyway:** **Trust + hardware + acquihire.** Always-on recording is a consent/privacy bomb. The useful part (local rewind) was kneecapped instead of open-sourced. Meta wanted wearables talent, not to run your Mac archive. HN user: “feels like a failure… community feels betrayed.”
- **Hackathon lesson:** If the product requires capturing *other people* or *everything on screen*, trust dies first. Local-first notes that later phone home to an acquirer is Rewind’s ending. Afterhours should keep the week’s notes **in the session**, exportable, not as a life-log SaaS.

---

## 11. Hopin — pandemic unicorn fire sale

- **URLs:** https://meetings.skift.com/hopin-fire-sale-confirmed/ (SEC: RingCentral paid **$15M** upfront for Events + Session, up to $50M earnout) · HN: “Hopin Sold for $15M After Raising $1B” · Sifted liquidation URL https://sifted.eu/articles/hopin-liquidation-news **cookie-walled this pass** — UK-liquidation *headline* indexed by HN (2024-02-26) but **body not verified here**.
- **What it did:** Virtual events platform; peak valuation **$7.75B**; **>$1B** raised; 1,200 staff.
- **Evidence (FIRE SALE / CORE PRODUCT DIVESTED):** Skift + RingCentral 8-K: **$15M** for the events products that defined the company. Timeline of 2022 layoffs (12%, then 29%). Data-co-ownership model alienated planners.
- **Why it looked valuable:** COVID made “virtual conferences” look like a new default. Fastest-growing European startup narrative.
- **Why it failed anyway:** **Timing / demand shock.** In-person came back; virtual events commoditized; valuation was easy-money. Marketplace/data grab fought the actual buyer (event planners).
- **Hackathon lesson:** A theme-shaped product (build for the *moment*) dies when the moment ends. OFFGRID’s theme is a trap if you build “offline/survival” bait instead of a job that exists in October *and* November.

---

## 12. Bench (Bench.co) — bookkeeping SaaS, holiday shutdown

- **URLs:** Shutdown notice via TC 27 Dec 2024: https://techcrunch.com/2024/12/27/bench-shuts-down-leaving-thousands-of-businesses-without-access-to-accounting-and-tax-docs/ · Revival/acquisition: https://techcrunch.com/2024/12/30/bench-to-be-acquired-after-abruptly-shutting-down/ · Debt: https://techcrunch.com/2025/01/16/failed-fintech-startup-bench-racked-up-over-65-million-in-debt-documents-reveal/ · Burn: https://techcrunch.com/2025/02/05/bench-burned-through-135-million-before-shutting-down/ · Bloomberg via Exa: “Once-Hot Accounting Fintech Bench Bet on AI — and Found Itself in Bankruptcy” (19 Feb 2025)
- **What it did:** Human + software bookkeeping for SMBs; **$113M** raised (Shopify, Bain); claimed tens of thousands of US customers.
- **Evidence (SHUTDOWN then distressed sale):** Site notice **27 Dec 2024**: platform “no longer accessible”; download window; told customers to file IRS extensions. Staff cut with no severance that day. Canadian bankruptcy **7 Jan 2025**; **~$65.4M** liabilities vs **$2.8M** cash (TC conversion). Employer.com weekend deal. Bloomberg: late AI/automation push (BenchGPT) after years of unprofitable human delivery.
- **Why it looked valuable:** SMB bookkeeping is a hated, recurring job. Real customers, real documents, real switching costs.
- **Why it failed anyway:** **Unit economics + venture debt + hostage data.** Could not reach profit; bank called the loan; **customers locked out at tax season**. AI was a last-ditch margin story, not a product.
- **Hackathon lesson:** Never hold the user’s records behind your server with no local copy. A “helpful agent” that vanishes with the notes is Bench on a 3-week clock. Afterhours must export the brief the user can keep.

---

## 13. Humanloop — LLM eval / prompt / observability platform

- **URLs:** Official: https://humanloop.com/ (“Humanloop joins Anthropic… As we sunset the Humanloop platform”) · Customer email on HN 17 Jul 2025: https://news.ycombinator.com/item?id=44592216 (**sunset 8 Sep 2025**; UI/API gone; data deleted after)
- **What it did:** YC S20 → LLM evals, prompt management, logging — “first development platform for LLM applications” (their words).
- **Evidence (ACQUIHIRE / PRODUCT SUNSET):** Anthropic hiring + **explicit product kill**. This is the cleanest eval/observability shutdown found this pass. LangSmith (LangChain) still marketed as alive in older HN hits — **not** a failure.
- **Why it looked valuable:** Every team that ships an LLM needs evals. Category looked like Datadog-for-prompts.
- **Why it failed anyway:** **Incumbent model lab absorbed the tooling team and turned off the independent product.** Customers who built workflows on Humanloop had to migrate. Category still crowded (LangSmith, etc.); the independent layer is easy to sunset in an acquihire.
- **Hackathon lesson:** Do not make OFFGRID an “eval dashboard for agents.” The labs and clouds will bundle it, then delete your login.

---

## 14. AgentGPT (Reworkd) — generic autonomous agent in the browser

- **URLs:** https://github.com/reworkd/AgentGPT · site https://agentgpt.reworkd.ai/ · HN 2023 launches
- **Evidence (ARCHIVED / STAGNATION):** GitHub **archived**, **36,289** stars, last push **29 Apr 2025**. README still: “Name your own custom AI and have it embark on any goal imaginable.” Classic 2023 AutoGPT clone.
- **Why it looked valuable:** Viral “give it a goal” demo; tens of thousands of stars overnight.
- **Why it failed anyway:** **No wedge, no reliability, no buyer.** Autonomous loops that “think of tasks” do not finish professional work. Stars ≠ retention. The repo is a museum of the generic-agent bubble.
- **Hackathon lesson:** Kill any OFFGRID idea whose one-liner is “an agent that does anything.” AgentGPT already did the demo.

---

## 15. gpt-engineer — “describe software, watch AI write it” CLI

- **URLs:** https://github.com/AntonOsika/gpt-engineer (archived; description: “Precursor to: https://lovable.dev”) · **55,091** stars, last push **14 May 2025**
- **Evidence (ARCHIVED PRECURSOR):** README (via `gh`): “OG code generation experimentation platform”; points survivors to gptengineer.app / Aider. The **experiment** is archived; the team’s later managed product (Lovable) is a different, narrower wedge (prompt-to-app), not proof that the CLI agent was a business.
- **Why it looked valuable:** Natural-language → working repo is the eternal demo.
- **Why the original form stalled:** Unopinionated “AI writes a codebase” is a toy. Production needs a specific surface (web app, hosted preview) and taste. The archive is what happens when you stop at the experiment.
- **Hackathon lesson:** A generic codegen agent is not a 3-week product. If you cannot name the *one artifact* a professional already owes someone tomorrow, you are gpt-engineer in 2023.

---

## 16. Reor — local-first AI notes / PKM

- **URLs:** https://github.com/reorproject/reor · site https://reorproject.org
- **Evidence (ARCHIVED):** GitHub: **“This repository was archived by the owner on Mar 7, 2026.”** **8,553** stars, last push **13 May 2025**. Local markdown + Ollama + vector DB + RAG Q&A. (Cinqic/Cinqic-Notes also archived 17 Sep 2026 with “Development paused” — **0 stars**, too small to treat as a market signal.)
- **Why it looked valuable:** Privacy, local models, Obsidian-like editor — the “anti-Rewind” architecture.
- **Why it stalled anyway:** **Obsidian/Logseq already own local notes.** Adding local RAG is a feature, not a switch. Maintenance of desktop + models is thankless; archive date is the tell. Local-first without a painful *job* (not “second brain”) does not retain.
- **Hackathon lesson:** “Local notes + LLM” is a graveyard next to Obsidian. Afterhours can be local-first, but the output must be a **brief someone ships**, not another vault.

---

## 17. Character.AI — companion scale, then Google ate the founders

- **URLs:** HN 2 Aug 2024 (116 pts): https://techcrunch.com/2024/08/02/character-ai-ceo-noam-shazeer-returns-to-google/ · HN 29 Oct 2025 (93 pts): https://www.nytimes.com/2025/10/29/technology/characterai-underage-users.html (“Character.ai to bar children under 18 from using its chatbots”) · Fortune/Exa same-week “Google hires CEO and cofounder of Character AI” (Fortune **403’d** this pass). **Jina could not load TC/NYT bodies.**
- **What it did:** Consumer character chat at huge scale.
- **Evidence (ACQUIHIRE-SHAPED + TRUST/SAFETY HIT):** Founders back to Google (same week as Adept/Inflection commentary). Later **under-18 ban** indexed by HN/NYT title. Product **not claimed shutdown** — lessons only.
- **Why it looked valuable:** Retention via parasocial chat; inference research blog posts.
- **Why the original path is a warning:** **Safety, minors, and lab acquihires.** Companion AI attracts the wrong engagement and the wrong regulators. Technical depth did not prevent a Google talent deal.
- **Hackathon lesson:** Do not build a companion. Do not build “people will just hang out with the model.” OFFGRID is a job, not a friend.

---

## 18. Otter.ai — meeting bot joins without consent

- **URLs:** HN 7 Sep 2022, **612 points, 176 comments:** https://news.ycombinator.com/item?id=32751071 “Tell HN: Otter.ai bot recording meetings without consent”
- **What it did / does:** Meeting transcription; calendar auto-join bot.
- **Evidence (TRUST FAILURE, company still operating):** OP: update auto-joins Google Calendar meetings; **carefully opted out**; screenshots that the feature was off; bot still joined and recorded. Commenters treat uninvited bots as a meeting-culture attack. 2025–26 HN still surfaces “bot-free Otter alternative” products (e.g. Meetily 2025-11-04).
- **Why it looked valuable:** Professionals hate taking notes. Calendar integration is “magic.”
- **Why it backfired:** **Consent is the product.** A bot in the participant list is spam and often illegal depending on jurisdiction. The painful job is real; the *distribution mechanic* (force-join) poisoned the category.
- **Hackathon lesson:** Kill meeting-notetaker / “I’ll invite a bot.” Afterhours should start from *text the user already has*, not from silently capturing other humans.

---

## 19. accessiBe — AI overlay that “makes any site WCAG compliant”

- **URLs (primary):** FTC 3 Jan 2025: https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million-deceptive-claims-its-ai-product-could-make-websites · Advocacy: https://www.forbes.com/sites/gusalexiou/2021/06/26/largest-us-blind-advocacy-group-bans-web-accessibility-overlay-giant-accessibe/ · https://adrianroselli.com/2020/06/accessibe-will-get-you-sued.html
- **What it did:** accessWidget overlay; sold WCAG/ADA compliance-as-a-script.
- **Evidence (TRUST / REGULATORY FAILURE, not shutdown):** FTC: **$1M**, allegedly **false** that AI makes any site WCAG-compliant; fake-looking “independent” reviews; order bars those claims. NFB banned them from a convention (2021 Forbes). Overlay category is widely treated by practitioners as harmful.
- **Why it looked valuable:** Legal fear (ADA lawsuits) + “one line of JS.” Buyers are scared websites, not users with disabilities.
- **Why it failed as a solution:** **The demo lied.** Overlay cannot fix semantic HTML. Disability community + FTC. “AI compliance” is a liability.
- **Hackathon lesson:** Kill anything whose buyer is buying **cover**, not an outcome the affected user would praise. If disabled users (or equivalent end-users) hate it, judges will too.

---

## 20. AI-text detectors (GPTZero-class) — false accusations as a product

- **URLs:** HN 19 Feb 2023 (181 pts): https://gonzoknows.com/posts/GPTZero-Case-Study/ (“GPTZero Case Study – Exploring False Positives”) — **Jina body failed (310 bytes)**; title/URL only. Authory 1 Nov 2023 (HN 218 pts): https://authory.com/blog/how-ai-detectors-are-destroying-livelihoods — freelancer fired after **65–95% “AI” scores**, including pre-ChatGPT pieces; Google Docs history ignored; OpenAI **shut its own classifier** for low accuracy (quoted). GPTZero itself still publishes (HN 22 Jan 2026: NeurIPS hallucination hunt) — **not a shutdown**.
- **What they did:** Score text as “AI written” for schools/employers/SEO clients.
- **Evidence (TRUST FAILURE of the category):** Named GPTZero false-positive write-up exists on HN but **page body not retrieved**. Authory documents livelihood destruction from *a* detector (vendor unnamed in the article). Accuracy claims of “99%” are attacked as small-N marketing.
- **Why it looked valuable:** Institutions panicking about cheating/SEO wanted a number.
- **Why it fails anyway:** **The error cost is a human’s job.** False positives are common; there is no good defense against a black box. Building this is picking a fight with writers and students.
- **Hackathon lesson:** Kill “AI detector / originality score.” It is not a professional’s painful job; it is a weapon.

---

## 21. 2026 Product Hunt “AI agent” launches that went nowhere

- **URLs:** https://accessalyze.com/blog/day-15-launch-postmortem.html (29 Apr 2026): PH launch **1 upvote**, **18 click-throughs**, **$0**. https://dev.to/zwiserfit/we-launched-on-product-hunt-with-9-ai-agents-running-a-real-gym-we-got-0-upvotes-4noh (3 Jul 2026): **0 upvotes**. https://blog.tobira.ai/built-ai-agent-product-onboarding-post-mortem/ (30 Apr 2026): **17 signups, 2 chats, 0 paying**; PH **32 upvotes**, off the feed in 48h. YouTube 21 Dec 2025 “Product Hunt is Dead” (AI-comment graveyard) — transcript via Exa, not independently watched.
- **Evidence (DISTRIBUTION FAILURE):** These are maker postmortems, not unicorn autopsies. They show **PH is not a customer channel** for AI agents in 2026.
- **Why it looked valuable:** 2015–2019 PH still minted defaults.
- **Why it failed anyway:** Cold accounts, AI-written comments, no trusted identity. Product Hunt is not a substitute for a user who already has the painful job.
- **Hackathon lesson:** Do not budget the OFFGRID wow-path as “we launch on PH.” Judges get a URL, not a badge.

---

## Smaller / incomplete GitHub signals (not full company autopsies)

Archived **AI changelog** toys, low stars — crowding, not market proof:

- https://github.com/joshuasundance-swca/ai_changelog — archived, **14** stars, last real push **15 Jul 2024** (“LLMs to maintain AI_CHANGELOG.md”).
- https://github.com/goosewin/chronicler — archived, **9** stars (“commits into polished release notes”).

`gh search` for archived “AI pull request review” did **not** return a high-star canonical `ai-pr-reviewer` this pass (Coderabbit/ezyang repos 404). What *did* archive at scale were **generic agents** (AgentGPT) and **local PKM** (Reor), not a famous changelog SaaS.

---

## Patterns across failures

1. **Generic agent.** Adept, Sweep-v1, AgentGPT, gpt-engineer, Rabbit LAM: “it can do anything” ships as “it does nothing reliably.”
2. **Hardware as marketing.** Humane, Rabbit, Limitless Pendant: the box is the fundraise; the software did not need the box; bricking follows.
3. **No wedge / wrapper.** Jasper, Magician, Mutable wiki: the model vendor or the host platform ships the UI.
4. **Incumbent bundling / acquihire-as-exit.** Inflection→Microsoft, Adept→Amazon, Character founders→Google, Diagram→Figma, Limitless→Meta, Humanloop→Anthropic. The product users loved (or tolerated) is the part that gets turned off.
5. **Trust.** Otter bots, AccessiBe overlays, detectors, Rewind/Limitless capture, Humane data deletion, Bench lockout. Professionals will not paste a week of work into a thing that can vanish or snitch.
6. **Demo vs production / AI-washing.** Builder (humans behind Natasha), Rabbit launch, Adept’s unshipped agent. Hackathon judges *are* the production test.
7. **Economics.** Hopin (demand shock), Bench (venture debt + unprofitable services), Inflection (GPU burn for a chatbot).
8. **Crowding.** Every “AI PR / changelog / meeting notes / second brain” has 50 PH clones and Copilot sitting on the distribution.
9. **Regulation / safety.** Character.AI age gates; AccessiBe FTC; always-on recording (Limitless EU/UK cutoff).

Google Reader analogue: **not forced.** Closest modern rhyme in this set is **Rewind desktop** (personal archive users actually used, killed because an acquirer wanted something else) and **Pi** (a daily companion with “millions of weekly users” claimed, then gutted). Classic Reader postmortems were not re-fetched.

---

## Five ideas that should KILL similar OFFGRID entries

These are not “be careful.” They are **do not build this in three weeks and expect it to still matter on 25 Oct.**

1. **Autonomous coding agent / issue-to-PR / “AI junior dev.”** Sweep’s founders pivoted after users left for Cursor. Adept never shipped. AgentGPT is an archive. GitHub Copilot exists. This is the most tempting OFFGRID trap given the user’s skills.

2. **Meeting notetaker or always-on capture (calendar bot, pendant, screen recorder).** Otter’s 612-pt HN thread is the user research. Limitless users deleted data the day Meta appeared. Consent is fatal in a professional setting.

3. **Thin wrapper: “ChatGPT but for X” or a plugin the host will copy.** Jasper’s category died when OpenAI shipped ChatGPT. Magician died inside Figma. Mutable’s wiki died when every IDE grew chat. If the empty Claude box does 80%, stop.

4. **Generic personal agent / companion / “second brain.”** Inflection Pi, Character.AI, Reor, Rewind. Either a lab eats you, safety eats you, or Obsidian already won the files. Afterhours needs **one shippable brief**, not a soul.

5. **Trust-theater or hostage-data SaaS:** overlays that fake compliance (AccessiBe), AI detectors (GPTZero-class), or cloud-only notes that can be bricked (Humane, Bench, Humanloop sunset). A hackathon demo URL that stores the user’s week on your server without a local export is already those obituaries.

**Positive implication (not a new product):** the surviving shape is a **narrow, local-or-session-scoped job** a professional already does this week, with an artifact they can copy away, that ChatGPT-in-a-tab cannot finish because the *inputs are messy and the output is opinionated*. Anything else in this file already died looking smarter than that.

---

## Could not verify / fetch failed (honesty box)

| Target | What happened |
|---|---|
| Adept homepage 2026 | Cloudflare 403 |
| mutable.ai | Hostname would not resolve |
| magician.design | Jina blocked |
| The Verge Rabbit usage story | 403 abuse block — **5,000/100,000 figure not confirmed from primary** |
| Character.AI TC/NYT/Fortune bodies | 403 / empty |
| GPTZero gonzoknows case study body | Fetch ~empty |
| Hopin Sifted liquidation body | Cookie wall |
| Failory cemetery AI-devtools list | Homepage only |
| layoffs.fyi table | JS, no rows in Jina |
| Sacra | Not successfully read |
| Product Hunt official pages | No auth; used third-party postmortems |
| Replit Ghostwriter as a shutdown | **No shutdown post found.** Ghostwriter appears absorbed into Replit’s later AI; not listed as a confirmed failure. |
| Sourcegraph Cody death | HN hits show GA/open-source, **not** a shutdown |
| Fixie.ai, Magic.dev, Codium/Qodo, Mem.ai | Searched; **no confirmed shutdown** in this pass (Magic.dev still posting 2026 research) |
| Athens Research shutdown | HN search no hits this query |
| High-star archived “AI PR review” product | Not found; only tiny changelog archives |

---

## Source index (loadable this pass)

Official / legal: Adept blog; Humane support letter; Humanloop.com; FTC accessiBe; Figma Diagram acquisition; YC Mutable + Sweep; Sweep README; AgentGPT + gpt-engineer + Reor GitHub.

Press: TechCrunch (Inflection, Adept, Humane, Builder, Bench, Limitless); Reuters (Inflection, Humane, Limitless); Rest of World (Builder); Skift (Hopin); 9to5Mac (Rewind sunset).

HN: Mutable disappearance; Humanloop email; Limitless/Meta; Otter bots; Sweep pivot; accessiBe FTC; Jasper (weak); Hopin fire sale titles.

GitHub CLI: archived AgentGPT, gpt-engineer, Reor; Sweep metadata.

Exa: used throughout; rate-limited early.

Agent Reach: doctor JSON + Jina + Exa-via-mcporter + gh. Agent Reach version at end of pass: **v1.5.0 (current)**.
