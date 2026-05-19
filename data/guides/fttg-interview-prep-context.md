# Interview Prep — Meet the FTTG Universe

Before you dive into any of the 10 skill modules, read this first. Every guide, every example, and every interview answer in this series is built around the same fictional world. Once you know it, everything connects.

---

## Why a fictional universe?

Interview answers land harder when they're grounded in a real story. Instead of giving you abstract definitions, each module walks you through how a working engineer — on a real engagement, with real constraints — would apply that skill and talk about it in an interview.

The story is fictional. The patterns are real.

---

## The consulting firm — FTTG Solutions

**FTTG Solutions** is a mid-size data and engineering consultancy. They embed senior engineers directly into client accounts to build BI solutions, data pipelines, and internal applications. Think of them the way you'd think of a boutique firm that does what the Big 4 does — but stays hands-on in the tools.

FTTG Solutions has six active client accounts. Each one represents a different industry vertical. Each one surfaces a different set of technical challenges.

---

## The engineer — Alex Mensah

Every module is told through the eyes of **Alex Mensah**, a Senior BI Engineer and Full-Stack Developer at FTTG Solutions.

Alex has eight years of experience across six industry verticals. He is comfortable in the data warehouse and the codebase. He writes DAX, builds Python and PySpark pipelines, designs star schemas, ships Next.js dashboards, and manages Power BI Service environments at enterprise scale. He has worked in both modern cloud-native stacks and legacy BI environments — SSRS, Cognos, SSIS — and knows how to talk about both without apology. He works in Agile sprints, presents to stakeholders, and writes documentation that client teams can actually use.

He is not a specialist. He is the kind of engineer who can sit in a client meeting, understand the business problem, and translate it into a technical solution.

When an interviewer asks Alex about his experience, he does not recite a list of tools. He tells a story about a problem he solved. That is the pattern this series teaches.

---

## The six clients

### FTTG Health
A regional hospital network operating across 12 facilities. Alex's engagement here focuses on clinical and operational reporting — patient throughput, bed utilization, staffing ratios, and compliance metrics. The environment is HIPAA-regulated. Governance and data security are not optional.

**Skills this client covers:** Power BI and DAX, Power Platform (Power Apps, Power Automate)

---

### FTTG Retail
A national retail chain with over 300 stores. The business runs on sales velocity, inventory turnover, and margin by category. Legacy reporting was built in Power BI import mode and hit its ceiling — slow refreshes, dataset size limits, and no real-time visibility for store managers. As the engagement matured, Alex also took on full Power BI Service administration — workspace governance, deployment pipelines, Premium Capacity monitoring, and rolling out Copilot to the analytics team.

**Skills this client covers:** Microsoft Fabric and OneLake, Full-Stack Development (Next.js, REST APIs), Power BI Service and Governance

---

### FTTG Logistics
A national third-party logistics (3PL) provider operating eight distribution centers. Data comes from GPS tracking systems, warehouse management systems (WMS), and fleet telemetry — all in different formats, on different schedules, hitting different APIs. The engineering challenge is getting that data into a single, reliable model.

**Skills this client covers:** Python and PySpark ETL, Azure and Cloud (ADF, Databricks, DevOps)

---

### FTTG Finance
A regional investment firm managing five portfolios. Finance teams were working off flat Excel extracts for P&L reporting — no single source of truth, no auditability, and no way to drill from summary to transaction level. Alex was brought in to build a proper data model from the ground up.

**Skills this client covers:** SQL and Data Modeling

---

### FTTG Insurance
A mid-size insurer. The analytics team tracks claims, underwriting performance, and fraud signals. Manual data collection processes were creating bottlenecks — adjusters were filling in spreadsheets, emailing them in, and waiting for someone to consolidate them before a report could run.

**Skills this client covers:** Power Platform (Power Apps, Power Automate), SQL and Data Modeling

---

### FTTG Energy
A mid-size utility company serving a regional grid across three states. The analytics infrastructure is a decade old — SSRS reports, Cognos dashboards, SSIS pipelines, and TDV Studio data virtualization layers that nobody fully understands anymore. The business knows it needs to modernize but cannot afford to turn everything off at once. Alex was brought in to assess, stabilize, and begin a phased migration.

**Skills this client covers:** Legacy and Enterprise BI (SSRS, Cognos, SSIS, TDV Studio, Snowflake)

---

## How the modules map to clients

| Module | Skill | Client | The core problem Alex solves |
|--------|-------|--------|------------------------------|
| 1 | Power BI & DAX | FTTG Health | Build a clinical performance dashboard for 12 facilities with complex DAX measures and RLS by facility |
| 2 | Microsoft Fabric & OneLake | FTTG Retail | Migrate a legacy import-mode dataset to Fabric Lakehouse + DirectLake for real-time sales reporting |
| 3 | Python & PySpark ETL | FTTG Logistics | Build a Python pipeline ingesting GPS and WMS data from 8 distribution centers into a unified MasterMetrics table |
| 4 | SQL & Data Modeling | FTTG Finance | Design a star schema model for P&L reporting across 5 portfolios, replacing flat Excel extracts |
| 5 | Azure & Cloud | FTTG Logistics | Modernize ADF and Databricks pipelines with CI/CD via Azure DevOps |
| 6 | Power Platform | FTTG Insurance | Build a Power Apps data collection form and Power Automate workflow to replace manual spreadsheet submission |
| 7 | Full-Stack Development | FTTG Retail | Build an internal Next.js dashboard for store managers to view live KPIs via a REST API |
| 8 | Power BI Service & Governance | FTTG Retail | Manage workspace security, deployment pipelines, Premium Capacity, on-prem gateways, and roll out Copilot to 300+ store analytics users |
| 9 | Legacy & Enterprise BI | FTTG Energy | Assess and stabilize a decade-old stack — SSRS, Cognos, SSIS, TDV Studio, Snowflake — and build a phased modernization roadmap |
| 10 | Agile Delivery & Stakeholder Skills | All clients | How Alex runs sprints, manages scope, communicates with non-technical stakeholders, and delivers on time across every engagement |

---

## How each module is structured

Every guide follows the same four-section format so you always know what to expect.

**Section 1 — The concept**
Plain-language explanation of the skill. No jargon first. You should be able to explain this to someone who does not work in data before you try to explain it to an interviewer.

**Section 2 — Alex's story**
How Alex applied this skill on the relevant client engagement. What the problem was, what he built, what decisions he made, and why. This is the material you adapt into your own interview answers.

**Section 3 — Interview Q&A**
Four to six real interview questions with model answers written in Alex's voice. Study the structure of the answers, not just the content. Senior interviewers are listening for how you think, not just what you know.

**Section 4 — Pitfalls**
What average candidates get wrong. What separates a good answer from a senior answer. The things that sound right but signal you have not actually done the work.

---

## How to use this series

Read this context guide once before you start any module. Then pick the module most relevant to the role you are interviewing for and work through it in order — concept first, story second, Q&A third, pitfalls last.

Do not skip to the Q&A. The answers will not stick without the concept and the story behind them.

When you practise answering out loud, replace Alex's client names with your own experience where you have it. Where you do not have direct experience, use Alex's story as your frame and be honest that you have studied the pattern — interviewers respect that more than a fabricated answer.

---

## Quick reference — the FTTG universe at a glance

| | FTTG Health | FTTG Retail | FTTG Logistics | FTTG Finance | FTTG Insurance | FTTG Energy |
|---|---|---|---|---|---|---|
| Industry | Healthcare | Retail | Supply chain | Finance | Insurance | Utilities |
| Scale | 12 facilities | 300+ stores | 8 distribution centers | 5 portfolios | Mid-size insurer | 3-state regional grid |
| Key data challenge | HIPAA-regulated clinical data | Real-time sales + service admin at scale | Multi-source fleet and WMS data | No single source of truth for P&L | Manual claims collection | Decade-old legacy BI stack |
| Engineer's focus | Governance + DAX | Fabric migration + Power BI Service | ETL pipeline | Data modeling | Workflow automation | Legacy assessment + modernization |
| Regulated environment | Yes (HIPAA) | No | No | Yes (SOX-adjacent) | Yes (state regulations) | Yes (NERC/FERC-adjacent) |

---

*This context guide is part of the FTTG Learn Interview Prep Series. Each module references this document — bookmark it and keep it open as you work through the guides.*