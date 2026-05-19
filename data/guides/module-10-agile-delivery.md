# Module 10 — Agile Delivery & Stakeholder Skills

**Client:** All clients
**Skill level:** Senior IC
**Read time:** ~5 min

---

## The core problem Alex solves

Technical skills get you to the interview. Delivery skills get you the offer — and keep the job.

Every engagement Alex has worked is technically challenging. But the ones that failed — not his, but ones he has seen fail — did not fail because the DAX was wrong or the pipeline was slow. They failed because requirements were unclear and nobody pushed back early. Because the stakeholder expected something different from what was built. Because the team was building features nobody asked for while the deadline passed. Because the engineer could not explain what they built to a room of non-technical people.

This module is not soft skills. It is the professional discipline that determines whether technically excellent work actually lands.

---

## Section 1 — The concept

### Agile fundamentals for BI engineers

Agile is an iterative approach to delivering software — and BI solutions — in short cycles that produce working output at each step rather than delivering everything at the end of a long project.

The core Agile ceremonies in a Scrum framework:

**Sprint planning** — the team decides what to build in the next sprint (usually two weeks). Work is pulled from the product backlog — a prioritized list of features, reports, and fixes — into the sprint backlog. The team commits to what they can deliver.

**Daily standup** — a 15-minute synchronization. What did I do yesterday? What am I doing today? Is anything blocking me? It is not a status report to the manager — it is the team coordinating with each other.

**Sprint review / demo** — at the end of the sprint, the team demonstrates working output to stakeholders. Not a slide deck about what was built — the actual thing, working, live. Stakeholders give feedback. That feedback shapes the next sprint.

**Sprint retrospective** — the team reflects on how they worked, not what they built. What went well? What could improve? One specific change to try next sprint.

**Jira** is the most common tool for managing this workflow — backlog, sprint board, issue tracking, and reporting. Confluence is the most common tool for documentation that supports the work.

### Writing good user stories

A user story describes a feature from the perspective of the person who needs it. The standard format:

> As a [type of user], I want to [do something], so that [I get this value].

For BI work:

> As a regional manager, I want to see each store's sales attainment vs target in a single view, so that I can identify underperforming stores before the weekly leadership meeting.

A good user story has acceptance criteria — specific, testable conditions that define when the story is done:

- Sales attainment is displayed as a percentage for each store
- Stores below 80% attainment are highlighted in red
- The view can be filtered by region
- Data reflects the previous full business day

Acceptance criteria prevent the most common BI delivery failure: building what was said instead of what was meant.

### Requirements gathering

The gap between what a stakeholder says they want and what they actually need is where most BI projects go wrong.

**What they say:** "I want a dashboard."
**What they mean:** "I want to stop getting questions I cannot answer in Monday morning meetings."

Getting to the real requirement takes structured discovery:
- Who will use this? What decisions will they make with it?
- What do they do today? What is wrong with that?
- What does success look like in three months?
- What data do they currently trust? What do they not trust and why?

The last question is especially important in BI. If users do not trust the current data, building a beautiful new dashboard on top of it will not solve the problem. The trust issue is the actual problem to solve.

### Communicating technical decisions to non-technical stakeholders

At a certain point in every BI engagement, Alex has to explain a technical decision to someone who does not care about the technical details — they care about the impact.

The framework that works:

1. **The situation** — what was happening before
2. **The decision** — what we changed and why (in business terms, not technical ones)
3. **The result** — what is different now, in terms the stakeholder cares about

Example:

*Before:* "I migrated the dataset from Import mode to DirectLake on Fabric Lakehouse."

*After:* "The reports were running on yesterday's data because of how they were set up. I changed the architecture so the data in the dashboard is always current — within about an hour of it being updated in the source system. You will notice the Monday morning reports now reflect Sunday's activity rather than Saturday's."

Same technical change. The second version is what a senior engineer says.

---

## Section 2 — Alex's story

### Patterns across all five clients

**At FTTG Health** — the clinical dashboard had three rounds of rework because requirements were gathered in one meeting at the start and not validated until three weeks later. By the second engagement, Alex introduced a lightweight discovery process: a requirements document with acceptance criteria, signed off by the clinical operations director before development started. Rework dropped significantly.

**At FTTG Retail** — the Fabric migration sprint plan had the full migration in one sprint. Alex pushed back. A migration of that size — touching 300+ store reports and a production semantic model — needed to be broken into vertical slices: one store group migrated and validated, then rolled out progressively. The stakeholder initially resisted because it felt slower. Three weeks later, when a schema issue was caught in the first store group before it affected all 300, the conversation changed.

**At FTTG Logistics** — the weekly pipeline status was communicated in a shared Confluence page, updated after each pipeline run. Operations managers could see what ran, what failed, and what the current data latency was without emailing Alex. This is a small thing. It built a level of trust with the client that accelerated approval cycles for subsequent changes.

**At FTTG Finance** — the finance team lead came to Alex two weeks before go-live and said the model needed to add three new portfolios. Alex walked him through the sprint commitment, the change impact — one week of model changes plus regression testing on all 40 existing measures — and gave him a choice: delay go-live by one week or launch with the current five portfolios and add the three in the following sprint. The finance lead chose option two. The project launched on time.

**At FTTG Insurance** — the claims Power App went through user acceptance testing with three actual adjusters before it was rolled out to all 40. Two of the three testers found usability issues that would have caused adoption problems at scale. Both were fixed in the testing sprint at a fraction of the cost they would have been post-launch.

### The pattern

None of these are glamorous engineering stories. No elegant algorithms. No performance breakthroughs. They are the decisions and habits that determine whether technically excellent work actually gets used, trusted, and maintained.

---

## Section 3 — Interview Q&A

**Q: How do you work in an Agile team as a BI or data engineer?**

The same way a software engineer does — sprints, backlog, standups, reviews, retros — but with BI-specific adaptations. Data work has dependencies that software often does not: data quality issues discovered mid-sprint, source system access that takes longer than expected, stakeholder feedback that changes the metric definition after development has started.

I handle this by keeping sprint commitments conservative, building in buffer for data discovery, and being explicit about assumptions in acceptance criteria. If I assume the source data is clean and it is not, that needs to be a separate story — not absorbed silently into the current one.

At FTTG Finance the sprint board had a "blocked" column specifically for data access and quality issues. When something blocked a story, it went there immediately with a note on what was needed to unblock it. Blockers visible to the whole team get resolved faster than blockers sitting in someone's email.

---

**Q: How do you handle scope creep on a BI project?**

With honesty and a clear trade-off. When a stakeholder asks for something new mid-sprint, I do not say yes immediately and I do not say no reflexively. I say: "Here is what that would take, and here is what it would affect."

If the new request is small and the sprint has capacity — I absorb it. If it is significant — I put it in the backlog, give it a priority, and schedule it for the next sprint. If the stakeholder insists it is urgent and the sprint cannot absorb it — we have a conversation about what comes out of the current sprint to make room.

The failure mode is saying yes to everything without making the trade-offs explicit. The sprint ends, commitments are missed, trust erodes, and the project falls behind. A clear, honest "this sprint is full but I can schedule it for next sprint" is a better answer than a vague yes that turns into a missed deadline.

---

**Q: Tell me about a time you had to communicate a technical decision to a non-technical stakeholder.**

At FTTG Retail, the analytics director asked why the Fabric migration was taking longer than he expected. He had heard "two weeks" in the initial scoping conversation and it was now week four.

I walked him through what had changed — the data volume was higher than the initial assessment, which required additional tuning of the DirectLake semantic model, and we had discovered during testing that three of the legacy reports had calculated columns that needed to be rewritten as measures before they worked correctly in the new model.

I framed it as: "We found complexity that was not visible in the initial scoping. The extra two weeks are buying you a model that is accurate and maintainable rather than one that looks done but breaks under real usage." I then gave him a revised timeline with specific milestones so he had visibility, not just a new date.

He was not happy about the delay. But he understood the reason and had enough information to manage his own stakeholders. That is the goal — not to make the news good, but to make it clear.

---

**Q: How do you use Jira and Confluence in a BI project?**

Jira for work management, Confluence for knowledge management. They do different things.

In Jira, every piece of work — a new report, a DAX measure, a pipeline fix, a data quality investigation — is a ticket. I write acceptance criteria on every ticket before starting work, not after. The sprint board shows what is in progress, what is blocked, and what is done. At the end of the sprint, the burndown chart tells you whether the team's velocity estimate was accurate.

In Confluence, I document the decisions — not the work. A Confluence page that says "we built a star schema" is not useful. A page that says "we chose a star schema over a flat table because the volume of fact rows made a denormalized approach too slow — see performance test results" is useful. Document the why, not the what. The what is in the code and in Jira. The why disappears when the people who made the decision leave.

---

## Section 4 — Pitfalls

**Pitfall 1 — Treating Agile as bureaucracy.**
Candidates who describe standups as "a thing we have to do" or retrospectives as "just a team meeting" have not experienced Agile working well. When these ceremonies are run with discipline, they surface blockers early, keep the team aligned, and prevent the kind of misalignment that causes rework. Know what each ceremony is for and describe it with intent.

**Pitfall 2 — No mention of acceptance criteria.**
Any senior engineer who has been on a project that delivered the wrong thing — and everyone has — knows why acceptance criteria matter. If your description of requirements gathering does not include explicit, testable criteria for what "done" means, you are describing a process that produces rework.

**Pitfall 3 — Saying yes to scope creep.**
If your answer to "how do you handle a stakeholder who wants to add features mid-sprint" is "I try to accommodate them," you are describing a pattern that leads to missed deadlines and eroded trust. A senior engineer manages scope. That does not mean saying no — it means making trade-offs explicit.

**Pitfall 4 — Treating stakeholder communication as a soft skill.**
Communication is a deliverable. A stakeholder who does not understand the current status of a project cannot manage their own stakeholders, cannot make informed decisions about trade-offs, and cannot build trust in the work being done. How you communicate project status is part of how you deliver — not separate from it.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context)*
