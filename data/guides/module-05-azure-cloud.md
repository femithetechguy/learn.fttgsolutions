# Module 5 — Azure & Cloud (ADF, Databricks, DevOps)

**Client:** FTTG Logistics
**Skill level:** Senior IC
**Read time:** ~7 min

---

## The core problem Alex solves

After the initial FTTG Logistics pipeline was built in Module 3, the business grew. Three more distribution centers were added. The data volume tripled. The Python scripts that worked fine for eight DCs were now timing out, running sequentially when they could run in parallel, and living on a single engineer's laptop. There was no version control. There was no automated testing. When something broke at 2am, nobody knew until the dashboard was wrong at 9am.

Alex is brought in to modernize the pipeline infrastructure — move everything to Azure, add proper CI/CD, and make the system production-grade.

---

## Section 1 — The concept

### Azure Data Factory

Azure Data Factory (ADF) is Microsoft's cloud-based data integration service. It orchestrates data movement and transformation at scale. The core concepts are:

**Pipelines** — sequences of activities that perform a unit of work. A pipeline might extract data from an API, copy it to ADLS, trigger a notebook to transform it, and send an email if it fails.

**Activities** — individual steps inside a pipeline. Common activities include Copy Data (move data from source to sink), Execute Notebook (trigger a Databricks or Synapse notebook), Web Activity (call a REST API), and Stored Procedure (call a database procedure).

**Triggers** — what starts a pipeline. Schedule triggers run on a time cadence. Event triggers fire when something happens — a file lands in a storage container, for example. Tumbling window triggers handle reprocessing scenarios.

**Linked Services** — connection definitions. An ADLS linked service stores the connection string to your data lake. A SQL Server linked service stores the connection to your database. Credentials are stored in Azure Key Vault and referenced by linked services — never hardcoded.

**Datasets** — pointers to specific data within a linked service. A dataset says "the CSV files in this folder of this ADLS account."

ADF is not a transformation engine — it is an orchestration and movement tool. For heavy transformation you hand off to Databricks, Synapse, or Fabric notebooks.

### Databricks

Azure Databricks is a managed Apache Spark platform. It provides a collaborative notebook environment for data engineering and data science workloads that require distributed compute.

Key concepts:

**Clusters** — the compute layer. A cluster is a set of virtual machines running Spark. You define the size and the runtime version. For production pipelines, job clusters are preferred over interactive clusters — they spin up for a specific job and terminate when done, minimizing cost.

**Notebooks** — the workspace for writing and running code. Databricks notebooks support Python, Scala, SQL, and R. In a production pipeline, notebooks are parameterized and called from ADF rather than run manually.

**Delta Lake** — the open-source storage layer that adds ACID transactions, schema enforcement, and time travel to data lake files. Delta tables are Parquet files with a transaction log. The transaction log is what makes them reliable — it records every change, enables rollback, and allows concurrent reads and writes safely.

**Unity Catalog** — Databricks' governance layer. Manages access control, data lineage, and auditing across all data in the platform.

### Azure DevOps for data pipelines

DevOps for data engineering means applying software engineering practices — version control, automated testing, continuous integration, continuous deployment — to pipeline code.

**Git integration** — ADF and Databricks both integrate natively with Git repositories (Azure Repos or GitHub). Pipeline definitions and notebook code are stored in version control. Changes go through pull requests, not direct edits in production.

**CI/CD pipeline** — an automated process that tests and deploys code changes. A typical data engineering CI/CD flow:
1. Engineer pushes code to a feature branch
2. Pull request triggers automated tests — unit tests on transformation logic, schema validation
3. PR is reviewed and merged
4. Merge triggers a deployment pipeline that publishes the ADF pipeline and Databricks notebooks to the production workspace

**Environment separation** — development, staging, and production environments with separate ADF instances, storage accounts, and Databricks workspaces. Code is promoted through environments, never edited directly in production.

---

## Section 2 — Alex's story

### The situation at FTTG Logistics

The existing Python scripts ran on a scheduled task on an engineer's Windows laptop. This is not a joke — it is very common. The engineer went on holiday, the laptop went to sleep, and three DCs had no data for a week. Nobody had documented how the scripts worked. There was no error alerting. Adding a new DC meant manually copying and editing a script.

### What Alex built

**ADF pipeline architecture.** Alex designed a parent-child pipeline pattern in ADF. A master pipeline looped over a configuration table listing all DCs with their source credentials and ran a child pipeline for each DC in parallel using a ForEach activity.

The child pipeline had four activities:
1. Copy Data — extract from source (API, SFTP, or SQL) to Bronze ADLS container
2. Execute Notebook — trigger Databricks notebook to process Bronze to Silver
3. Execute Notebook — trigger Databricks notebook to process Silver to Gold
4. Web Activity — post a success or failure notification to a Teams webhook

**Databricks cluster strategy.** A job cluster was defined in each pipeline run — it spun up, ran the notebook, and terminated. No idle cluster cost. The cluster definition was stored in the ADF pipeline as a JSON configuration and versioned in Git.

**Delta Lake tables.** All data in ADLS was stored as Delta tables. Time travel meant Alex could run `SELECT * FROM silver_wms_picks VERSION AS OF 3` to inspect the state of the table three versions ago when a data quality issue was reported.

```python
# Databricks notebook — Bronze to Silver for WMS picks
# Parameters passed from ADF
dbutils.widgets.text("dc_id", "")
dbutils.widgets.text("run_date", "")

dc_id = dbutils.widgets.get("dc_id")
run_date = dbutils.widgets.get("run_date")

# Read Bronze
df = spark.read.format("parquet").load(f"/mnt/bronze/wms/dc={dc_id}/date={run_date}/")

# Validate schema
expected_columns = {"transaction_id", "shipment_id", "pick_time", "pick_errors", "dc_id"}
actual_columns = set(df.columns)
assert expected_columns.issubset(actual_columns), f"Missing columns: {expected_columns - actual_columns}"

# Transform
from pyspark.sql import functions as F

df_silver = (
    df
    .dropDuplicates(["transaction_id"])
    .withColumn("pick_date", F.to_date("pick_time"))
    .withColumn("dc_id", F.lit(dc_id))
    .filter(F.col("transaction_id").isNotNull())
)

# Write Silver as Delta
df_silver.write.format("delta").mode("overwrite").partitionBy("pick_date").save(f"/mnt/silver/wms_picks/dc={dc_id}/date={run_date}/")
```

**CI/CD setup.** ADF was connected to an Azure Repos Git repository. All pipeline definitions lived in the `adf-dev` branch. A release pipeline in Azure DevOps deployed to `adf-prod` after a successful build. Databricks notebooks were in the same repo, deployed via the Databricks CLI in the release pipeline.

```yaml
# Azure DevOps release pipeline — simplified
stages:
  - stage: Test
    jobs:
      - job: RunUnitTests
        steps:
          - script: pytest tests/ --tb=short
  - stage: Deploy
    dependsOn: Test
    jobs:
      - job: DeployADF
        steps:
          - script: |
              az datafactory pipeline create \
                --factory-name fttg-logistics-adf \
                --resource-group fttg-rg \
                --name MasterIngestionPipeline \
                --pipeline @pipelines/master_ingestion.json
      - job: DeployNotebooks
        steps:
          - script: |
              databricks workspace import_dir notebooks/ /Production/FTTG --overwrite
```

### The outcome

No more laptop dependencies. Pipeline failures sent Teams alerts within five minutes. Adding a new DC meant adding one row to the configuration table — no code changes. The engineering team could deploy a tested change to production in under ten minutes through the release pipeline. Delta time travel resolved a data quality dispute in 20 minutes that would previously have taken three days.

---

## Section 3 — Interview Q&A

**Q: What is Azure Data Factory and how does it fit into a data platform architecture?**

ADF is an orchestration and data movement service. It coordinates the flow of data between systems — extracting from sources, triggering transformations, loading to destinations, handling retries and failures. It is not a transformation engine itself.

In a typical Azure data platform, ADF is the glue. It calls Databricks notebooks for heavy transformation, copies files between storage accounts, calls APIs, and runs stored procedures. The actual computation happens in the services it calls.

At FTTG Logistics I used ADF as the master orchestrator. Every night it looped over the DC configuration table, called the extraction scripts, triggered the Databricks notebooks for Bronze-to-Silver and Silver-to-Gold transformation, and posted a completion notification. ADF handled the sequencing and error management. Databricks handled the compute.

---

**Q: What is Delta Lake and why is it important?**

Delta Lake is an open-source storage layer that adds ACID transactions, schema enforcement, and time travel to Parquet files on a data lake. The core of it is a transaction log — a JSON file that records every operation on the table. That log is what makes Delta reliable where raw Parquet is not.

ACID transactions mean concurrent reads and writes are safe. Time travel means you can query the table as it existed at any previous version. Schema enforcement means a pipeline writing the wrong schema fails loudly instead of silently corrupting the table.

At FTTG Logistics, time travel was the feature that saved us most often. When a data quality issue was reported, the first step was always querying the table at the version before the bad data appeared to understand what changed.

---

**Q: How do you structure CI/CD for a data engineering project?**

The same way a software engineer structures it for an application — version control for everything, automated tests, environment separation, and an automated deployment pipeline that promotes code from development to production.

For a Databricks and ADF stack: ADF pipeline JSON definitions live in a Git repository alongside the Databricks notebook code. A pull request triggers automated tests — unit tests on the transformation logic using pytest, schema validation tests on the output tables. A successful merge triggers a release pipeline in Azure DevOps that deploys the ADF pipelines via ARM templates and the notebooks via the Databricks CLI.

The critical rule is that nobody edits production directly. Every change goes through the pipeline. It feels slower until the first time it prevents a production outage.

---

**Q: How do you handle the cost of Databricks clusters in a production environment?**

Job clusters over interactive clusters for production workloads. An interactive cluster sits running whether or not a job is using it. A job cluster spins up for a specific pipeline run and terminates when it finishes. The cost difference is significant at scale.

I also right-size clusters for the workload. A notebook processing 50,000 rows does not need a 16-node cluster. I start with the minimum viable cluster size, benchmark it against the data volume, and scale up only if the job does not meet the time SLA.

For predictable scheduled workloads I use Databricks cluster policies to enforce standard configurations and prevent engineers from spinning up oversized interactive clusters for development.

---

## Section 4 — Pitfalls

**Pitfall 1 — Describing ADF as a transformation tool.**
ADF moves and orchestrates. It does not transform at scale. If you describe ADF as where your transformation logic lives, an interviewer will probe and find the gap quickly. The transformation happens in Databricks, Synapse, or Fabric notebooks that ADF triggers.

**Pitfall 2 — No mention of CI/CD.**
Any senior data engineer working on a team should be operating with version control and a deployment pipeline. If your answer to "how do you manage changes to your pipelines" is "I edit them in the ADF UI," that is a junior answer. Know Git integration, know environment separation, know what a release pipeline does.

**Pitfall 3 — Not knowing Delta Lake.**
Delta is now the default storage format for serious data engineering work on Azure and Databricks. If you describe working with Databricks but cannot explain what makes Delta different from raw Parquet — the transaction log, ACID guarantees, time travel — you have a gap that will show up in a technical screen.

**Pitfall 4 — Ignoring cost.**
Cloud compute costs money. Senior engineers think about it. Describing job clusters versus interactive clusters, right-sizing compute, and auto-termination policies shows you have operated in a real production environment where cloud bills matter. Not mentioning cost at all signals you have only worked in sandbox environments.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context)*
