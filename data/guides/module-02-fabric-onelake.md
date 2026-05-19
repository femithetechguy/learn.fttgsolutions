# Module 2 — Microsoft Fabric & OneLake

**Client:** FTTG Retail
**Skill level:** Senior IC
**Read time:** ~7 min

---

## The core problem Alex solves

FTTG Retail is a national chain with over 300 stores. Their Power BI dataset was built in Import mode — data copied into memory at refresh time. It worked fine at first. Then the data grew. Refresh windows stretched from 30 minutes to three hours. The dataset hit the 1GB size limit and had to be split across multiple files. Store managers were making decisions on data that was 24 hours stale at best.

The business wanted real-time sales visibility. The current architecture could not deliver it. Alex was brought in to migrate the entire reporting stack to Microsoft Fabric.

---

## Section 1 — The concept

### What Microsoft Fabric is

Microsoft Fabric is an end-to-end SaaS analytics platform. It brings together data ingestion, transformation, storage, warehousing, semantic modeling, and reporting under one roof — one tenant, one billing unit, one governance layer.

Before Fabric, building a modern data platform on Azure meant stitching together separate services: Azure Data Factory for pipelines, Azure Data Lake Storage for files, Synapse Analytics for querying, and Power BI for reporting. Each service had its own security model, its own monitoring, and its own way of connecting to the others. The integration tax was real.

Fabric collapses that stack. The components are:

**OneLake** — one unified storage layer per Fabric tenant. All data across all workspaces lands here. Built on Azure Data Lake Storage Gen2 under the hood, but surfaced as a single logical lake. You do not provision storage separately. It exists automatically.

**Lakehouse** — the primary data storage object in Fabric. It stores data as Delta tables (structured) and files (unstructured) inside OneLake. It exposes a SQL endpoint for querying, which means you can run T-SQL against it without any additional setup.

**Data Factory pipelines** — orchestration and ingestion. Move data from source systems into OneLake on a schedule or trigger.

**Notebooks** — Spark-based compute for transformation. Write Python or PySpark to process and shape data before it lands in Delta tables.

**Dataflow Gen2** — no-code transformation using Power Query M. For teams that prefer a visual interface over code.

**Fabric Warehouse** — a dedicated T-SQL analytics workload for teams that need a traditional data warehouse experience on top of OneLake.

**Semantic model** — the DAX layer. Connects to Lakehouse or Warehouse tables and serves Power BI reports.

**Power BI** — embedded natively in Fabric workspaces. Reports and semantic models are first-class Fabric items.

### What DirectLake mode is

DirectLake is the connection mode that makes Fabric reporting transformational for Power BI developers.

In Import mode, Power BI copies data from the source into VertiPaq — its in-memory column store — at refresh time. Fast queries. Stale data. Size ceiling.

In DirectQuery, Power BI sends live SQL queries to the source on every visual interaction. Always fresh. Slow on large tables.

DirectLake reads Delta tables directly from OneLake without copying data. The VertiPaq engine loads column segments on demand from the Parquet files in OneLake. You get import-level query speed with near-real-time freshness. No refresh window. No dataset size ceiling.

The trade-off: DirectLake requires data to be in Delta format in a Fabric Lakehouse or Warehouse. It does not work against arbitrary sources.

### The medallion architecture

Fabric workloads are typically organized around a three-layer data pattern called the medallion architecture:

**Bronze** — raw data as it arrives from source systems. No transformation. Append-only. This is your audit trail.

**Silver** — cleaned and conformed data. Duplicates removed, types cast, nulls handled, business keys aligned. This is where most transformation logic lives.

**Gold** — aggregated, business-ready tables. Fact and dimension tables optimized for reporting. This is what the semantic model reads from.

Data flows Bronze → Silver → Gold. Each layer is a set of Delta tables in OneLake. Pipelines or notebooks move data between layers on a schedule.

---

## Section 2 — Alex's story

### The situation at FTTG Retail

The existing setup was a Power BI dataset in Import mode pulling from a SQL Server database via an on-premises data gateway. The dataset had grown to just under 1GB across two years of daily sales transactions across 300 stores. Refresh was scheduled for 2am and regularly failed halfway through due to memory limits. When it succeeded, store managers had yesterday's data by morning. When it failed, they had data from two days ago and nobody knew until someone complained.

The analytics team had tried incremental refresh to reduce load. It helped but did not solve the underlying problem. The data was going to keep growing.

### What Alex built

**Fabric workspace structure.** Alex provisioned a single Fabric workspace for FTTG Retail with three Lakehouses — Bronze, Silver, and Gold — following the medallion pattern.

**Ingestion.** A Data Factory pipeline pulled daily transaction files from the source SQL Server into the Bronze Lakehouse as raw Parquet files. The pipeline ran at midnight. No transformation at this stage.

**Transformation.** A PySpark notebook processed Bronze into Silver — deduplication, type casting, store dimension alignment. A second notebook aggregated Silver into Gold — daily sales fact table, store dimension, product dimension, date dimension. Both notebooks were orchestrated by the same pipeline, running sequentially after ingestion.

```python
# Silver layer — clean and conform transactions
from pyspark.sql import functions as F

df = spark.read.format("delta").load("Tables/bronze_transactions")

df_clean = (
    df
    .dropDuplicates(["transaction_id"])
    .withColumn("sale_date", F.to_date("transaction_timestamp"))
    .withColumn("store_id", F.col("store_id").cast("integer"))
    .filter(F.col("amount") > 0)
)

df_clean.write.format("delta").mode("overwrite").saveAsTable("silver_transactions")
```

**Semantic model.** Alex created a DirectLake semantic model pointing at the Gold Lakehouse tables. No scheduled refresh. The model read from Delta tables that were updated nightly by the pipeline. DAX measures carried over from the original Import model with no changes — DirectLake is transparent to the DAX layer.

**Reports.** The existing Power BI reports were republished against the new semantic model. Store managers opened the same reports they had always used. The difference was that data was fresh by 1am instead of stale by mid-morning.

### The outcome

Refresh failures went to zero — there was no refresh. The 1GB ceiling was gone. Data latency dropped from 24 hours to under two hours. The analytics team stopped getting 7am calls about failed refreshes. The architecture also set FTTG Retail up for the next ask: intraday updates, which are now possible by running the pipeline on a shorter cadence without any model changes.

---

## Section 3 — Interview Q&A

**Q: What is the difference between a Fabric Lakehouse and a Fabric Warehouse?**

A Lakehouse is the primary storage object in Fabric. It stores data as Delta tables and files in OneLake, and exposes a SQL endpoint for querying. It is optimized for mixed workloads — both Spark-based processing and SQL analytics on the same data. It is where most data engineering work happens in Fabric.

A Warehouse is a dedicated T-SQL analytics engine. It has a more traditional relational database feel — DDL statements, transactions, stored procedures. It is optimized for SQL-only workloads and teams that want a conventional data warehouse experience without Spark. The underlying storage is still OneLake Delta, but the interface is pure SQL.

For most Power BI-centric engagements I reach for the Lakehouse first. At FTTG Retail we used Lakehouses across all three medallion layers. If the client had a large SQL-focused data engineering team that needed stored procedures and transactions, I would have leaned toward the Warehouse.

---

**Q: Can you explain DirectLake and when you would choose it over Import or DirectQuery?**

DirectLake reads Delta table column segments directly from OneLake without copying data into the model. The VertiPaq engine loads what it needs on demand. You get near-import query speed with near-real-time freshness.

I choose DirectLake when data lives in a Fabric Lakehouse or Warehouse and the business needs fresher data than a scheduled Import refresh can deliver. It is the default choice for Fabric-native reporting.

I still choose Import when data does not live in Fabric — for example, a small dataset coming from an on-premises SQL Server where the volume is low and a nightly refresh is fine. I choose DirectQuery when data must be real-time to the second and the source database is fast enough to handle the query load — financial trading data being the obvious case.

At FTTG Retail, DirectLake was the right call. The data was moving to OneLake anyway, the volume exceeded Import's practical limits, and intraday freshness was the business requirement.

---

**Q: What is OneLake and how is it different from Azure Data Lake Storage?**

OneLake is the storage layer built into every Microsoft Fabric tenant. It is one logical data lake per organization — all Fabric workspaces share the same underlying storage. You do not provision it. It exists the moment you have a Fabric tenant.

Azure Data Lake Storage Gen2 is the infrastructure that OneLake is built on. The difference is the layer of abstraction and integration. ADLS Gen2 is a raw storage service you provision, configure, and connect to other services manually. OneLake is opinionated, managed, and already integrated with every Fabric service. Fabric Lakehouses, Warehouses, notebooks, and pipelines all read and write to OneLake natively.

OneLake also supports shortcuts — virtual links to data in external systems like ADLS Gen2, AWS S3, or Google Cloud Storage — so you can query external data through Fabric without physically moving it.

---

**Q: What is the medallion architecture and why does it matter?**

The medallion architecture is a data organization pattern with three layers — Bronze, Silver, and Gold. Bronze holds raw data exactly as it arrives from source systems. Silver holds cleaned and conformed data. Gold holds aggregated, business-ready tables optimized for reporting.

It matters because it separates concerns. Your Bronze layer is your audit trail — you can always reprocess from raw data if a transformation has a bug. Your Silver layer is where data quality logic lives, isolated from both ingestion and reporting. Your Gold layer is tuned for query performance, not for generality.

Without this separation, transformation logic tends to creep into the wrong places — into the semantic model as calculated columns, into the ingestion pipeline as one-off patches, into reports as complex DAX that should have been handled upstream. The medallion pattern enforces discipline.

At FTTG Retail each layer was a separate Lakehouse. Bronze was append-only. Silver was overwritten on each pipeline run. Gold was the only layer the semantic model touched.

---

**Q: How does Fabric compare to Databricks?**

Both are lakehouse platforms built on Delta Lake. The differences are about integration focus and operational model.

Fabric is Microsoft-native. It integrates tightly with Power BI, Azure Active Directory, Microsoft 365, and the rest of the Microsoft ecosystem. It is fully managed SaaS — no cluster configuration, no infrastructure decisions. The trade-off is that you are inside the Microsoft platform and the customization ceiling is lower.

Databricks is more engineering-focused. It has deeper ML and data science capabilities, better multi-cloud support, and more flexibility for complex pipeline architectures. The trade-off is that it requires more infrastructure expertise to operate and does not integrate with Power BI as seamlessly.

For a BI-led organization already on Azure and Microsoft 365, Fabric is almost always the faster path. For a data engineering team running complex ML workflows across multiple clouds, Databricks is the stronger platform.

---

## Section 4 — Pitfalls

**Pitfall 1 — Describing Fabric as just a new version of Power BI.**
Fabric is not a Power BI upgrade. It is a full data platform that includes Power BI. Candidates who describe it as "Power BI with some extra features" reveal they have only read the marketing material. An interviewer who works with Fabric will hear this immediately.

**Pitfall 2 — Not knowing the DirectLake limitations.**
DirectLake is not magic. It has fallback behavior — when certain DAX patterns or data shapes cannot be served from OneLake directly, the engine falls back to DirectQuery mode automatically. Candidates who claim DirectLake is always faster than Import without knowing about fallback have not shipped it in production.

**Pitfall 3 — Conflating OneLake with ADLS.**
They are related but not the same thing. OneLake is an abstraction layer with managed integration, governance, and shortcuts. Saying "OneLake is just Azure Data Lake" tells the interviewer you have read a blog post, not built on the platform.

**Pitfall 4 — No mention of the medallion architecture.**
Any senior engineer talking about Fabric should be able to describe how they structured their Lakehouse layers. If your answer to "how did you organize your data in Fabric" is "we just loaded everything into one Lakehouse," that is a signal you have not thought about maintainability, reprocessing, or data quality at scale.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context)*
