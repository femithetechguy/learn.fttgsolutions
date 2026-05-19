# Module 8 — Power BI Service & Governance

**Client:** FTTG Retail
**Skill level:** Senior IC
**Read time:** ~6 min

---

## The core problem Alex solves

The Fabric migration at FTTG Retail went well. Reports are fast, data is fresh, and the semantic model is solid. But the platform grew faster than the governance did. There are now 14 workspaces, 60+ reports, three different refresh configurations, and nobody is quite sure who owns what. Two analysts built their own copies of the same report in different workspaces because they did not know the other existed. A regional manager is accessing a report through a personal share link that will break when the original owner's account is disabled.

Alex is now responsible for bringing order to the Power BI Service environment — workspace governance, deployment pipelines, on-premises gateway management, Premium Capacity monitoring, and rolling out Copilot to the analytics team.

---

## Section 1 — The concept

### Power BI Service architecture

Power BI Service is the cloud platform where you publish, share, and manage Power BI content. The key objects are:

**Workspaces** — containers for reports, dashboards, semantic models, and dataflows. Every workspace has a role-based access model: Admin, Member, Contributor, and Viewer. Workspaces should map to business domains or teams, not to individuals.

**Apps** — packaged bundles of reports and dashboards distributed to end users. Users consume content through an app rather than directly accessing the workspace. This separation is important — it means you can update reports in the workspace without disrupting what users see until you republish the app.

**Semantic models (datasets)** — the data layer. Reports connect to semantic models. In a well-governed environment, a single semantic model serves multiple reports — not one model per report.

**Dataflows** — reusable Power Query transformations that run in the service, outputting clean tables that multiple semantic models can consume. They reduce duplication of transformation logic across datasets.

### Deployment pipelines

Deployment pipelines in Fabric and Power BI Service automate the promotion of content between development, test, and production stages. Each stage is a separate workspace. You promote content from dev to test to prod through the pipeline interface, with the ability to run automated tests before promotion.

Without deployment pipelines, the common pattern is editing reports directly in the production workspace — which means any mistake immediately affects users. Deployment pipelines enforce the discipline of environment separation.

Key configuration: **deployment rules** allow you to parameterize differences between environments — a dev semantic model pointing to a dev database connection, a prod semantic model pointing to the production connection, with the promotion step swapping the parameter automatically.

### On-premises data gateway

The on-premises data gateway is a bridge between the Power BI Service (cloud) and data sources that live inside a corporate network — on-premises SQL Server, Oracle databases, SharePoint on-premises, file shares.

The gateway software is installed on a server inside the network. It establishes an outbound connection to Azure Service Bus. When Power BI Service needs to refresh a dataset that uses an on-prem source, it routes the query through the gateway.

Key operational concerns:
- **Gateway availability** — the gateway server must be running and reachable at refresh time. A gateway server restart without a monitoring alert is a common cause of refresh failures.
- **Gateway clusters** — multiple gateway instances can be grouped into a cluster for high availability. If one instance goes down, the others handle the load.
- **Data source credentials** — each data source behind the gateway requires stored credentials in the service. When a service account password rotates and the stored credentials are not updated, every dataset using that gateway connection fails.

### Premium Capacity

Power BI Premium Capacity (or Fabric Capacity) is a reserved compute allocation that unlocks enterprise features and removes per-user licensing requirements for report consumers.

Key features enabled by Premium:
- Paginated reports (SSRS-style pixel-perfect reports)
- Large model support (datasets over 1GB)
- Incremental refresh with real-time data
- Deployment pipelines
- XMLA endpoint (read/write access to semantic models from external tools like Tabular Editor and DAX Studio)
- Power BI Embedded

Capacity monitoring matters. Overloaded capacity causes slow refresh and slow report rendering for all workspaces on that capacity. The **Microsoft Fabric Capacity Metrics app** shows CPU and memory utilization by workspace and operation, enabling you to identify which workloads are consuming the most resources.

### Power BI Copilot

Power BI Copilot is an AI assistant embedded in Power BI that lets users create reports, write DAX measures, and summarize data using natural language. It is available on Premium or Fabric capacity.

From a governance perspective, Copilot enablement is a tenant-level setting. Admins control which workspaces have Copilot enabled. Data sent to Copilot is subject to the same security and compliance controls as the rest of the Power BI Service — it respects RLS and does not expose data outside the user's permissions.

---

## Section 2 — Alex's story

### The situation at FTTG Retail

Fourteen workspaces with no naming convention. Reports named "Final", "Final_v2", "Final_REAL". Three analysts with Admin rights on every workspace. The on-premises gateway was running on a developer's desktop. Premium Capacity was purchased but nobody was monitoring it — the analytics team had been complaining about slow refreshes for two months without knowing the capacity was running at 95% utilization.

### What Alex built

**Workspace governance framework.** Alex defined a workspace naming convention (`[Team]-[Domain]-[Stage]` e.g. `Retail-Sales-Prod`) and an ownership model — every workspace had a named owner and a secondary owner. Access was reviewed quarterly. Personal workspaces were not used for shared content.

**Deployment pipeline setup.** Three workspaces per domain — Sales-Dev, Sales-Test, Sales-Prod. Deployment rules configured to swap database connection parameters between environments. Analysts built in Dev, QA happened in Test, releases went to Prod through the pipeline. Direct editing of Prod content was disabled.

**Gateway migration.** The gateway was moved from the developer's desktop to a dedicated Windows Server VM in the corporate network with 99.9% uptime SLA. A second gateway instance was added to the cluster for high availability. Monitoring was configured via Azure Monitor to alert if the gateway service stopped.

**Capacity monitoring.** Alex deployed the Fabric Capacity Metrics app and spent a week reviewing utilization patterns. The root cause of the slow refreshes was three large semantic model refreshes scheduled simultaneously at 6am. Staggering the refresh schedule to 5am, 5:30am, and 6am brought peak capacity utilization from 95% to 62%.

**Copilot rollout.** Copilot was enabled in the Sales-Prod workspace. Alex ran a two-hour enablement session with the analytics team covering: how to generate a report from a prompt, how to write a DAX measure using Copilot, how to interpret AI-generated summaries, and when not to trust Copilot — particularly for complex DAX that involves CALCULATE and filter context manipulation, where the generated code requires review.

### The outcome

Report discovery improved immediately — with the naming convention, analysts could find what existed without building duplicates. The 6am refresh failure rate dropped from once or twice a week to zero. Gateway uptime went from "best effort" to monitored. The Copilot rollout reduced the time the analytics team spent writing boilerplate DAX measures by roughly 40% in the first month.

---

## Section 3 — Interview Q&A

**Q: What is the difference between a Power BI workspace and an app?**

A workspace is the development and management environment — where you build, edit, and publish content. It has role-based access for people who work with the content. An app is the consumption layer — a packaged bundle of reports and dashboards distributed to end users through the Power BI service or embedded in other portals.

The separation matters because it decouples the development lifecycle from the user experience. You can update and iterate in the workspace without affecting what end users see until you explicitly republish the app. Users with the Viewer role in a workspace can see everything in it — including works in progress. App consumers only see what you have chosen to publish.

At FTTG Retail every business domain had a production workspace and a corresponding app. End users were directed to the app. Analysts had workspace access. Nobody edited content in the app directly.

---

**Q: How do deployment pipelines work and why are they important?**

A deployment pipeline connects three workspaces — Dev, Test, and Prod — in a linear promotion flow. You build in Dev, promote to Test for QA, and promote to Prod for release. Deployment rules handle environment-specific configuration — database connections, parameter values — automatically at promotion time.

They are important because they enforce environment separation. Without them, the default behavior is editing reports directly in the production workspace. One bad change affects every user immediately. With a pipeline, a bad change affects Dev, gets caught in Test, and never reaches Prod.

At FTTG Retail the deployment pipeline was the single governance change that had the most visible impact. It eliminated the category of incident where a report was broken for users because someone was "just fixing something quickly."

---

**Q: What is the XMLA endpoint and when would you use it?**

The XMLA endpoint is a connectivity option on Premium and Fabric capacity that exposes the semantic model as an Analysis Services database. External tools — Tabular Editor, DAX Studio, SQL Server Management Studio — can connect to a published semantic model through the XMLA endpoint to read and write the model schema and data.

I use it in two scenarios. First, for model management at scale — Tabular Editor connected via XMLA can apply scripted changes to a published semantic model without republishing the entire PBIX file. Second, for DAX performance analysis — DAX Studio connected to the published model via XMLA runs queries against production data, which gives accurate performance measurements that the Desktop model cannot always replicate.

---

**Q: How do you approach Power BI Copilot governance when rolling it out to an analytics team?**

Enable it selectively — not tenant-wide on day one. Start with one workspace where the analytics team has strong data literacy and can evaluate the output critically.

The enablement session needs to cover limitations, not just capabilities. Copilot generates DAX that is often correct for simple measures and unreliable for complex ones — particularly anything involving CALCULATE, time intelligence, or row context manipulation. The message to the team is: use it to accelerate the 80% of measures that are straightforward, and review everything it generates before publishing.

From a compliance perspective, confirm with your data privacy officer what data is sent to the AI service during Copilot interactions and whether that is acceptable under your data governance policy. In regulated industries this is a blocker until cleared.

---

## Section 4 — Pitfalls

**Pitfall 1 — Not knowing the workspace/app distinction.**
This is a foundational Power BI Service concept. Candidates who describe giving end users workspace access instead of app access reveal they have not thought about the governance model. In a production environment, end users consume apps. Workspace access is for builders.

**Pitfall 2 — No mention of gateway operations.**
The on-premises data gateway is a common failure point in enterprise Power BI deployments. If you have managed a production Power BI environment, you have dealt with gateway issues. Candidates who cannot describe how the gateway works, what can go wrong, and how to monitor it have not operated the platform at production scale.

**Pitfall 3 — Treating Copilot as a black box.**
Candidates who describe Copilot as "it writes DAX for you" without any discussion of validation, limitations, or governance are not ready to roll it out in an enterprise. Senior engineers who have used it know it requires human review, particularly for complex measures. Know the limitation before you claim the capability.

**Pitfall 4 — Ignoring capacity monitoring.**
Premium Capacity is an expensive SKU. If you describe having Premium without mentioning monitoring and optimization, it signals you have not been accountable for the cost or performance of the platform. Know the Capacity Metrics app, know what overload looks like, and know the common causes.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context)*
