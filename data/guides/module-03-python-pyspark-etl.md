# Module 3 — Python & PySpark ETL

**Client:** FTTG Logistics
**Skill level:** Senior IC
**Read time:** ~7 min

---

## The core problem Alex solves

FTTG Logistics runs eight distribution centers across the country. Each DC generates data from three systems: a warehouse management system (WMS) tracking inventory and picks, a GPS fleet system tracking truck locations and delivery times, and a labor management system tracking staff hours and productivity. All three systems export data differently — one via REST API, one via SFTP CSV dumps, one via a shared SQL Server database. None of them talk to each other.

The business wants a single performance dashboard showing on-time delivery rate, pick accuracy, cost per shipment, and staff utilization — across all eight DCs, updated daily. Alex's job is to build the pipeline that makes that possible.

---

## Section 1 — The concept

### ETL vs ELT

ETL and ELT describe the order of operations in a data pipeline.

**ETL — Extract, Transform, Load.** Data is extracted from the source, transformed in a processing layer outside the destination, then loaded in its final clean form. Traditional approach. Common when the destination is a relational database that works best with clean, structured data.

**ELT — Extract, Load, Transform.** Data is extracted from the source and loaded raw into the destination first, then transformed inside the destination using its own compute. Modern approach. Common when the destination is a cloud data lake or warehouse with enough compute to handle transformation at scale.

For most modern data engineering work, ELT is preferred. Load the raw data first — you preserve it, you can audit it, you can reprocess it if the transformation logic changes. Transform it downstream where the compute is cheap and scalable.

### Python for data engineering

Python is the dominant language for data engineering. Two libraries do most of the heavy lifting:

**pandas** — in-memory DataFrame manipulation. Fast and expressive for small to medium datasets (up to a few hundred MB comfortably). Good for reading files, shaping data, merging datasets, and writing outputs. The go-to for single-machine ETL.

**PySpark** — distributed processing using Apache Spark via a Python API. Designed for datasets that do not fit in memory. Spark splits data across a cluster of machines and processes it in parallel. The API looks similar to pandas but the execution model is fundamentally different — Spark is lazy, meaning it builds an execution plan and only runs when you call an action like `.write` or `.show`.

The rule of thumb: if it fits in memory on one machine, use pandas. If it does not, use PySpark.

### Pipeline patterns

A data pipeline is a sequence of steps that moves data from a source to a destination in a repeatable, reliable way. The key engineering concerns are:

**Idempotency** — running the pipeline twice should produce the same result as running it once. Avoid appending rows without deduplication logic.

**Error handling** — the pipeline should fail loudly and clearly when something goes wrong, not silently produce bad data. Log errors, raise exceptions, alert on failure.

**Incremental loading** — for large datasets, only process new or changed records rather than the full history on every run. Use watermarks — a timestamp or ID representing the last successfully processed record.

**Schema validation** — check that incoming data matches the expected shape before processing. A source system changing a column name silently is one of the most common causes of pipeline failures.

---

## Section 2 — Alex's story

### The situation at FTTG Logistics

Alex inherited a situation where each DC had its own analyst pulling data manually — downloading CSV exports, running Excel macros, and emailing summary reports to the regional manager every Monday. There was no consistency in how metrics were defined. On-time delivery meant different things at different DCs. There was no way to roll up to a single network view.

The three data sources were:
- WMS: REST API returning JSON, authenticated with an API key, updated hourly
- GPS fleet system: SFTP server dropping CSV files nightly at midnight
- Labor system: SQL Server database, read-only access granted

### What Alex built

**Extraction layer.** Three separate Python scripts, one per source.

```python
# WMS extraction — REST API
import requests
import pandas as pd
from datetime import date

def extract_wms_picks(api_key: str, dc_id: int, run_date: date) -> pd.DataFrame:
    url = f"https://wms-api.fttglogistics.com/picks"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {"dc_id": dc_id, "date": run_date.isoformat()}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()

    return pd.DataFrame(response.json()["picks"])
```

```python
# GPS extraction — SFTP CSV
import paramiko
import pandas as pd
import io

def extract_gps_deliveries(sftp_host: str, sftp_user: str, sftp_key_path: str, run_date: str) -> pd.DataFrame:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(sftp_host, username=sftp_user, key_filename=sftp_key_path)

    sftp = ssh.open_sftp()
    remote_path = f"/exports/deliveries_{run_date}.csv"

    with sftp.file(remote_path, "r") as f:
        df = pd.read_csv(io.BytesIO(f.read()))

    ssh.close()
    return df
```

**Transformation layer.** A PySpark notebook running in Fabric consolidated all three sources into a unified `MasterMetrics` Delta table. PySpark was chosen because the combined daily volume across 8 DCs — roughly 400,000 rows per day, three years of history — exceeded comfortable pandas territory for the join and aggregation operations.

```python
from pyspark.sql import functions as F

# Load silver layer inputs
picks = spark.read.format("delta").load("Tables/silver_wms_picks")
deliveries = spark.read.format("delta").load("Tables/silver_gps_deliveries")
labor = spark.read.format("delta").load("Tables/silver_labor_hours")

# Join and compute core metrics
metrics = (
    picks
    .join(deliveries, on=["dc_id", "shipment_id", "metric_date"], how="left")
    .join(labor, on=["dc_id", "metric_date"], how="left")
    .withColumn(
        "on_time_flag",
        F.when(F.col("actual_delivery") <= F.col("promised_delivery"), 1).otherwise(0)
    )
    .withColumn(
        "pick_accuracy_flag",
        F.when(F.col("pick_errors") == 0, 1).otherwise(0)
    )
    .groupBy("dc_id", "metric_date")
    .agg(
        F.count("shipment_id").alias("total_shipments"),
        F.sum("on_time_flag").alias("on_time_shipments"),
        F.sum("pick_accuracy_flag").alias("accurate_picks"),
        F.sum("labor_hours").alias("total_labor_hours"),
        F.sum("shipment_cost").alias("total_cost")
    )
    .withColumn("on_time_rate", F.round(F.col("on_time_shipments") / F.col("total_shipments"), 4))
    .withColumn("pick_accuracy_rate", F.round(F.col("accurate_picks") / F.col("total_shipments"), 4))
    .withColumn("cost_per_shipment", F.round(F.col("total_cost") / F.col("total_shipments"), 2))
)

metrics.write.format("delta").mode("overwrite").option("overwriteSchema", "true").saveAsTable("gold_master_metrics")
```

**Orchestration.** A Fabric Data Factory pipeline ran the full sequence nightly at 1am: extract from all three sources → load to Bronze → transform to Silver → aggregate to Gold. Each stage logged row counts and any errors. If any stage failed, the pipeline halted and sent an alert email.

### The outcome

Eight DCs. One metrics table. Updated every morning by 3am. The regional manager opened a single Power BI dashboard instead of waiting for eight Monday emails. Metric definitions were standardized — on-time delivery meant the same thing at every DC because the calculation lived in one place.

---

## Section 3 — Interview Q&A

**Q: When would you use PySpark instead of pandas?**

When the data does not fit comfortably in memory, or when the transformation involves joins and aggregations across datasets with tens of millions of rows or more. pandas is single-machine and in-memory — it is fast and expressive for small to medium datasets but it will run out of memory or become unacceptably slow at scale.

PySpark distributes the work across a cluster. The trade-off is overhead — Spark has a startup cost and a more complex execution model. For a 50,000-row CSV, pandas is faster and simpler. For 400 million rows across multiple joins, PySpark is the only practical choice.

At FTTG Logistics, the individual daily extracts were small enough for pandas. The historical aggregation across three years of data from all eight DCs was PySpark territory. I used pandas for extraction and PySpark for the Silver-to-Gold transformation.

---

**Q: How do you handle pipeline failures gracefully?**

Three layers of defense. First, validate at the source — check that the API returned the expected schema, that the CSV has the expected columns, that the row count is within a reasonable range. Fail early with a clear error message rather than loading bad data silently.

Second, use transactions where possible. Delta Lake supports ACID transactions — if a write fails halfway through, the previous state is preserved. I use `mode("overwrite")` on Delta tables rather than append for most Gold layer writes, so a failed run does not leave partial data.

Third, alert on failure. Every pipeline I build has a notification step — usually an email or Teams message — that fires if any stage raises an exception. The worst outcome is a silent failure that nobody notices until someone looks at a report and the data is wrong.

At FTTG Logistics I wrapped each extraction function in a try-except block that logged the error and raised it after logging, so the pipeline halted loudly rather than continuing with missing data.

---

**Q: What is idempotency and why does it matter in pipelines?**

An idempotent pipeline produces the same result regardless of how many times you run it. If you run it once or ten times, the destination looks the same.

It matters because pipelines fail and get rerun. If your pipeline appends rows on every run without checking for duplicates, a rerun after a failure creates duplicate records. Debugging data quality issues caused by non-idempotent pipelines is painful and time-consuming.

I make pipelines idempotent by using overwrite semantics on daily partition writes, by using `MERGE` statements when partial updates are needed, and by including deduplication steps in the Silver transformation layer using a unique key that exists in the source data.

---

**Q: How do you manage credentials and API keys in a pipeline?**

Never in the code. Not hardcoded, not in a config file that gets committed to source control.

For Fabric-based pipelines I use Azure Key Vault and reference secrets through the Fabric notebook or pipeline connection. For local development or standalone Python scripts I use environment variables loaded from a `.env` file that is excluded from version control via `.gitignore`.

The rule is simple: if the credential is in the code, it is one accidental commit away from being public. I have seen this happen in real engagements and the cleanup is significantly more painful than setting up proper secret management from day one.

---

**Q: What is the difference between ETL and ELT, and which do you prefer?**

ETL transforms data before loading it into the destination. ELT loads raw data first and transforms it inside the destination using its compute.

I default to ELT for modern cloud data platforms. Loading raw data first gives you a Bronze layer you can always reprocess from. If the transformation logic has a bug — which it will — you fix the logic and rerun against the raw data. With ETL, if the transformation happened before load, you may have lost the original data.

The exception is when the destination system has strict schema requirements, low compute capacity, or data privacy constraints that mean raw data should never land there. In those cases ETL is the right call.

---

## Section 4 — Pitfalls

**Pitfall 1 — Using pandas for everything.**
Candidates who have only worked on small datasets reach for pandas regardless of volume. A senior engineer knows the boundary — understands memory limits, knows when to switch to PySpark, and can articulate why. Saying "I always use pandas" in a senior interview is a yellow flag.

**Pitfall 2 — No mention of error handling.**
Junior pipeline code runs the happy path. Senior pipeline code handles the failure path. If your interview answer describes what the pipeline does when everything works but says nothing about what happens when the API is down, the file is missing, or the schema changes — that is a junior answer.

**Pitfall 3 — Hardcoded credentials.**
If you describe a pipeline and mention the API key was stored in the script, stop and acknowledge it. Every experienced interviewer will catch it. Better to say "in a prototype I used a config file, but in production I moved to Key Vault" than to describe it as your standard practice.

**Pitfall 4 — Describing Spark as "faster pandas."**
PySpark is not just a faster version of pandas. It has a different execution model — lazy evaluation, a query planner, distributed compute. Describing it as "like pandas but for big data" signals you have used it without understanding it. Know what lazy evaluation means and be able to explain why calling `.show()` on a Spark DataFrame triggers computation when the transformation steps before it did not.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context)*
