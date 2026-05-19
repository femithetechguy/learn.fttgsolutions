# Power BI Cheat Sheet Guide

> Quick reference for Power BI — from loading data and Power Query transformations to DAX measures, chart types, and data profiling.

📋 **Quick reference:** [Power BI Cheat Sheet](/cheatsheets/power-bi) — use this alongside the guide for fast syntax lookup while you read.

---

## Components & Views

### Power BI Desktop
The authoring environment installed on your machine. This is where you connect to data, transform it in Power Query, build the data model, write DAX measures, and design reports. All work is saved as a `.pbix` file.

**Three views in Desktop:**
- **Report View** — design and interact with visuals
- **Data View** — inspect table data, write calculated columns
- **Model View** — manage relationships between tables

### Power BI Service
The cloud platform at `app.powerbi.com`. You publish `.pbix` files here to share reports, manage datasets, configure scheduled refresh, set up row-level security, and distribute content through workspaces and apps. The Service is where end users consume reports.

### Power BI Mobile
iOS and Android apps for consuming reports on the go. Reports render responsively. Supports push notifications from data-driven alerts configured in the Service.

### Report View
The canvas where you build visuals. Each page is a separate tab. Visuals are placed on the canvas and connected to fields from the data model. Filters can be applied at the visual, page, or report level.

**Key panels:**
- **Filters pane** — visual, page, and report-level filters
- **Visualizations pane** — visual types, fields, and format settings
- **Fields pane** — all tables, columns, and measures in the model

### Data View
Shows the actual data inside each table after all Power Query transformations have been applied. Use it to inspect values, verify column types, and write calculated columns. Not available for DirectQuery models.

### Model View
Shows all tables and the relationships between them as a diagram. Use it to create, edit, and delete relationships, set relationship cardinality and cross-filter direction, and manage the overall model structure.

---

## Connecting Data

### Get Data
The entry point for connecting to any data source.

**Steps:**
1. Home ribbon → **Get Data**
2. Search for or select your source (Excel, SQL Server, SharePoint, Web, etc.)
3. Enter connection details and credentials
4. Select the tables or queries to load

**Common sources:** Excel, CSV, SQL Server, Azure SQL, SharePoint Online, Web, OData, Power BI datasets, Dataverse, Fabric Lakehouse

### Load dataset
After selecting tables in the Navigator, choose how to bring data in:

- **Load** — import directly into the model with no transformations
- **Transform Data** — open Power Query Editor to clean before loading

> Best practice: always click **Transform Data** first so you can inspect and type the data before it enters the model.

### Transform Data
Opens the Power Query Editor where all data shaping happens before the data enters the model. Every transformation creates a step in the Applied Steps pane and generates M code behind the scenes.

### Data view inspection
Once data is loaded, switch to Data View to verify:
- Column values look correct
- Data types are set (not all text)
- No unexpected nulls or blanks in key columns
- Row counts match expectations

### Refresh data
Forces Power Query to re-execute all queries and reload data from source.

- **Desktop:** Home → **Refresh**
- **Service:** Dataset → **Refresh now** (manual) or configure **Scheduled refresh**

Scheduled refresh in the Service runs on a cadence you define (up to 8x/day on Pro, 48x/day on Premium). Requires an on-premises data gateway for local data sources.

### Create relationship
Tell Power BI how tables are related so filters can flow between them.

**Steps:**
1. Go to **Model View**
2. Drag a column from one table to the matching column in another — or use **Manage Relationships** from the Home ribbon
3. Set **Cardinality** (Many-to-one is most common)
4. Set **Cross filter direction** (Single is default; Both enables bidirectional filtering)

> Best practice: always use integer surrogate keys for relationships, not text columns. Text relationships are slower and less reliable.

---

## Power Query Editor

### Open (on load)
When connecting to a new data source, click **Transform Data** in the Navigator instead of Load. This opens the Power Query Editor before any data enters the model.

### Open (already loaded)
To edit queries on a dataset already in the model:
**Home ribbon → Transform data → Transform data**

Or right-click any table in the Fields pane → **Edit query**

### Applied Steps
The panel on the right side of the Power Query Editor. Every transformation you apply — promote headers, change type, filter rows — creates a named step here. Steps execute in order from top to bottom.

- Click any step to see the table state at that point
- Right-click to rename, delete, or insert a step
- Click the `fx` bar to view or edit the M code for the selected step

### Remove Rows
Remove rows from the top, bottom, or based on a condition.

**UI:** Home → **Remove Rows** → Remove Top Rows / Remove Bottom Rows / Remove Duplicates / Remove Blank Rows / Remove Errors

**Generated M:**
```m
// Remove top 1 row
= Table.Skip(Source, 1)

// Remove blank rows
= Table.SelectRows(Source, each not List.IsEmpty(
    List.RemoveMatchingItems(Record.FieldValues(_), {"", null})
  ))
```

### Add Column
Add a new column based on a formula, conditional logic, or transformation of existing columns.

**UI:** Add Column tab → **Custom Column**

**Generated M:**
```m
// Add a full name column
= Table.AddColumn(Source, "FullName",
    each [FirstName] & " " & [LastName],
    type text
  )

// Add a conditional column
= Table.AddColumn(Source, "Tier",
    each if [Amount] >= 10000 then "High"
         else if [Amount] >= 5000 then "Mid"
         else "Low",
    type text
  )
```

### Replace Values
Replace a specific value in a column with another value.

**UI:** Right-click column → **Replace Values**

**Generated M:**
```m
= Table.ReplaceValue(Source, "N/A", null,
    Replacer.ReplaceValue, {"Status", "Region"})
```

### Change Data Type
Set the correct data type for each column. Critical — Power BI will not aggregate a number stored as text.

**UI:** Click the type icon left of the column header, or select column → Transform → **Data Type**

**Generated M:**
```m
= Table.TransformColumnTypes(Source, {
    {"OrderDate",  type date},
    {"Amount",     type number},
    {"CustomerID", type text},
    {"IsActive",   type logical}
  })
```

### Promote Headers
Use the first row of data as column headers. Common after importing from CSV or Excel files where the header row was treated as data.

**UI:** Home → **Use First Row as Headers**

**Generated M:**
```m
= Table.PromoteHeaders(Source, [PromoteAllScalars = true])
```

### Split Column
Split a column into multiple columns by a delimiter or by position.

**UI:** Transform → **Split Column** → By Delimiter / By Number of Characters

**Generated M:**
```m
// Split "FirstName LastName" on space
= Table.SplitColumn(Source, "FullName",
    Splitter.SplitTextByDelimiter(" ", QuoteStyle.Csv),
    {"FirstName", "LastName"}
  )
```

### Pivot / Unpivot
**Pivot** — turn row values into column headers (wide format).
**Unpivot** — turn column headers into row values (long format). Long format is what Power BI's data model requires for most analyses.

**UI:** Transform → **Pivot Column** or **Unpivot Columns**

**Generated M:**
```m
// Unpivot Jan, Feb, Mar columns into Month / Value rows
= Table.Unpivot(Source, {"Jan","Feb","Mar"}, "Month", "Value")

// Pivot Region column — turn North/South/East into separate columns
= Table.Pivot(Source,
    List.Distinct(Source[Region]),
    "Region", "Amount", List.Sum
  )
```

### Group By
Aggregate rows — equivalent to GROUP BY in SQL.

**UI:** Transform → **Group By**

**Generated M:**
```m
= Table.Group(Source, {"Region"}, {
    {"TotalSales",  each List.Sum([Amount]),      type number},
    {"OrderCount",  each Table.RowCount(_),       type number},
    {"AvgSale",     each List.Average([Amount]),  type number}
  })
```

### Merge Queries
Join two queries on a common key column — equivalent to SQL JOIN.

**UI:** Home → **Merge Queries**

**Generated M:**
```m
= Table.NestedJoin(
    Orders,    {"CustomerID"},
    Customers, {"CustomerID"},
    "CustomerData",
    JoinKind.LeftOuter
  )
```

Then expand the nested table column to bring in fields from the joined query.

### Append Queries
Stack two or more queries vertically — equivalent to SQL UNION ALL.

**UI:** Home → **Append Queries**

**Generated M:**
```m
= Table.Combine({Orders2023, Orders2024, Orders2025})
```

---

## Join Types

### Left Outer
All rows from the left (first) table. Matched rows from the right. Unmatched right rows appear as null. **Most common join type in Power Query.**
```
Left table:  all rows ✓
Right table: matches only (nulls where no match)
```

### Right Outer
All rows from the right (second) table. Matched rows from the left. Unmatched left rows appear as null.
```
Left table:  matches only (nulls where no match)
Right table: all rows ✓
```

### Full Outer
All rows from both tables. Unmatched rows on either side appear as null.
```
Left table:  all rows ✓
Right table: all rows ✓
```

### Inner
Only rows with a match in both tables. Rows without a match are dropped.
```
Left table:  matches only
Right table: matches only
```

### Left Anti
Only rows from the left table that have **no match** in the right table. Used to find missing records.
```
Use case: customers with no orders
```

### Right Anti
Only rows from the right table that have **no match** in the left table.
```
Use case: orders with no matching customer record
```

---

## Data Visualizations

### Bar Chart
Horizontal bars. Best for comparing categories when labels are long or there are many categories.
- **Axis:** category dimension (e.g. Product Name)
- **Values:** numeric measure (e.g. Total Sales)
- **Legend:** optional breakdown dimension

### Column Chart
Vertical bars. Best for showing values across a small number of categories or across time periods.
- **Axis:** time period or category
- **Values:** numeric measure
- **Legend:** optional series breakdown

### Line Chart
Shows trends over time. Requires a date or sequential axis.
- **Axis:** date column (month, quarter, year)
- **Values:** one or more measures
- **Secondary Y-axis:** available for a second scale

### Area Chart
Line chart with the area below the line filled. Emphasises volume and cumulative trends. Stacked area shows part-to-whole over time.

### Scatter Chart
Plot two numeric measures against each other to show correlation. Add a third measure as bubble size for a bubble chart.
- **X Axis:** first numeric measure
- **Y Axis:** second numeric measure
- **Details:** category to plot each point separately
- **Size:** optional third measure

### Combo Chart
Combine a column chart and a line chart on the same visual. Useful for showing volume (columns) alongside a rate or target (line).
- **Column Values:** e.g. Total Sales
- **Line Values:** e.g. Attainment %

### Treemap
Show part-to-whole relationships using nested rectangles. Size and colour represent values.
- **Group:** category dimension
- **Values:** numeric measure

### Pie Chart
Show part-to-whole for a small number of categories (3–5 max). Avoid when precise comparison matters — use a bar chart instead.

### Donut Chart
Same as pie chart with a hollow centre. Can display a summary value in the middle using a card overlay.

### Map
Plot data on a geographic map. Requires a location field — country, city, postcode, or lat/lon coordinates.
- **Location:** geographic field
- **Size:** numeric measure (bubble size)
- **Colour saturation:** second measure for colour intensity

### Card
Display a single KPI value prominently. No axis, no legend — just the number and an optional label.
- **Fields:** one measure

### Table
Display raw data in rows and columns. Supports conditional formatting, totals, and drill-through.
- **Columns:** any mix of dimensions and measures

### Matrix
Pivot-table style visual. Rows and columns can both be expanded hierarchically.
- **Rows:** one or more dimensions
- **Columns:** one or more dimensions
- **Values:** one or more measures

### Slicer
An interactive filter control on the report canvas. Users click to filter all other visuals on the page.
- **Field:** the dimension to filter by (date, region, category, etc.)
- **Style options:** dropdown, list, between (for dates/numbers), tile

---

## Creating Visuals

### Add a visual
1. Click an empty area of the report canvas
2. Select a visual type from the **Visualizations pane**
3. Drag fields from the **Fields pane** into the visual's field wells

Or: select fields first, then Power BI will suggest a visual type automatically.

### Fields: Values vs Axis
Every visual has specific field wells that control what goes where.

| Well | Purpose |
|------|---------|
| **Axis / Rows** | Category or time dimension — what you group by |
| **Values** | Numeric measure — what you aggregate |
| **Legend** | Breakdown series — adds colour grouping |
| **Tooltips** | Extra context shown on hover |
| **Drill through** | Fields available when drilling to another page |

### Change aggregation
When you add a numeric column (not a measure) to a visual, Power BI defaults to Sum. Change it by clicking the field in the well → select Sum / Average / Min / Max / Count / Count Distinct.

> Best practice: use explicit DAX measures instead of relying on implicit aggregation. Measures give you full control and are reusable across visuals.

### Format visual
Every visual has three panes in the Visualizations panel:
- **Fields** (build icon) — which data goes where
- **Format** (paint brush icon) — colours, labels, titles, borders, backgrounds
- **Analytics** (magnifying glass icon) — reference lines, forecasts, error bars

**Key formatting options:**
- Title text and font
- Data labels on/off and format
- Axis labels and scale
- Conditional formatting on values or backgrounds
- Legend position

### Drill down
If a field well has a hierarchy (Year → Quarter → Month → Day), drilling lets users navigate to lower levels of detail.

- **Drill down icon (↓↓)** — drill all points down one level
- **Single point drill** — click the drill icon then a data point to drill that point only
- **Expand all (↓ with lines)** — show the next level alongside the current level
- **Go up (↑)** — return to the previous level

### Cross-filter
By default, clicking a data point in one visual filters all other visuals on the page — this is cross-filtering.

**Edit interactions:**
1. Select a visual
2. Format ribbon → **Edit interactions**
3. For each other visual, choose: Filter (funnel icon), Highlight, or None

---

## DAX in Power BI

### New Measure
A measure is a dynamic calculation that evaluates in filter context. It does not store values — it calculates when a visual queries it.

**Steps:** Right-click a table in the Fields pane → **New measure** → type the DAX formula in the formula bar.

> Best practice: store all measures in a dedicated empty table called `_Measures` to keep them organised and easy to find.

```dax
Total Sales = SUM(FactSales[Amount])
```

### New Column
A calculated column is evaluated row by row at refresh time and stored in the table. Use for static row-level attributes, not for aggregations.

**Steps:** Right-click a table → **New column**

```dax
-- In DimCustomer
Full Name = DimCustomer[FirstName] & " " & DimCustomer[LastName]
```

### SUM / AVERAGE
The most common aggregation measures.
```dax
Total Revenue  = SUM(FactSales[Amount])
Average Order  = AVERAGE(FactOrders[OrderTotal])
```

### COUNT / DISTINCTCOUNT
Count rows or unique values.
```dax
Total Orders    = COUNTROWS(FactOrders)
Unique Customers = DISTINCTCOUNT(FactOrders[CustomerID])
```

### IF (conditional measure)
Return different values based on a condition.
```dax
Sales Status =
IF([Total Sales] >= [Sales Target], "On Target", "Below Target")
```

### CALCULATE (context modifier)
Evaluate a measure inside a modified filter context. The most important DAX function.
```dax
Sales USA =
CALCULATE([Total Sales], DimGeography[Country] = "USA")

Sales LY =
CALCULATE([Total Sales], SAMEPERIODLASTYEAR(DimDate[Date]))
```

### DIVIDE (safe division)
Divide two values safely — returns an alternate result instead of an error when the denominator is zero.
```dax
Attainment % =
DIVIDE([Total Sales], [Sales Target], 0)
```

### LEFT / LOWER / UPPER
Text manipulation in calculated columns.
```dax
Category Code = LEFT(DimProduct[ProductCode], 3)
Clean Email   = LOWER(DimCustomer[Email])
Upper Code    = UPPER(DimProduct[SKU])
```

### CALENDAR (date table)
Generate a complete date table — required for time intelligence functions.
```dax
DateTable =
VAR StartDate = DATE(2020, 1, 1)
VAR EndDate   = DATE(2030, 12, 31)
RETURN
ADDCOLUMNS(
    CALENDAR(StartDate, EndDate),
    "Year",        YEAR([Date]),
    "Month",       MONTH([Date]),
    "MonthName",   FORMAT([Date], "MMMM"),
    "Quarter",     "Q" & QUARTER([Date]),
    "WeekDay",     WEEKDAY([Date], 2),
    "IsWeekend",   IF(WEEKDAY([Date], 2) >= 6, TRUE, FALSE)
)
```

Mark the table as a date table: right-click the table → **Mark as date table** → select the Date column.

### WEEKDAY
Return the day of week as a number. Used in date tables and conditional measures.
```dax
-- 2 = Monday is day 1
WeekDayNum = WEEKDAY(DimDate[Date], 2)

IsWeekend =
IF(WEEKDAY(DimDate[Date], 2) >= 6, TRUE, FALSE)
```

### TOTALYTD (time intelligence)
Accumulate a measure from the start of the year to the current date in filter context.
```dax
Sales YTD =
TOTALYTD([Total Sales], DimDate[Date])

-- Fiscal year ending June 30
Sales Fiscal YTD =
TOTALYTD([Total Sales], DimDate[Date], "06-30")
```

---

## Data Profiling

Data profiling tools live in the Power Query Editor. Enable them under the **View** tab.

### Enable Data Profiling
**View tab in Power Query Editor → check:**
- Column quality
- Column distribution
- Column profile

By default profiling runs on the first 1,000 rows. Change this to the full dataset (see below).

### Column Quality
Shows a bar per column with three segments:
- **Valid** (green) — rows with a proper value
- **Error** (red) — rows where Power Query encountered an error
- **Empty** (grey) — rows with null or blank values

Use this to quickly spot columns with data quality issues before they enter the model.

### Column Distribution
Shows a histogram of value distribution for the selected column — how many distinct values, how many unique values (appear only once), and a frequency chart of the top values.

- **Distinct count** — number of unique values (including duplicates)
- **Unique count** — values that appear exactly once

Use this to identify high-cardinality columns, unexpected duplicates, and outlier values.

### Column Profile
Shows detailed statistics for the selected column:
- Min, max, average, standard deviation (for numeric columns)
- Value distribution bar chart
- Error and empty counts
- Top and bottom values

Click any bar in the distribution chart to filter the table preview to those rows.

### Profile based on entire dataset
By default profiling is limited to the first 1,000 rows. For accurate profiling on large datasets:

**Bottom-left of the Power Query Editor status bar → click "Column profiling based on top 1000 rows" → switch to "Column profiling based on entire data set"**

> Note: profiling the entire dataset can be slow on large sources. Use selectively.

### Error inspection
When Column Quality shows red (errors) in a column:
1. Click the red section of the quality bar — the table preview filters to error rows
2. Inspect the **Error** value in the column cell to see the error message
3. Common causes: type conversion failure (text in a number column), formula errors, source data issues

**Fix options:**
- **Remove Errors:** Home → Remove Rows → Remove Errors
- **Replace Errors:** Transform → Replace Errors → set a fallback value

---

## Publishing & Sharing

### Publish to Service
Send your `.pbix` file from Desktop to the Power BI Service.

**Steps:**
1. Home ribbon → **Publish**
2. Sign in with your Power BI account
3. Select the destination workspace
4. Click **Select** — Desktop uploads the report and dataset

After publishing, the report is accessible in the Service at `app.powerbi.com`.

### Share a report
Share a published report directly with individuals or groups.

**In the Service:**
- Open the report → **Share** button (top right)
- Enter email addresses
- Choose whether recipients can reshare or build new reports on the dataset

> Best practice: share through a **Power BI App** rather than direct links. Apps give you a stable URL, a curated navigation experience, and control over what users see.

### Schedule refresh
Keep dataset data current by configuring automatic refresh in the Service.

**Steps:**
1. Go to the workspace → find the **dataset**
2. Click the three-dot menu → **Settings**
3. Expand **Scheduled refresh**
4. Toggle on, set frequency and times
5. Save

**Requirements:**
- Data source credentials must be entered in dataset settings
- On-premises sources require an **on-premises data gateway** to be installed, running, and registered

### Export to PDF / PowerPoint
Export a report snapshot for distribution outside Power BI.

**In the Service:** File → **Export to PDF** or **Export to PowerPoint**

**In Desktop:** File → **Export** → PDF

> Note: exports are static snapshots — they do not carry interactivity. For live sharing, use the Service URL or embed.

### Embed in Teams / SharePoint
Surface Power BI reports inside Microsoft 365 tools without requiring users to navigate to app.powerbi.com.

**Teams:**
- Add a **Power BI tab** to any Teams channel → select the report

**SharePoint Online:**
- Add the **Power BI web part** to a SharePoint page → paste the report embed URL

Both methods respect Power BI permissions — users must have access to the report to see it.

### Row-Level Security (RLS)
Restrict what data each user sees based on their identity. Configured in Power BI Desktop, enforced by the Service.

**Steps in Desktop:**
1. Modeling ribbon → **Manage Roles**
2. Create a role (e.g. `FacilityDirector`)
3. Add a DAX filter expression on the relevant dimension table:
```dax
[UserEmail] = USERPRINCIPALNAME()
```
4. Publish to the Service

**Steps in Service:**
1. Go to the dataset → **Security**
2. Assign users or groups to each role

**Test RLS:**
- In Desktop: Modeling → **View as** → select a role to preview what that role sees
- In Service: dataset Security page → **Test as role**

> Best practice: filter on dimension tables, not fact tables. Apply the filter to the table that has a relationship to the fact — it will propagate through the model automatically.

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
