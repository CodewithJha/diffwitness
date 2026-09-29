# HACK47 OFFGRID — source log

Every row is a source **actually opened or fetched** on **2026-09-21**. Search snippets are not listed as evidence unless the page was then fetched. Failed fetches are listed so later agents do not treat them as inspected.

Reliability scale: **Primary** (organizer-controlled page) > **Platform-primary** (Devpost chrome / help) > **Founder social** (LinkedIn posts) > **Secondary** (indexes, third-party) > **Failed** (not usable as evidence).

---

## Official contest and organizer sites

| Source name | URL | Type | Date accessed | What it proves | Reliability | Notes |
|---|---|---|---|---|---|---|
| HACK47: OFFGRID overview | https://hack47-offgrid.devpost.com/ | Official contest page | 2026-09-21 | Rules body, eligibility Layer B, what to submit, judging criteria, prize copy, judges placeholder, 87 participants, OpenAI + Red Bull logos, standard exceptions tooltip, empty prize-value, challenge id 31035 | Primary | Fetched via Jina, WebFetch, and raw HTML parse. WebFetch also captured “Who can participate” tags that Jina markdown dropped. |
| HACK47: OFFGRID rules | https://hack47-offgrid.devpost.com/rules | Official rules | 2026-09-21 | Full eligibility, originality, AI, demo, source, disclose, disqualification bullets (plagiarism/malware/illegal/harmful), judging list, deadline header 15 Oct 2026 04:00 UTC, extra bullets not all repeated on overview | Primary | Slightly longer than overview (third-party terms + disqualification list). |
| HACK47: OFFGRID dates | https://hack47-offgrid.devpost.com/details/dates | Official schedule | 2026-09-21 | Submissions 15 Sep 04:00 UTC – 15 Oct 04:00 UTC; judging start blank; winners 25 Oct 13:00 UTC | Primary | Conflicts with rules paragraph that says timeline “will be announced”. |
| HACK47: OFFGRID resources | https://hack47-offgrid.devpost.com/resources | Official resources | 2026-09-21 | House framing; no required stack; AI tools allowed including Cursor / Claude Code; Vercel/Supabase/HF/OpenAI/Gemini/Anthropic named as optional | Primary | |
| HACK47: OFFGRID project gallery | https://hack47-offgrid.devpost.com/project-gallery | Official gallery | 2026-09-21 | Gallery unpublished; sponsor-prize filter named “Hack47 Next Cohort — $10,000 OpenAI Credits + Red Bull Supply” | Primary | Supports opt-in-prize inference together with Devpost article 132. |
| HACK47: OFFGRID updates | https://hack47-offgrid.devpost.com/updates | Official updates | 2026-09-21 | No announcements yet; placeholder that organizers will post here and email registrants | Primary | |
| HACK47: OFFGRID discussions | https://hack47-offgrid.devpost.com/forum_topics | Official forum | 2026-09-21 | Anonymous fetch returned chrome only; no public threads extracted | Primary (empty) | Login may be required. Do not claim “no comments” with high confidence. |
| HACK47: OFFGRID participants | https://hack47-offgrid.devpost.com/participants | Participant list | 2026-09-21 | Jina: chrome only. WebSearch snippet: “Please log in to browse this hackathon's participants.” Nav still shows (87). | Primary (gated) | 87 is from nav/listing, not a named roster. |
| Devpost details/judging | https://hack47-offgrid.devpost.com/details/judging | 404 | 2026-09-21 | Path does not exist | Failed | Criteria live on overview/rules instead. |
| Devpost details/prizes | https://hack47-offgrid.devpost.com/details/prizes | 404 | 2026-09-21 | Path does not exist | Failed | Prize block is on the overview. |
| Hack47 org listing on Devpost | https://devpost.com/hackathons?organization=Hack47 | Platform catalog | 2026-09-21 | “Showing 1 hackathon” — only OFFGRID; 87 participants; 1 non-cash prize; Sep 15 – Oct 15 2026; Online | Primary-adjacent | Proves no prior Hack47 Devpost event is listed. |
| hack47.org | https://hack47.org/ | Organizer site | 2026-09-21 | House pitch; Delhi 15 Sep–15 Oct still on homepage; 16 places; 30 days; 40,000+ outreach claim; demo-not-slides; no equity; founders Rishul Chanana + Pratyush Pandey with LinkedIn/X; email hello@hack47.org; in-person 47h city series table; partners logo wall; campus concept | Primary | City-hackathon table still says Delhi Aug 22–24 “registration open” on 21 Sep — stale. |
| Official contact mailbox | mailto:hello@hack47.org | Email (documented, not sent) | 2026-09-21 | Public contact for partners, apply, host, judges, questions | Primary | Documented only. No message was sent. |

---

## Devpost platform help (generic; not OFFGRID-specific)

| Source name | URL | Type | Date accessed | What it proves | Reliability | Notes |
|---|---|---|---|---|---|---|
| Devpost Help Center home | https://help.devpost.com/ | Platform docs index | 2026-09-21 | Category map including submitting, videos, judging | Platform-primary | |
| Submitting to a hackathon category | https://help.devpost.com/category/20-submitting-to-a-hackathon | Platform docs | 2026-09-21 | Article list for register / enter / edit / steps | Platform-primary | |
| How to enter a submission | https://help.devpost.com/article/122-how-to-enter-a-submission | Platform docs | 2026-09-21 | Start project vs import from portfolio; must hit Submit; drafts are not submitted; can edit until deadline | Platform-primary | Import-from-portfolio is a platform feature that **conflicts in spirit** with OFFGRID originality rules if used naively. |
| Know Your Submission Steps | https://help.devpost.com/article/126-know-your-submission-steps | Platform docs | 2026-09-21 | Generic fields: name, tagline, story, built-with, try-it-out, video (YouTube/Vimeo), custom questions, terms | Platform-primary | Video “usually required”; “check Hackathon Rules for maximum video length”. OFFGRID rules have no length. |
| Step 9: Prizes (managers) | https://help.devpost.com/article/132-prizes | Platform docs | 2026-09-21 | Non-cash “Other” prizes should not put credit face-value in the cash field; **opt-in prizes** appear on the submission form **and** gallery filters | Platform-primary | Explains empty prize-value + gallery checkbox. Does not prove OFFGRID configured the prize as opt-in, but that is the matching mechanism. |
| Videos category | https://help.devpost.com/category/34-videos | Platform docs | 2026-09-21 | Links to upload + best practices | Platform-primary | |
| Video-making best practices | https://help.devpost.com/article/84-video-making-best-practices | Platform docs | 2026-09-21 | Recommends screencast over marketing film; explain the app in the first few seconds; upload early | Platform-primary | Advice, not an OFFGRID rule. |
| Dead help URLs tried | https://help.devpost.com/hc/en-us/articles/360011547313-How-to-submit-a-project ; https://help.devpost.com/hc/en-us/articles/360011547273-How-do-I-submit-to-a-prize | 404 | 2026-09-21 | Old Zendesk paths are dead | Failed | Current help is Help Scout under help.devpost.com/article/… |

---

## Organizer social (inspected)

| Source name | URL | Type | Date accessed | What it proves | Reliability | Notes |
|---|---|---|---|---|---|---|
| Hack47 LinkedIn company page | https://www.linkedin.com/company/hack47 | Founder/org social | 2026-09-21 | About text (no slides / no Uber-of / show repos); 2–10 employees; Nonprofit; website hack47.org; employees include Pratyush Pandey; feed of founder posts (Masters’ Union dates, Manus credits, house trailer, applicant examples, D2C hunt, Pratyush bio, OpenAI credits for house, speed essay, college-posting essay, original Delhi 15 Sep–15 Oct announcement) | Founder social | Guest view. MCP `linkedin.get_company_profile` **timed out**. Jina succeeded. |
| Rishul personal profile (linkedin.com/in/rishul-chanana) | https://www.linkedin.com/in/rishul-chanana/ | Profile | 2026-09-21 | Auth wall; no bio extracted | Failed (auth wall) | |
| Rishul IN guest profile | https://in.linkedin.com/in/rishul-chanana | Profile | 2026-09-21 | Auth wall | Failed (auth wall) | |
| Pratyush profile | https://www.linkedin.com/in/pratyush-pandey-09b35b219 | Profile | 2026-09-21 | Auth wall | Failed (auth wall) | Bio fragments still appeared on company feed and in Exa highlights of public posts. |
| Rishul “Delhi’s first hacker house” post | https://www.linkedin.com/posts/rishul-chanana_were-hosting-delhis-first-hacker-house-activity-7492628020290039808-0T8H | Founder post | 2026-09-21 | Original house dates 15 Sep → 15 Oct; 16 builders | Founder social | WebFetch 404 on one slug variant; Exa + company feed confirm content. Use the company-feed copy as inspected. |
| LinkedIn MCP | mcporter `linkedin.get_company_profile` | Tool | 2026-09-21 | Timed out after 60s | Failed | Fell back to Jina. |

---

## GitHub

| Source name | URL | Type | Date accessed | What it proves | Reliability | Notes |
|---|---|---|---|---|---|---|
| gh search repos "hack47" | GitHub search | Code search | 2026-09-21 | Hits: `fahimkhan141/hack47` (2022, unrelated); `maximally0/Hack47` (2026-09-12) | Primary for existence | |
| maximally0/Hack47 | https://github.com/maximally0/Hack47 | Organizer website repo | 2026-09-21 | Next.js site; contributor **maximally0 / Rishul Chanana**; commits through 12 Sep 2026 about the public hack47.org redesign | Primary (site source) | Not a contest submission. |
| GitHub user hack47 | https://github.com/hack47 | Account | 2026-09-21 | Created 2018-02-27, 0 public repos, no bio — **not** the 2026 organizer org | Secondary | Do not treat as official. |

---

## Other sites inspected

| Source name | URL | Type | Date accessed | What it proves | Reliability | Notes |
|---|---|---|---|---|---|---|
| Variance House | https://www.variance.house/ | Third-party residency | 2026-09-21 | Bengaluru deep-tech house 18 Sep–18 Oct 2026; linked from hack47.org footer; different founders (Vedant and Yug); demo day 19 Oct | Secondary | Same-month peer, not a Hack47 winner list. |
| Instagram hack47.0rg | https://www.instagram.com/hack47.0rg/ | Social | 2026-09-21 | Login wall; no posts extracted | Failed | URL exists (linked from hack47.org). |
| X/Twitter @hack47org via Jina | https://x.com/hack47org | Social | 2026-09-21 | Jina 403 AbuseAlleviationError | Failed | Do not cite tweets. |
| Nitter mirror | https://nitter.net/hack47org | Mirror | 2026-09-21 | Connection refused | Failed | |
| xcancel mirror | https://xcancel.com/hack47org | Mirror | 2026-09-21 | 451 service suspended | Failed | |

---

## Searches run (indexes, not evidence by themselves)

Used to **find** URLs, then pages above were fetched. Snippets are not cited as facts except where noted as stale (52/59 participants vs live 87).

| Query / tool | What it found worth fetching | Caveat |
|---|---|---|
| WebSearch: Hack47 previous winners Rishul Chanana Pratyush Pandey | Founder LinkedIn posts; no winner list | Absence only |
| WebSearch: site:devpost.com Hack47 | Only OFFGRID | Confirm with org listing fetch |
| WebSearch: site:x.com hack47org | **No results** | X uninspected |
| Exa: OFFGRID eligibility | Same official URLs + unrelated `offgrid.devfolio.co` (different event) | Must not confuse with HACK47 |
| Exa: Rishul demo not slides / previous winners | hack47.org, LinkedIn posts, no winner list | |
| WebSearch: Devpost prize checkbox | Generic Devpost help + unrelated CSC Impactathon opt-in reminder | CSC page was **not** fetched; only used to know opt-in is a Devpost pattern. OFFGRID-specific proof is gallery filter + article 132. |

**Do not use:** https://offgrid.devfolio.co/ — different “OFF-GRID” event (Devfolio). Not Hack47.

---

## Tools / backends (agent-reach)

Declared per skill: web = **Jina Reader**; search = **Exa via mcporter** + Cursor WebSearch/WebFetch; career = LinkedIn Jina (MCP timeout); GitHub = **gh CLI**; Twitter = unavailable; Instagram = unavailable; Reddit = off.

`agent-reach doctor --json` (2026-09-21): web ok (Jina); exa_search warn (config present, used successfully); linkedin warn (MCP present, timed out); twitter warn (CLI not installed); github warn (gh present, used with `all` permissions); instagram/facebook/reddit off.

`agent-reach check-update`: v1.5.0, already latest.

---

## Intentionally not treated as inspected evidence

- Any tweet or X thread (fetch failed).
- Instagram posts (login wall).
- LinkedIn personal profiles (auth wall), except quotes that appeared on the **company** page.
- Devpost live submission form (requires login / starting a project). Custom questions, the actual prize checkbox UI, and required-field stars were **not** seen.
- Email replies from hello@hack47.org (none requested in this pass).
- Repo-internal files `AGENTS.md` / `docs/WIN-PLAN.md` — used as research briefings, not as official contest sources. Where they disagree with a fetched page, the fetched page wins (example: they say Devpost “may list $0”; live HTML shows an **empty** prize-value, not the characters `$0`).
