# Module 9 — Legacy & Enterprise BI (SSRS, Cognos, SSIS, TDV Studio, Snowflake)

**Client:** FTTG Energy
**Skill level:** Senior IC
**Read time:** ~7 min

---

## The core problem Alex solves

FTTG Energy is a regional utility company that has been running the same BI stack for a decade. Operational reports are served by SQL Server Reporting Services (SSRS). Executive dashboards run in IBM Cognos. Data pipelines are built with SSIS packages. Raw data from grid systems, metering platforms, and asset management tools is virtualized through a TDV Studio layer before it reaches any of the above. Snowflake was added two years ago as an analytics warehouse but is only partially adopted.

Nobody has a complete picture of the architecture. The engineers who built most of it have left. The business knows it needs to modernize but is afraid to touch anything in case it breaks.

Alex is brought in to assess the full stack, stabilize what is there, document what nobody has documented, and build a phased roadmap toward a modern platform.

---

## Section 1 — The concept

### SSRS — SQL Server Reporting Services

SSRS is Microsoft's server-based report generation platform, first released in 2004. It produces paginated reports — pixel-perfect, print-ready documents with precise layout control. Think invoices, regulatory filings, compliance reports, multi-page formatted documents where every element is positioned exactly.

SSRS reports are defined in RDL (Report Definition Language) files. They connect directly to SQL Server, Oracle, or other data sources via report-level data source connections. Reports can be parameterized — users select date ranges, regions, or categories and the report queries accordingly.

SSRS remains relevant in 2025 because paginated reports are genuinely hard to replicate elsewhere. Power BI has paginated reports (also using RDL format) that can replace most SSRS use cases, but the migration requires effort and organizations with large SSRS estates migrate incrementally.

Key interview concepts: RDL files, data source vs dataset, parameterized reports, subscriptions (scheduled delivery), report server vs Power BI Report Server.

### Cognos Analytics

IBM Cognos is an enterprise BI platform popular in large organizations, particularly in industries like energy, utilities, financial services, and government. It has its own data modeling layer (Framework Manager), its own report authoring tool (Report Studio / Cognos Analytics), and its own server infrastructure.

Cognos strengths: robust multi-dimensional analysis, strong paginated reporting, mature security model, ability to model complex business logic in the semantic layer without SQL. Cognos weaknesses: steep learning curve, expensive licensing, slow development cycles, and the visual output looks dated compared to modern BI tools.

For a senior BI engineer, Cognos knowledge signals experience in large enterprise environments — energy, banking, insurance, public sector. If it is on your resume, be ready to explain the Framework Manager modeling approach and how Cognos security works.

### SSIS — SQL Server Integration Services

SSIS is Microsoft's ETL tool, part of the SQL Server suite. It uses a visual workflow designer to define data flows — sources, transformations, and destinations connected by data flow paths. SSIS packages are stored as `.dtsx` files and executed by the SQL Server Agent or the SSIS catalog.

SSIS is a mature, capable ETL tool for SQL Server-centric environments. It handles high-volume data movement efficiently, integrates natively with SQL Server, and has a large library of built-in transformations — lookups, aggregations, conditional splits, slowly changing dimension handling.

The reason modern teams move away from SSIS: it is Windows-only, hard to version control effectively, requires a SQL Server license, and does not scale to cloud or distributed workloads. ADF, Fabric Pipelines, and Python-based pipelines have largely replaced it for new development. But enormous amounts of production SSIS code still exist in enterprises.

### TDV Studio (TIBCO Data Virtualization)

TDV Studio is a data virtualization platform. Data virtualization presents data from multiple heterogeneous sources — Oracle databases, SQL Server, REST APIs, flat files — as a unified virtual layer without physically moving or copying the data. Consumers query the virtual layer and TDV translates those queries into the appropriate source-specific calls in real time.

The benefit: a single query interface over a fragmented source landscape. The trade-off: performance — virtualized queries are slower than queries against consolidated physical tables because they cross network boundaries and execute in real time.

In enterprises that adopted TDV, it often became a dependency that nobody wanted to maintain — a black box sitting between source systems and BI tools that was hard to monitor, hard to debug, and hard to migrate away from.

### Snowflake

Snowflake is a cloud-native data warehouse with a distinctive architecture: compute and storage are completely separated. You pay for storage independently of compute. Query performance scales by adding compute clusters (virtual warehouses) without moving data. Multiple virtual warehouses can query the same data simultaneously without contention.

Key Snowflake concepts for interviews:

**Virtual warehouses** — compute clusters. You can have a small warehouse for interactive queries and a large warehouse for overnight batch loads, both hitting the same data. Each runs independently and you only pay when they are running.

**Time travel** — query data as it existed at any point in the past (up to 90 days on Enterprise tier). `SELECT * FROM sales AT(OFFSET => -3600)` returns the sales table as it was one hour ago.

**Zero-copy cloning** — create a full copy of a table or database instantly without duplicating the underlying storage. Used for dev/test environments and snapshot workflows.

**Stages** — named locations for loading and unloading data. Internal stages store files inside Snowflake. External stages reference files in S3, Azure Blob, or GCS.

---

## Section 2 — Alex's story

### The situation at FTTG Energy

The full stack looked like this when Alex arrived:

- 340 SSRS reports, of which maybe 60 were still actively used
- Cognos serving 12 executive dashboards, 4 of which mattered
- 80+ SSIS packages running nightly, with minimal documentation
- TDV Studio virtualizing data from 7 source systems — 3 of which no longer existed
- Snowflake with 40 tables loaded, used by 3 analysts, invisible to the rest of the organization

Nobody had a diagram. Nobody knew which SSIS packages fed which SSRS reports. The TDV layer had virtual tables pointing at decommissioned source systems that were returning empty results silently.

### What Alex did

**Phase 1 — Assessment and documentation.** Alex spent the first three weeks building an inventory. Every SSRS report with its last run date (from the report server execution log). Every SSIS package with its source, destination, and schedule (from the SSIS catalog and SQL Server Agent). Every TDV virtual table with its source system mappings. Every Cognos report with its Framework Manager package dependency.

The execution log query that identified unused SSRS reports:

```sql
SELECT
    c.Name AS report_name,
    c.Path AS report_path,
    MAX(e.TimeStart) AS last_run,
    COUNT(e.ReportID) AS run_count_90_days
FROM ReportServer.dbo.ExecutionLog3 e
JOIN ReportServer.dbo.Catalog c ON c.ItemID = e.ReportID
WHERE e.TimeStart >= DATEADD(DAY, -90, GETDATE())
GROUP BY c.Name, c.Path
ORDER BY last_run DESC
```

Of the 340 SSRS reports, 198 had not been run in 90 days. Of the 80+ SSIS packages, 23 were loading into tables that nothing queried.

**Phase 2 — Stabilization.** Fixed the silent failures. Three TDV virtual tables were pointing at source system connection strings for systems that no longer existed. They returned empty results without error because the TDV query optimizer had silently substituted cached results. Alex replaced them with direct connections to the correct current source systems and documented the change.

Migrated the SSIS packages serving the four active Cognos dashboards and the 60 active SSRS reports to proper version control — checked them into Azure Repos for the first time.

**Phase 3 — Modernization roadmap.** A phased plan:
1. Migrate the 4 active Cognos dashboards to Power BI (6 weeks)
2. Replace the TDV layer with Fabric shortcuts for the 4 still-active source systems (8 weeks)
3. Migrate the 60 active SSRS reports to Power BI paginated reports (12 weeks)
4. Replace SSIS packages with Fabric pipelines for the active ETL flows (ongoing)
5. Decommission SSRS server, TDV server, and Cognos server

### The outcome

Immediate: silent failures eliminated, 198 dead SSRS reports archived, 23 orphaned SSIS packages disabled. Medium-term: the executive dashboards migrated to Power BI within the first six weeks. The organization had a clear picture of its data infrastructure for the first time in years.

---

## Section 3 — Interview Q&A

**Q: What is SSRS and when is it still the right tool?**

SSRS is Microsoft's paginated reporting platform. It produces pixel-perfect, print-ready documents — invoices, regulatory filings, multi-page formatted reports where precise layout control matters. It has been around since 2004 and there are enormous amounts of it still running in enterprises.

It is still the right tool when you need paginated output that Power BI's standard report visuals cannot produce — precise table layouts that span multiple pages cleanly, headers and footers with page numbers, sub-reports, and complex parameter-driven document generation. Power BI paginated reports use the same RDL format and can replace most SSRS use cases, which is the migration path I recommend.

At FTTG Energy, the active SSRS reports were regulatory compliance submissions and operational runbooks — exactly the use case SSRS excels at. We migrated them to Power BI paginated reports rather than reimagining them as interactive dashboards, because the format requirements were non-negotiable.

---

**Q: How does Snowflake's architecture differ from a traditional data warehouse like SQL Server?**

The key difference is the separation of storage and compute. In a traditional data warehouse, storage and compute are tightly coupled — scaling up compute means scaling up the whole instance, which is expensive and disruptive. In Snowflake, they are completely independent. You can scale compute up or down in seconds without touching the data. You can have multiple compute clusters running against the same data simultaneously.

The billing model follows from this. You pay for storage continuously and for compute only when it is running — virtual warehouses auto-suspend after a period of inactivity and resume instantly when a query comes in.

For analytics workloads with variable demand — quiet overnight, busy during business hours — Snowflake's model is significantly more cost-efficient than keeping a large SQL Server instance running 24/7.

---

**Q: How do you approach a legacy BI modernization engagement?**

Assessment before action. The worst thing you can do is start replacing things before you understand what exists and what actually gets used.

I start by building an inventory of the full stack — what reports exist, who runs them, how often, what data sources they depend on. Most legacy environments have a large portion of content that nobody has looked at in years. The execution logs tell you this objectively — no arguments, just data.

Then I identify the active core — the reports and pipelines that the business actually depends on — and focus stabilization and documentation effort there first. Then I plan the migration in phases, by business value, not by technical complexity. Move the highest-value content first so the business sees tangible improvement quickly.

The mistake I see most often is trying to migrate everything at once. You lose momentum, you disrupt users before the new platform is proven, and you end up with a half-finished migration that nobody trusts.

---

**Q: What is data virtualization and what are its trade-offs?**

Data virtualization presents data from multiple heterogeneous sources as a single unified query layer without physically moving or copying the data. You write one query against the virtual layer and the platform handles the translation to each underlying source.

The benefit is agility — you can expose new data sources quickly without building ETL pipelines. The trade-off is performance — every query crosses network boundaries to the source systems in real time. For interactive reporting and dashboards, this latency is usually unacceptable.

The pattern I prefer for most scenarios: use data virtualization as a transitional layer during a migration, then replace it with physical ELT pipelines once the source system landscape is stable. TDV at FTTG Energy was originally installed to avoid building ETL — a reasonable decision at the time. Ten years later it was a dependency on top of three source systems that no longer existed.

---

## Section 4 — Pitfalls

**Pitfall 1 — Dismissing legacy tools.**
SSRS and SSIS are not failures. They are mature tools that solved real problems and still run production workloads at thousands of organizations. Candidates who say "we should just replace everything with Fabric" without acknowledging the migration cost, risk, and complexity of a large legacy estate are not thinking like a senior engineer. Know the tools, respect what they do, and have an opinion on when migration is worth the effort.

**Pitfall 2 — Not knowing Snowflake's virtual warehouse model.**
Snowflake is widely used and frequently comes up in senior data engineering interviews. The key concept is compute/storage separation and the virtual warehouse model. If you cannot explain why someone would have multiple virtual warehouses on the same data, or what auto-suspend does, you have a gap.

**Pitfall 3 — No assessment methodology.**
If your answer to "how would you approach a legacy modernization" is "migrate everything to the modern stack," you are describing a project failure. Every experienced interviewer has been through or witnessed a failed big-bang migration. Describe a phased, evidence-based approach — inventory, assess usage, stabilize the active core, migrate in value order.

**Pitfall 4 — Not knowing execution logs.**
SSRS, SSIS, and Cognos all have execution logs. A senior engineer who has managed these platforms knows how to query them — to identify unused reports, track pipeline failures, and audit data access. If you describe managing SSRS but cannot describe querying the execution log, it suggests you operated it at a surface level.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context.md)*
