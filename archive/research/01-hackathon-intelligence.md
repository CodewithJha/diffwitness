# HACK47 OFFGRID — Hackathon Intelligence

**Research date:** 2026-09-21  
**Method:** Primary-page fetch (Jina Reader + direct HTML + WebFetch + Exa search + GitHub CLI). LinkedIn company page inspected via Jina. X/Twitter blocked for anonymous fetch; Instagram login-walled. LinkedIn MCP timed out. No email was sent to organizers.

**Status of this document:** Facts are labeled as inspected. Conflicts are left standing. Inferences are labeled **INFERENCE**. Claims that could not be verified on a primary page are labeled **UNVERIFIED**.

---

## Official facts table

| Fact | What the primary page says | Source | Confidence |
|---|---|---|---|
| Event name | HACK47: OFFGRID | Devpost overview | High |
| Tagline | “A month to do great work, surrounded by great builders.” | Devpost overview (WebFetch title) | High |
| Format | Online, Public | Devpost overview HTML | High |
| Challenge id | 31035 | Devpost register URL `challenge_id=31035` | High |
| Submission window | 15 Sep 2026 04:00 UTC → 15 Oct 2026 04:00 UTC | [Devpost dates](https://hack47-offgrid.devpost.com/details/dates) | High |
| Header deadline | “Deadline: Oct 15, 2026 @ 4:00am UTC” | Rules / Resources / Gallery headers | High |
| Alternate display | “October 15 at 12:00am EDT” | Devpost overview (WebFetch) | High |
| Winners announced | 25 Oct 2026 13:00 UTC | [Devpost dates](https://hack47-offgrid.devpost.com/details/dates) | High |
| Judging period start | **Blank** on the schedule table | Same dates page | High that it is unpublished |
| Field size | **87** registered participants | Nav: `Participants (87)`; org listing also shows 87 | High (registrants, not submissions) |
| Prize count | 1 non-cash prize, 1 winner | Devpost prizes block | High |
| Named judges | None. Placeholder: “Looking for judges” | Devpost Judges section | High |
| Organizer contact | hello@hack47.org | Devpost, hack47.org, mailto links | High |
| Gallery | Unpublished | Project gallery | High |
| Updates | None posted beyond placeholder | Updates tab | High |
| Forum | Login-walled / empty to anonymous fetch | Discussions tab | Medium (page fetched; no topics visible) |

### Date / copy conflicts (do not flatten)

1. **Rules body vs. schedule.** Rules text still says: “The official hackathon timeline, submission deadline, and judging schedule will be announced by the Hack47 team.” The same site’s header and `/details/dates` already publish the window above.
2. **Participant counts in search indexes.** Stale snippets showed 52 or 59 participants. The live page on 2026-09-21 shows **87**. Use 87.

---

## Eligibility

*[Redacted before public release: personal eligibility notes.]*

---

## Submission requirements

### What OFFGRID itself lists (“What to Submit”)

From the Devpost overview, numbered:

1. **Project Name**
2. **Short Description** — 1–2 sentences
3. **Problem** — what problem, who experiences it
4. **Solution**
5. **Demo Link** — “Provide a working demo whenever possible.”
6. **Source Code** — GitHub/GitLab
7. **Demo Video** — “Show the project working and explain what you built.”
8. **Tech Stack** — major technologies, APIs, models, and tools
9. **Build Process** — what you built during OFFGRID vs what you would improve next

### Strength of each requirement (do not upgrade “recommended” to “mandatory”)

| Item | OFFGRID wording | Strength |
|---|---|---|
| Working project / functional prototype | “must include … whenever reasonably possible” | Soft must |
| Project demo | “strongly recommended” | Strong rec, not an absolute must |
| Demo link | “whenever possible” | Strong rec |
| Source code | “should be provided where applicable” | Soft must where code exists |
| Demo video | listed in What to Submit; no duration | Expected; length **unspecified** |
| Disclose third-party tech / APIs / models / OSS | “must clearly disclose” | Must |
| Created during the designated hackathon period | “must be created for OFFGRID during …” | Must |

### Video length

- OFFGRID rules **do not** specify a max or min duration.
- Generic Devpost help: video demo “is usually required”; “Be sure to check the Hackathon Rules for any requirements regarding maximum video length.” OFFGRID has none.
- Generic Devpost video tips: screencast, explain what it does in the first few seconds, no “snazzy marketing videos” as a substitute for showing the app. That is **Devpost platform advice**, not an OFFGRID rule.

**INFERENCE:** A 2–3 minute screencast that shows the product working in the first 30 seconds matches organizer taste (see Demo philosophy). It is **not** a published OFFGRID constraint.

### Prize opt-in on the form

The project gallery filter is:

> Sponsor Prizes → Hack47 Next Cohort — $10,000 OpenAI Credits + Red Bull Supply (checked)

Devpost manager docs state that an **opt-in prize** is added to the submission form **and** to gallery filters. Combined with a gallery filter that exists for this exact prize, the prize is **very likely opt-in**.

**INFERENCE:** If you do not tick that prize on submit, you may be out of the only prize pool. Devpost does not publish, on the OFFGRID page, “you will not be judged unless you check the box.” Treat checkbox as operationally required for the prize; confirm on the live submit form.

### Devpost platform fields (generic, not OFFGRID-custom)

From Devpost “Know Your Submission Steps”: name, tagline, thumbnail, project story, built-with tags, try-it-out links, image gallery, video (YouTube or Vimeo), additional custom questions, terms checkbox. OFFGRID’s custom questions were **not** inspectable without starting a submission (login).

---

## Judging criteria

Published, **no weights**:

1. **Originality** — Is the idea genuinely interesting or unconventional?
2. **Impact** — Does it solve a meaningful problem?
3. **Execution** — How well does the project work?
4. **Product Thinking** — Would someone actually want to use it?
5. **Technical Depth** — Was technology used thoughtfully?
6. **Potential** — Could this become something bigger after OFFGRID?

The judging-criteria widget on the overview page **duplicates Potential** (it appears twice). That is almost certainly a Devpost config duplicate, not a seventh criterion. The rules list has six items once.

Also published, unweighted:

> You don’t need the most complicated project to win.  
> We’re not looking for the project with the most lines of code or the most buzzwords.

Judges: **unnamed**. Placeholder card “Looking for judges / email hello@hack47.org”.

Judging window start: **unpublished**. Winners: 25 Oct 2026 13:00 UTC.

---

## Prize structure

### What is published

**Name:** Hack47 Next Cohort — $10,000 OpenAI Credits + Red Bull Supply  

**Count:** 1 winner, 1 non-cash prize  

**Body copy (quoted):**

> $10,000 in OpenAI credits, a guaranteed spot in the next Hack47 cohort, one month of Red Bull Supply, plus additional credits, tools, perks, and resources from Hack47's sponsor network.

Sponsors shown on the page: OpenAI logo, Red Bull logo.

### Cash vs credits

- The page labels this **“1 non-cash prize”**.
- The HTML `div.prize-value` is **empty**. This research **did not** observe a literal “$0” on the live page. Do not cite “$0” as inspected.
- Devpost manager docs say: for prize type **Other** (all non-cash), do **not** put credit face-value in the cash field. Empty cash value + “non-cash prize” is consistent with $10k **credits**, not USD.

### Unknowns

- How OpenAI credits are issued (which org / API account / ChatGPT / both)
- Expiry, region, transferability
- What “additional credits, tools, perks” are, and whether they are guaranteed
- Whether Red Bull Supply is India-only, and how it is delivered
- Tax / KYC / identity requirements

---

## AI tool rules and disclosure

**Allowed.** Quoted from rules:

> Participants may use AI tools and developer tools to build their projects.  
> AI coding assistants and generative AI tools are allowed.

Resources page explicitly names **Cursor / Claude Code / other AI coding tools**, plus OpenAI / Gemini / Anthropic APIs, Hugging Face, etc. **No required stack.**

**Disclosure is mandatory** for “major third-party technologies, APIs, models, or open-source projects used.”

Also: “Be transparent about how they were used.”

There is **no** published ban on AI-generated code, no required “AI usage %”, and no separate AI ethics form on the public pages.

---

## Originality / existing-project rules

Quoted:

> Your project must be created for OFFGRID during the designated hackathon period.  
> You may use existing libraries, APIs, open-source software, datasets, and developer tools.  
> Projects should contain meaningful work done by the participating team. Do not simply submit an existing project with minimal changes.  
> If you build on an existing open-source project, clearly explain what you added or changed.  
> Your submission should be your own work created for OFFGRID.

Devpost also offers “Import from portfolio”; their own help says: “Be sure to read the rules and update your existing project to meet the requirements.” Importing an old project **without** substantial OFFGRID-period work would conflict with OFFGRID’s own rule.

**Designated period** for originality = submission window 15 Sep 04:00 UTC – 15 Oct 04:00 UTC, unless organizers announce otherwise.

---

## Demo philosophy

### FACT — house (hack47.org), not OFFGRID rules

> Four demo nights across the month. Ten minutes each, **live software only**. If it cannot be shown running, it does not get shown.

> Everything shown is running, and everything shown is yours — Hack47 takes no equity.

LinkedIn company About (quoted):

> Demo day exists. It’s the last day. **No slides. No pitch decks.** No “we’re the Uber of.” Just the thing, working, on screen, doing what it was meant to do.

### FACT — OFFGRID rules

Demo is **strongly recommended**. Working prototype **whenever reasonably possible**. No language that says “judges click the URL first” or “no slides” on the OFFGRID page itself.

### INFERENCE — how a remote judge will actually behave

With ~87 registrants, unnamed judges, and a “Looking for judges” card, a judge who opens Devpost will see: title, tagline, **video**, **try-it-out URL**, then repo. Organizer aesthetic (house + LinkedIn) strongly prefers running software over decks. A localhost-only demo is not forbidden in so many words, but a judge who cannot click it cannot evaluate Execution. Treat a **public HTTPS demo URL** as a practical requirement.

---

## Organizer philosophy (quoted, with URLs)

**Organizers:** Rishul Chanana (founder), Pratyush Pandey (co-founder). Listed on [hack47.org](https://hack47.org/) with LinkedIn and X links. Company: [linkedin.com/company/hack47](https://www.linkedin.com/company/hack47). Email: hello@hack47.org.

### OFFGRID (Devpost)

> Don’t build what you’re supposed to build. Build what you want to exist.  
> Source: https://hack47-offgrid.devpost.com/ — accessed 2026-09-21

> Don’t build for the hackathon. Build something worth continuing after it.  
> Source: same page, “Important” section

> You don’t need the most complicated project to win.  
> Build something people remember.

They encourage projects that: solve a real problem; have a clear target user; are unconventional; use technology meaningfully; **go beyond a basic tutorial or CRUD application**; have a functional prototype; show product thinking; could become a real product, startup, or OSS project.

**No fixed theme. No mandatory stack.** Blockchain and hardware are **explicitly allowed** on the OFFGRID page (“any language, framework, API, AI model, open-source technology, blockchain, hardware”). That is a rule fact. Choosing not to build those is a product strategy, not a published ban.

### House (hack47.org)

> a house for builders who would rather ship than sleep.

> The first Hack47 room is not a conference, a course, or a content calendar. It is thirty days in a Delhi villa with people who arrived to make the work more real.

> Proximity is the whole product.

> You come in with something already running — a repo, a prototype, a user or two.

> One log entry a day … Being stuck in public is how you stop being stuck.

> demo, not slides … live software only.

> Hack47 takes no equity.

> The house takes sixteen. The hackathons are how we meet everybody else — short, in person, and run in the cities builders already live in.

> No pitch decks, no idea stage, no theme for the sake of a theme — you arrive with a laptop, leave with something running, and the room is judged on what works.

### LinkedIn company About

> Delhi's first hacker house. We take your soul, you keep the equity.

> We’re not an incubator. Not an accelerator. Not a coworking space with beanbags and “networking sessions.” We’re a house.

> We don’t care about degrees, titles, or credentials.

> Show us your repos. Show us shipped products.

### Rishul Chanana, LinkedIn (inspected via company feed + post URL)

On speed vs. figuring out what matters (company feed, ~1 month before 2026-09-21):

> if you're building the wrong thing, shipping faster isn't speed. it's just getting to the wrong answer quicker.

> young founders should start building early.

### Pratyush Pandey, LinkedIn (company feed)

> At 17 I hosted the biggest hackathon of my city  
> At 18 I will be hosting the delhi's first hackerhouse

> Hack47 doesn't want to be just another hackerhouse we want to be the most exclusive community of builders

---

## Previous Hack47 events and public winners/projects

### FACT

- Devpost organization listing ([devpost.com/hackathons?organization=Hack47](https://devpost.com/hackathons?organization=Hack47)): **“Showing 1 hackathon”** — only HACK47: OFFGRID. No prior Devpost event, no prior winner gallery.
- OFFGRID project gallery: unpublished. No submissions public.
- hack47.org lists a **future** in-person 47-hour series (Delhi / Bengaluru / Mumbai / Hyderabad / open slot). Edition 01 Delhi is described as “aug 22 — aug 24” with status **“registration open”** on a page fetched 2026-09-21 (after those calendar dates). Treat that table as **stale marketing**, not evidence that a judged Delhi weekend already produced public winners.
- No public OFFGRID or Hack47 hackathon **winners** were found on Devpost, hack47.org, or LinkedIn pages inspected.

### House applicants named in public posts (not winners)

Rishul’s LinkedIn (company feed): **Narayan Thakur** (monade.ai, claimed ₹7L MRR) and **Milan Sampath** (claimed $10k MRR agency; AI receptionist). These are **residency applicants**, not OFFGRID winners.

### Related but not “previous Hack47 winners”

- GitHub [`maximally0/Hack47`](https://github.com/maximally0/Hack47): Next.js site for hack47.org. Contributor listed as **maximally0 / Rishul Chanana**. Last inspected commit 12 Sep 2026. This is the **organizer website**, not a contest project.
- GitHub user `hack47` (created 2018, 0 repos): **unrelated** empty account.
- GitHub `fahimkhan141/hack47` (2022): unrelated by name.
- [variance.house](https://www.variance.house/) is linked from hack47.org footer as a same-month Bengaluru residency (18 Sep–18 Oct 2026). Separate org (Vedant and Yug). Not a Hack47 winner list.
- Pratyush’s prior work (IDEAKode, city hackathon at 17) and Rishul’s Maximally / HackSkye history are **founder biographies**, not Hack47 edition results.

### X/Twitter and Instagram

- Official links exist: https://x.com/hack47org , https://x.com/rishhul , https://x.com/P_Pratyush7 , https://www.instagram.com/hack47.0rg/
- **Not inspected:** X.com returned Jina 403 AbuseAlleviationError. Nitter connection refused. xcancel suspended (451). Instagram login wall. Do not cite tweets.

---

## What judges appear to value

Labeling is mandatory here.

### FACT (published criteria and quotes)

- Originality, Impact, Execution, Product Thinking, Technical Depth, Potential — unweighted.
- Not: most LoC, most buzzwords, most complicated stack.
- Working / rememberable product; something worth continuing.
- Disclose tools; AI is fine.
- CRUD/tutorial is discouraged.

### INFERENCE (organizer aesthetic applied to a remote Devpost judge)

1. **Clickable demo beats a pitch.** House copy is allergic to slides and “Uber of X”. A judge with 87 entries will not watch a mission-statement video.
2. **One painful job for a real user**, not a platform. “Clear target user” is in the encourage-list.
3. **Git history that looks like a build**, not a rename of an existing repo — originality rules + “show us your repos”.
4. **Speed toward the right problem**, not frantic feature thrash (Rishul’s “fastest person is least productive” post).
5. **Technical depth ≠ many models.** The criterion is “used thoughtfully.”

These inferences are for product strategy. They are not rules.

---

## Risk list

1. **“Companies/professional organizations excluded.”** If interpreted strictly, a submission that looks like a company product, or uses a work email / employer GitHub org, could be challenged. Unclear.
2. **Geo exceptions.** Resident of Brazil, Crimea, Cuba, Iran, North Korea, Quebec, or Russia is tagged out by Devpost standard exceptions.
3. **Must be above age of majority** in country of residence.
4. **Originality clock.** Work must be created in the 15 Sep–15 Oct 2026 window. Importing a mature product with a skin change is a stated disqualifier.
5. **Demo that a stranger can open.** No hosted URL → Execution cannot be scored. Localhost is a practical fail even if not named as one.
6. **One prize, one winner.** ~87 registrants. Second place is unpublished and presumably nothing.
7. **No named judges yet.** Judging quality and start date unknown.
8. **Prize opt-in checkbox.** Likely required to enter the only prize.
9. **Stale rules sentence** (“timeline will be announced”) vs live deadline. Submit to the **clock**, not the paragraph.
10. **X/Instagram not independently verified** in this research pass — do not rely on uninspected social posts for rules.

---

## What would disqualify an entry

**Stated on OFFGRID rules page:**

- Submitted after the official deadline (header clock: 15 Oct 2026 04:00 UTC)
- Existing project submitted with **minimal changes**
- Plagiarism
- Malicious software
- Illegal content
- Intentionally harmful functionality
- Failure to comply with third-party terms for APIs/datasets/software used

**Stated as requirements that, if ignored, can make an entry ineligible or unscorable:**

- Not created during the designated period
- No meaningful work by the participating team
- No disclosure of major third-party tech / models
- (Soft) no working prototype when one was reasonably possible

**Sidebar / platform (may be enforced even if body copy is friendlier):**

- Below age of majority
- Entering as a company / professional organization
- Residence in a standard-exception territory

**Not stated as disqualifiers, despite common hackathon folklore:**

- Using AI / Cursor / Claude Code
- Solo participation
- Using blockchain (explicitly allowed)
- Lack of a theme-fit (there is no fixed theme)
- Not being in the in-person house

---

## Open questions for organizers

*[Redacted before public release: personal eligibility and prize-logistics questions.]*

---

## Claim log

Format: Claim | Source | URL | Date accessed | Confidence

| Claim | Source | URL | Date accessed | Confidence |
|---|---|---|---|---|
| Submission deadline is 15 Oct 2026 04:00 UTC | Devpost header + dates table | https://hack47-offgrid.devpost.com/details/dates | 2026-09-21 | High |
| Submissions open 15 Sep 2026 04:00 UTC | Same dates table | https://hack47-offgrid.devpost.com/details/dates | 2026-09-21 | High |
| Winners announced 25 Oct 2026 13:00 UTC | Same dates table | https://hack47-offgrid.devpost.com/details/dates | 2026-09-21 | High |
| Judging start time is unpublished (blank cell) | Same dates table | https://hack47-offgrid.devpost.com/details/dates | 2026-09-21 | High |
| Rules body still says timeline “will be announced” | Devpost rules | https://hack47-offgrid.devpost.com/rules | 2026-09-21 | High |
| 87 registered participants | Devpost nav + org listing | https://hack47-offgrid.devpost.com/ and https://devpost.com/hackathons?organization=Hack47 | 2026-09-21 | High |
| One non-cash prize, one winner | Devpost prizes HTML | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| Prize is $10k OpenAI credits + next cohort seat + 1 month Red Bull + extra sponsor perks | Prize body copy | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| Prize cash-value field on the page is empty (not a displayed $0) | `div.prize-value` empty in HTML | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| Written rules: open to builders from anywhere; solo OK; students **and** founders/developers welcome | Rules eligibility list | https://hack47-offgrid.devpost.com/rules | 2026-09-21 | High |
| Companies/professional organizations excluded | Same sidebar | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| Standard exceptions: Brazil, Crimea, Cuba, Iran, North Korea, Quebec, Russia | tooltip on eligibility list | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| Must be above legal age of majority | Same sidebar | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| AI coding assistants and generative AI are allowed | Rules | https://hack47-offgrid.devpost.com/rules | 2026-09-21 | High |
| Must disclose major third-party tech, APIs, models, OSS | Rules | https://hack47-offgrid.devpost.com/rules | 2026-09-21 | High |
| Project must be created during designated period; no existing project with minimal changes | Rules | https://hack47-offgrid.devpost.com/rules | 2026-09-21 | High |
| Plagiarism, malware, illegal or intentionally harmful content may be disqualified | Rules (full list; extra bullets vs overview) | https://hack47-offgrid.devpost.com/rules | 2026-09-21 | High |
| Six unweighted judging criteria as listed | Rules + overview | https://hack47-offgrid.devpost.com/rules | 2026-09-21 | High |
| No named judges; “Looking for judges” + hello@hack47.org | Overview judges section | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| Demo strongly recommended; working prototype whenever reasonably possible | Rules | https://hack47-offgrid.devpost.com/rules | 2026-09-21 | High |
| Video duration unspecified by OFFGRID | Absence on rules + what-to-submit | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| No fixed theme; no mandatory stack; blockchain/hardware allowed | What to Build | https://hack47-offgrid.devpost.com/ | 2026-09-21 | High |
| Resources page names Cursor / Claude Code as allowed tools | Resources | https://hack47-offgrid.devpost.com/resources | 2026-09-21 | High |
| Contact email is hello@hack47.org | Devpost + hack47.org footer | https://hack47-offgrid.devpost.com/ and https://hack47.org/ | 2026-09-21 | High |
| Founders are Rishul Chanana and Pratyush Pandey | hack47.org team section | https://hack47.org/ | 2026-09-21 | High |
| House originally marketed as Delhi, 15 Sep–15 Oct, 16 places, 30 days | hack47.org | https://hack47.org/ | 2026-09-21 | High |
| House demos: live software only, no slides | hack47.org “the 30 days” | https://hack47.org/ | 2026-09-21 | High |
| LinkedIn About: no slides, no pitch decks, no “Uber of” | Company About | https://www.linkedin.com/company/hack47 | 2026-09-21 | High |
| Only one Hack47 event on Devpost | Org listing “Showing 1 hackathon” | https://devpost.com/hackathons?organization=Hack47 | 2026-09-21 | High |
| No public OFFGRID submissions yet | Gallery unpublished | https://hack47-offgrid.devpost.com/project-gallery | 2026-09-21 | High |
| No public previous Hack47 winners found | Search + org listing + site | (negative result; see sources file) | 2026-09-21 | Medium (absence of evidence) |
| Prize appears opt-in because it is a gallery sponsor-prize filter | Gallery + Devpost article 132 | https://hack47-offgrid.devpost.com/project-gallery and https://help.devpost.com/article/132-prizes | 2026-09-21 | Medium–High |
| OpenAI credit issuance and expiry | Not on any inspected page | — | 2026-09-21 | High that it is **unknown** |
| X/Twitter posts by @hack47org | Fetch failed (403 / nitter down / xcancel 451) | https://x.com/hack47org | 2026-09-21 | N/A — uninspected |
| Instagram @hack47.0rg posts | Login wall | https://www.instagram.com/hack47.0rg/ | 2026-09-21 | N/A — uninspected |
