# Module 1 — Power BI & DAX

**Client:** FTTG Health
**Skill level:** Senior IC
**Read time:** ~8 min

---

## The core problem Alex solves

FTTG Health is a regional hospital network with 12 facilities. Each facility tracks patient throughput, bed utilization, staffing ratios, and compliance metrics. The data lives in a SQL Server database fed by an EHR system. Leadership wants a single dashboard that works at the network level but lets each facility director drill into their own numbers — and nobody else's.

Alex's job: build a Power BI semantic model that handles complex DAX logic, enforces row-level security by facility, and performs fast enough that a room full of executives does not sit watching a spinner.

---

## Section 1 — The concept

### What Power BI actually is

Power BI is Microsoft's business intelligence platform. It has three main parts:

**Power BI Desktop** — where you build. You connect to data sources, shape data in Power Query, build a data model with relationships, write DAX measures, and design report visuals. This is the engineer's workspace.

**Power BI Service** — where you publish. Reports and datasets live here in workspaces. You manage access, set up refresh schedules, and share content with business users through apps or direct links.

**The semantic model** — the layer between your data and your visuals. It holds the tables, relationships, and DAX measures that define how data is calculated and displayed. This is the most important thing you build. A well-designed semantic model makes every report on top of it fast and reliable. A poorly designed one makes every report on top of it painful.

### What DAX is

DAX — Data Analysis Expressions — is the formula language of Power BI. It looks a little like Excel formulas but operates completely differently. The single most important thing to understand about DAX is the concept of **evaluation context**.

Every DAX measure evaluates inside a context. That context determines which rows are visible to the calculation at the moment it runs. There are two types:

**Row context** — the current row being evaluated. Exists inside calculated columns and iterating functions like `SUMX`. When DAX is working row by row, it has row context.

**Filter context** — the set of filters applied to a table at the moment a measure evaluates. Every visual on a report page creates filter context — a bar chart filtered to March 2024 is putting a filter context on every measure it displays.

The function that manipulates filter context is `CALCULATE`. It is the most powerful function in DAX. It evaluates an expression inside a modified filter context — adding filters, removing them, or replacing them entirely.

```dax
-- Total admissions regardless of facility filter on the visual
All Facilities Admissions =
CALCULATE(
    [Total Admissions],
    ALL(Facility)
)
```

Understanding the difference between row context and filter context — and how `CALCULATE` bridges them — is the unlock that makes DAX finally make sense.

### The star schema

Power BI performs best when data is modeled in a star schema. One central fact table — containing measurable events like patient admissions, transactions, or orders — surrounded by dimension tables that describe the context of those events — dates, locations, staff, products.

```
DimDate ──────────────┐
DimFacility ──────────┤──── FactAdmissions
DimDepartment ────────┤
DimPatientType ───────┘
```

Relationships flow from dimension to fact. Filters flow from dimension to fact. This is how Power BI's engine — VertiPaq — is designed to work. Put your data in a star schema and the engine rewards you with fast queries. Put it in a flat denormalized table and you will spend the rest of the project fighting performance.

---

## Section 2 — Alex's story

### The situation at FTTG Health

When Alex joined the engagement, the existing reporting was a set of Excel files refreshed manually every Monday morning by an analyst. Each facility had its own file. There was no network-level view. Directors were making decisions based on data that was between three and seven days old.

The ask was clear: one Power BI solution, 12 facilities, refreshed daily, with each facility director seeing only their own data.

### What Alex built

**The data model.** Alex designed a star schema with `FactAdmissions` at the center. Dimension tables covered date, facility, department, admission type, and discharge disposition. Every measure was written against this model. No calculated columns in the fact table. No denormalized flat tables.

**Row-level security.** RLS in Power BI is configured through DAX filter expressions on dimension tables. Alex created a `FacilityDirectors` role with a DAX rule on `DimFacility`:

```dax
[FacilityEmail] = USERPRINCIPALNAME()
```

When a facility director opens the report, Power BI evaluates their login against this rule and filters every visual automatically to their facility. Network-level executives are assigned a separate role with no filter — they see everything.

**Key measures.** The core measures Alex built:

```dax
-- Total admissions in current filter context
Total Admissions =
COUNTROWS(FactAdmissions)

-- Admissions vs same period last year
Admissions YoY % =
VAR CurrentYear = [Total Admissions]
VAR PriorYear =
    CALCULATE(
        [Total Admissions],
        SAMEPERIODLASTYEAR(DimDate[Date])
    )
RETURN
DIVIDE(CurrentYear - PriorYear, PriorYear, 0)

-- Bed utilization rate
Bed Utilization % =
DIVIDE(
    [Total Occupied Beds],
    [Total Available Beds],
    0
)
```

**Performance.** With 12 facilities and three years of daily admission records, the fact table had around 2 million rows. Alex avoided relationships on high-cardinality columns, used integer surrogate keys instead of text in relationships, and disabled auto date/time in favor of a dedicated `DimDate` table. Query times stayed under two seconds across all visuals.

### The outcome

The Monday Excel ritual was retired. Directors opened Power BI each morning and had yesterday's numbers. The network leadership team had a summary view with drill-through to any facility. The compliance team had their own report page with HIPAA-safe access controls already enforced by the model.

---

## Section 3 — Interview Q&A

**Q: Can you explain the difference between a measure and a calculated column in Power BI?**

A measure is calculated at query time — it evaluates dynamically based on the filter context of whatever visual or slicer is active on the report. It does not store values in the model. A calculated column is computed at data refresh time, row by row, and stores its result in the table. Measures are for aggregations you want to slice and dice. Calculated columns are for static row-level attributes you want to filter or group by. For performance, you almost always prefer measures. Calculated columns inflate model size and do not respond to filter context the way measures do.

At FTTG Health, every KPI — admissions, bed utilization, length of stay — was a measure. The only calculated columns in the model were for things like age bands on patient demographics, which were static groupings needed for slicing, not aggregation.

---

**Q: What is CALCULATE and why is it so important?**

`CALCULATE` is the function that lets you modify filter context. Every DAX measure runs inside the filter context created by the report — whatever slicers, visual filters, and page filters are active. `CALCULATE` lets you change that context for a specific calculation without changing the visual.

The classic use case is year-over-year comparisons. The visual is filtered to the current year, but you need last year's number in the same row. `CALCULATE` with `SAMEPERIODLASTYEAR` shifts the date filter while leaving everything else intact.

At FTTG Health I used it constantly — for network-level benchmarks that needed to ignore the facility filter, for year-to-date calculations that needed to accumulate from January regardless of what month was selected, and for compliance thresholds that referenced fixed targets rather than the filtered data.

---

**Q: How do you implement row-level security in Power BI and what are the common mistakes?**

RLS is configured in Power BI Desktop under the Modeling tab. You define roles with DAX filter expressions on tables. When a user is assigned to a role and opens the report in the service, their view of the data is filtered by those expressions.

The most common mistakes I see are: filtering on the fact table instead of the dimension table — which breaks when the fact table has rows with no matching dimension entry — and forgetting to test with the "View as role" feature before publishing, which means RLS bugs go live and you find out from a director who can see another facility's data. The third mistake is not planning for executives who need to see everything — you need a separate role with no filter, or they get an empty report.

At FTTG Health I defined the filter on `DimFacility` using `USERPRINCIPALNAME()` matched against the facility director's email. Executives were assigned an unrestricted role. I tested every role before the client ever saw the report.

---

**Q: How do you approach performance optimization in Power BI?**

I start with the model, not the measures. Most performance problems in Power BI come from model design — high-cardinality relationship columns, too many calculated columns in the fact table, flat denormalized tables instead of a star schema. Fix the model first and most measure performance problems disappear.

For measures specifically, I avoid using iterating functions like `SUMX` on large tables when a simple `SUM` will do. I use variables (`VAR`) to avoid evaluating the same sub-expression twice. I use DAX Studio to run performance traces — it shows you which measures are slow, how long the storage engine query takes versus the formula engine, and whether the query is being cached.

At FTTG Health the initial model had a flat table with all dimension attributes denormalized into the fact. Query times were four to six seconds. After moving to a proper star schema, average query time dropped to under two seconds on the same data volume.

---

**Q: What is the difference between DirectQuery, Import, and DirectLake?**

Import mode copies data from the source into Power BI's in-memory VertiPaq engine at refresh time. Queries are fast because everything is in memory. The trade-off is that data is only as fresh as the last refresh, and there is a practical dataset size limit.

DirectQuery sends every visual interaction as a live query to the source database. Data is always current but query performance depends entirely on the source — a slow database means a slow report.

DirectLake is a Fabric-specific mode that reads Delta tables directly from OneLake without importing data. It gives you import-level speed with near-real-time freshness. It is the best option when your data lives in a Fabric Lakehouse.

At FTTG Health we used Import mode because the data volume was manageable and a daily refresh was acceptable. If the client had needed intraday updates, DirectQuery against Azure SQL would have been the next step.

---

## Section 4 — Pitfalls

**Pitfall 1 — Writing measures as calculated columns.**
Junior candidates describe measures as calculated columns in their answers. They say things like "I created a column that calculates the YoY change." A senior engineer knows that a YoY measure must be dynamic — it responds to whatever date filter the user applies. A calculated column is static and computed at refresh. Mixing these up in an interview signals you have not built anything complex in DAX.

**Pitfall 2 — Not knowing what CALCULATE actually does.**
Most candidates can recite that CALCULATE modifies filter context. Few can explain *how*. If asked to trace through why a specific measure returns an unexpected result, they cannot do it. Study the CALCULATE transition — specifically what happens when you use it inside an iterator like SUMX. That is where senior DAX questions live.

**Pitfall 3 — Treating RLS as an afterthought.**
Candidates who have only built demos describe RLS as something you add at the end. In a regulated environment like healthcare or finance, RLS is a design constraint that affects the entire model from day one. The dimension table structure, the role definitions, and the relationship design all need to account for how security filters will propagate. If you only added RLS to an existing model and it was painful, that is worth explaining — it shows you understand the lesson.

**Pitfall 4 — No mention of performance tooling.**
Any senior Power BI engineer should know DAX Studio and Performance Analyzer. If your answer to a performance question is "I tried different things until it got faster," that is a junior answer. A senior answer names the tools, explains what they measure, and describes a systematic process.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context)*
