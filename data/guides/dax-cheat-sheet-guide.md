# DAX Cheat Sheet Guide

> Quick reference for DAX functions used in Power BI — from aggregations and CALCULATE to time intelligence patterns.

📋 **Quick reference:** [DAX Cheat Sheet](/cheatsheets/dax) — use this alongside the guide for fast syntax lookup while you read.

---

## Aggregation

### SUM
Add all values in a column. Responds to filter context.
```dax
Total Sales = SUM(FactSales[Amount])
```

### SUMX
Iterate over a table row by row, evaluate an expression per row, then sum the results.
```dax
Total Revenue =
SUMX(
    FactSales,
    FactSales[Quantity] * FactSales[UnitPrice]
)
```

### AVERAGE
Return the arithmetic mean of all values in a column.
```dax
Avg Order Value = AVERAGE(FactOrders[OrderTotal])
```

### AVERAGEX
Iterate over a table and return the average of an expression evaluated per row.
```dax
Avg Line Total =
AVERAGEX(
    FactSales,
    FactSales[Quantity] * FactSales[UnitPrice]
)
```

### GEOMEAN
Return the geometric mean of a column. Useful for growth rates and ratios.
```dax
Geo Mean Price = GEOMEAN(FactSales[UnitPrice])
```

### GEOMEANX
Iterate over a table and return the geometric mean of an expression per row.
```dax
Geo Mean Revenue =
GEOMEANX(FactSales, FactSales[Quantity] * FactSales[UnitPrice])
```

### MIN / MAX
Return the smallest or largest value in a column.
```dax
Earliest Order Date = MIN(FactOrders[OrderDate])
Latest Order Date   = MAX(FactOrders[OrderDate])
```

### MINX / MAXX
Iterate over a table and return the min or max of an expression per row.
```dax
Smallest Line Total =
MINX(FactSales, FactSales[Quantity] * FactSales[UnitPrice])
```

### COUNT
Count the number of rows that contain a numeric value.
```dax
Count Orders = COUNT(FactOrders[OrderID])
```

### COUNTA
Count the number of non-blank values in a column (any data type).
```dax
Count Customers = COUNTA(DimCustomer[CustomerID])
```

### COUNTROWS
Count the total number of rows in a table.
```dax
Total Transactions = COUNTROWS(FactSales)
```

### COUNTBLANK
Count the number of blank values in a column.
```dax
Missing Dates = COUNTBLANK(FactOrders[ShippedDate])
```

### DISTINCTCOUNT
Count the number of unique non-blank values in a column.
```dax
Unique Customers = DISTINCTCOUNT(FactOrders[CustomerID])
```

### COUNTX
Iterate over a table and count rows where an expression is non-blank.
```dax
Orders With Discount =
COUNTX(
    FactOrders,
    IF(FactOrders[DiscountPct] > 0, 1, BLANK())
)
```

### PRODUCT
Multiply all values in a column together.
```dax
Cumulative Growth Factor = PRODUCT(FactGrowth[GrowthRate])
```

### PRODUCTX
Iterate over a table and multiply the results of an expression per row.
```dax
Combined Multiplier =
PRODUCTX(FactRates, FactRates[Rate])
```

---

## CALCULATE & Filter Context

### CALCULATE
Evaluate an expression in a modified filter context. The most important function in DAX.
```dax
Sales USA =
CALCULATE(
    [Total Sales],
    DimGeography[Country] = "USA"
)
```

### CALCULATETABLE
Like CALCULATE but returns a table instead of a scalar value.
```dax
USA Customers =
CALCULATETABLE(
    DimCustomer,
    DimGeography[Country] = "USA"
)
```

### FILTER
Return a subset of a table that satisfies a condition. Often used inside CALCULATE.
```dax
High Value Orders =
CALCULATE(
    [Total Sales],
    FILTER(FactOrders, FactOrders[OrderTotal] > 1000)
)
```

### ALL
Remove all filters from a table or column. Used to calculate totals that ignore slicers.
```dax
-- Ignore all filters on DimProduct
All Products Sales =
CALCULATE([Total Sales], ALL(DimProduct))

-- Ignore a specific column filter
All Categories Sales =
CALCULATE([Total Sales], ALL(DimProduct[Category]))
```

### ALLEXCEPT
Remove all filters from a table except the specified columns.
```dax
-- Keep the Date filter, remove everything else
Sales All Products =
CALCULATE(
    [Total Sales],
    ALLEXCEPT(DimProduct, DimDate[Year])
)
```

### ALLSELECTED
Remove filters applied inside the visual but keep filters from slicers and external context. Used for % of visible total.
```dax
% of Visible Total =
DIVIDE(
    [Total Sales],
    CALCULATE([Total Sales], ALLSELECTED())
)
```

### ALLNOBLANKROW
Like ALL but also removes the blank row that DAX adds for unmatched relationships.
```dax
Sales No Blank =
CALCULATE([Total Sales], ALLNOBLANKROW(DimProduct))
```

### REMOVEFILTERS
Remove filters from a table or column. Equivalent to ALL in a CALCULATE context — cleaner syntax.
```dax
Total Sales All Regions =
CALCULATE([Total Sales], REMOVEFILTERS(DimGeography))
```

### KEEPFILTERS
Add a filter without overriding existing filters on the same column. Intersects filters rather than replacing them.
```dax
Sales East Or West =
CALCULATE(
    [Total Sales],
    KEEPFILTERS(DimGeography[Region] IN {"East", "West"})
)
```

### ALLCROSSFILTERED
Remove all cross-filters applied to a table by other tables through relationships.
```dax
Unfiltered Product Count =
CALCULATE(
    COUNTROWS(DimProduct),
    ALLCROSSFILTERED(DimProduct)
)
```

### CROSSFILTER
Change the direction or behaviour of a relationship for a specific calculation.
```dax
-- Disable a relationship for this measure
Sales No Bridge =
CALCULATE(
    [Total Sales],
    CROSSFILTER(FactSales[ProductID], DimProduct[ProductID], NONE)
)
```

### USERELATIONSHIP
Activate an inactive relationship for a specific calculation.
```dax
Sales by Ship Date =
CALCULATE(
    [Total Sales],
    USERELATIONSHIP(FactSales[ShipDate], DimDate[Date])
)
```

---

## DAX Statements

### VAR / RETURN
Declare a variable to store an intermediate result. Makes complex measures readable and avoids duplicate evaluation.
```dax
Sales Growth % =
VAR CurrentSales = [Total Sales]
VAR PriorSales   = [Sales Prior Year]
RETURN
    DIVIDE(CurrentSales - PriorSales, PriorSales, 0)
```

### Multiple VAR
Chain multiple variables before the RETURN statement.
```dax
Attainment Label =
VAR Actual  = [Total Sales]
VAR Target  = [Sales Target]
VAR Pct     = DIVIDE(Actual, Target, 0)
VAR Label   =
    SWITCH(
        TRUE(),
        Pct >= 1,    "On Target",
        Pct >= 0.8,  "Near Target",
        "Below Target"
    )
RETURN Label
```

### COLUMN
Define a calculated column — evaluated row by row at refresh time, stored in the model.
```dax
-- In DimCustomer table
Full Name = DimCustomer[FirstName] & " " & DimCustomer[LastName]

-- In FactSales table
Line Total = FactSales[Quantity] * FactSales[UnitPrice]
```

### ORDER BY
Control the sort order of a column in the data model (used in calculated table scenarios).
```dax
Month Order =
SELECTCOLUMNS(
    CALENDAR(DATE(2024,1,1), DATE(2024,12,31)),
    "Month", FORMAT([Date], "MMM"),
    "MonthNum", MONTH([Date])
)
```

---

## Logical & Conditional

### IF
Return one value if a condition is true, another if false.
```dax
Sales Status =
IF([Total Sales] >= [Sales Target], "On Target", "Below Target")
```

### SWITCH
Evaluate a series of conditions and return the first match. Cleaner than nested IFs.
```dax
Tier =
SWITCH(
    TRUE(),
    [Total Sales] >= 100000, "Platinum",
    [Total Sales] >= 50000,  "Gold",
    [Total Sales] >= 10000,  "Silver",
    "Bronze"
)
```

### SWITCH(TRUE())
Evaluate multiple unrelated conditions — each branch is an independent boolean expression.
```dax
Performance Flag =
SWITCH(
    TRUE(),
    [Attainment %] >= 1.1,  "Exceeds",
    [Attainment %] >= 1.0,  "Meets",
    [Attainment %] >= 0.8,  "Near Miss",
    "Misses"
)
```

### IFERROR
Return an alternate value if an expression produces an error.
```dax
Safe Division =
IFERROR(
    DIVIDE([Total Sales], [Units Sold]),
    0
)
```

### COALESCE
Return the first non-blank value from a list of expressions.
```dax
Display Name =
COALESCE(
    DimCustomer[PreferredName],
    DimCustomer[FirstName],
    "Unknown"
)
```

### BLANK
Return a blank value. Use instead of 0 when you want visuals to hide empty rows.
```dax
Sales Or Blank =
IF([Total Sales] = 0, BLANK(), [Total Sales])
```

### AND / OR
Combine logical conditions. `&&` and `||` operators also work.
```dax
Premium Active =
IF(
    AND(DimCustomer[Tier] = "Premium", DimCustomer[Status] = "Active"),
    "Yes", "No"
)

-- Using operators
Premium Active =
IF(
    DimCustomer[Tier] = "Premium" && DimCustomer[Status] = "Active",
    "Yes", "No"
)
```

### NOT
Negate a boolean expression.
```dax
Not USA =
IF(NOT(DimGeography[Country] = "USA"), "International", "Domestic")
```

---

## Time Intelligence

> Time intelligence functions require a continuous date table marked as a date table in the model, with a single date column used in relationships.

### TOTALYTD
Calculate a year-to-date total. Accumulates from the start of the year to the last date in filter context.
```dax
Sales YTD =
TOTALYTD([Total Sales], DimDate[Date])

-- Custom year-end date (e.g. fiscal year ending June 30)
Sales Fiscal YTD =
TOTALYTD([Total Sales], DimDate[Date], "06-30")
```

### TOTALQTD
Calculate a quarter-to-date total.
```dax
Sales QTD = TOTALQTD([Total Sales], DimDate[Date])
```

### TOTALMTD
Calculate a month-to-date total.
```dax
Sales MTD = TOTALMTD([Total Sales], DimDate[Date])
```

### DATESYTD
Return a table of dates from the start of the year to the current date in filter context. Used inside CALCULATE.
```dax
Sales YTD =
CALCULATE(
    [Total Sales],
    DATESYTD(DimDate[Date])
)
```

### DATESQTD
Return a table of dates from the start of the quarter to the current date.
```dax
Sales QTD =
CALCULATE([Total Sales], DATESQTD(DimDate[Date]))
```

### DATESMTD
Return a table of dates from the start of the month to the current date.
```dax
Sales MTD =
CALCULATE([Total Sales], DATESMTD(DimDate[Date]))
```

### SAMEPERIODLASTYEAR
Return a table of dates shifted back exactly one year. Used for year-over-year comparisons.
```dax
Sales LY =
CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR(DimDate[Date])
)

Sales YoY % =
DIVIDE([Total Sales] - [Sales LY], [Sales LY], 0)
```

### DATEADD
Shift a set of dates by a specified interval and number of periods.
```dax
-- Prior month
Sales Prior Month =
CALCULATE(
    [Total Sales],
    DATEADD(DimDate[Date], -1, MONTH)
)

-- Prior year
Sales Prior Year =
CALCULATE(
    [Total Sales],
    DATEADD(DimDate[Date], -1, YEAR)
)
```

### PARALLELPERIOD
Return a full parallel period — the entire previous month, quarter, or year — regardless of what portion of the current period is selected.
```dax
Sales Full Prior Year =
CALCULATE(
    [Total Sales],
    PARALLELPERIOD(DimDate[Date], -1, YEAR)
)
```

### PREVIOUSMONTH
Return all dates in the previous month.
```dax
Sales Prev Month =
CALCULATE([Total Sales], PREVIOUSMONTH(DimDate[Date]))
```

### PREVIOUSQUARTER
Return all dates in the previous quarter.
```dax
Sales Prev Quarter =
CALCULATE([Total Sales], PREVIOUSQUARTER(DimDate[Date]))
```

### PREVIOUSYEAR
Return all dates in the previous year.
```dax
Sales Prev Year =
CALCULATE([Total Sales], PREVIOUSYEAR(DimDate[Date]))
```

### NEXTMONTH
Return all dates in the next month.
```dax
Forecast Next Month =
CALCULATE([Forecast], NEXTMONTH(DimDate[Date]))
```

### NEXTYEAR
Return all dates in the next year.
```dax
Forecast Next Year =
CALCULATE([Forecast], NEXTYEAR(DimDate[Date]))
```

### DATESBETWEEN
Return a table of dates between two specified dates.
```dax
Sales Last 30 Days =
CALCULATE(
    [Total Sales],
    DATESBETWEEN(
        DimDate[Date],
        TODAY() - 30,
        TODAY()
    )
)
```

### STARTOFMONTH / ENDOFMONTH
Return the first or last date of the month in the current filter context.
```dax
Month Start = STARTOFMONTH(DimDate[Date])
Month End   = ENDOFMONTH(DimDate[Date])
```

### STARTOFQUARTER / ENDOFQUARTER
Return the first or last date of the quarter.
```dax
Quarter Start = STARTOFQUARTER(DimDate[Date])
Quarter End   = ENDOFQUARTER(DimDate[Date])
```

### STARTOFYEAR / ENDOFYEAR
Return the first or last date of the year.
```dax
Year Start = STARTOFYEAR(DimDate[Date])
Year End   = ENDOFYEAR(DimDate[Date])
```

---

## Date & Time

### TODAY
Return today's date (no time component). Recalculates on each query.
```dax
Days Since Last Order =
INT(TODAY() - MAX(FactOrders[OrderDate]))
```

### NOW
Return the current date and time.
```dax
Last Refresh = NOW()
```

### DATE
Construct a date from year, month, and day integers.
```dax
Period Start = DATE(2024, 1, 1)
```

### DATEVALUE
Convert a date string to a date value.
```dax
Parsed Date = DATEVALUE("2024-06-15")
```

### YEAR / MONTH / DAY
Extract the year, month number, or day number from a date.
```dax
Order Year  = YEAR(FactOrders[OrderDate])
Order Month = MONTH(FactOrders[OrderDate])
Order Day   = DAY(FactOrders[OrderDate])
```

### QUARTER
Return the quarter number (1–4) for a date.
```dax
Fiscal Quarter = QUARTER(FactOrders[OrderDate])
```

### WEEKDAY
Return the day of the week as a number. Second argument controls which day is treated as day 1.
```dax
-- 2 = Monday is day 1 (ISO standard)
Day of Week = WEEKDAY(FactOrders[OrderDate], 2)
```

### WEEKNUM
Return the week number of the year.
```dax
Week Number = WEEKNUM(FactOrders[OrderDate], 2)
```

### DATEDIFF
Return the difference between two dates in the specified interval.
```dax
Days to Ship =
DATEDIFF(
    FactOrders[OrderDate],
    FactOrders[ShippedDate],
    DAY
)

Age in Years =
DATEDIFF(DimCustomer[BirthDate], TODAY(), YEAR)
```

### EOMONTH
Return the last day of the month, N months away from a start date.
```dax
-- Last day of the current month
Month End = EOMONTH(TODAY(), 0)

-- Last day of next month
Next Month End = EOMONTH(TODAY(), 1)
```

### EDATE
Return a date a specified number of months before or after a start date.
```dax
-- 3 months from order date
Due Date = EDATE(FactOrders[OrderDate], 3)
```

### FORMAT (date)
Convert a date to a formatted text string.
```dax
Month Label   = FORMAT(FactOrders[OrderDate], "MMM YYYY")   -- Jun 2024
Weekday Label = FORMAT(FactOrders[OrderDate], "dddd")        -- Monday
ISO Date      = FORMAT(FactOrders[OrderDate], "YYYY-MM-DD")  -- 2024-06-15
```

### CALENDAR
Generate a table of sequential dates between two dates.
```dax
DateTable =
CALENDAR(DATE(2020, 1, 1), DATE(2030, 12, 31))
```

### CALENDARAUTO
Generate a date table automatically based on the date columns in the model.
```dax
DateTable = CALENDARAUTO()
```

---

## Text

### EXACT
Compare two strings — case-sensitive. Returns TRUE or FALSE.
```dax
Exact Match =
EXACT(DimProduct[ProductCode], "SKU-001")
```

### CONCATENATE
Join two text strings. The `&` operator is more common in practice.
```dax
Full Name = CONCATENATE(DimCustomer[FirstName], " " & DimCustomer[LastName])

-- Using & operator (preferred)
Full Name = DimCustomer[FirstName] & " " & DimCustomer[LastName]
```

### CONCATENATEX
Iterate over a table and concatenate a text expression from each row, with an optional delimiter.
```dax
Product List =
CONCATENATEX(
    DimProduct,
    DimProduct[ProductName],
    ", ",
    DimProduct[ProductName], ASC
)
```

### LEFT / RIGHT
Return N characters from the left or right of a string.
```dax
Category Code = LEFT(DimProduct[ProductCode], 3)
Item Number   = RIGHT(DimProduct[ProductCode], 4)
```

### MID
Return a substring starting at a specified position.
```dax
-- MID(text, start_position, num_chars)
Region Code = MID(DimStore[StoreCode], 4, 2)
```

### LEN
Return the number of characters in a string.
```dax
Code Length = LEN(DimProduct[ProductCode])
```

### FIND
Return the position of a substring — case-sensitive. Errors if not found (use IFERROR or SEARCH for safety).
```dax
At Position = FIND("@", DimCustomer[Email])
```

### SEARCH
Return the position of a substring — case-insensitive. Returns an optional value if not found.
```dax
At Position = SEARCH("@", DimCustomer[Email], 1, 0)
-- Returns 0 if "@" not found
```

### SUBSTITUTE
Replace all occurrences of a substring with another string.
```dax
Clean Phone = SUBSTITUTE(DimCustomer[Phone], "-", "")
```

### REPLACE
Replace a portion of a string by position.
```dax
-- REPLACE(text, start_position, num_chars, new_text)
Masked ID = REPLACE(DimCustomer[CustomerID], 1, 3, "***")
```

### UPPER / LOWER
Convert text to uppercase or lowercase.
```dax
Upper Code = UPPER(DimProduct[ProductCode])
Lower Email = LOWER(DimCustomer[Email])
```

### TRIM
Remove leading and trailing spaces from a string.
```dax
Clean Name = TRIM(DimCustomer[FirstName])
```

### VALUE
Convert a text string to a number.
```dax
Numeric Code = VALUE(DimProduct[CodeAsText])
```

### FORMAT (text)
Convert a value to a formatted text string using a format code.
```dax
Pct Label    = FORMAT([Attainment %], "0.0%")       -- 92.5%
Currency     = FORMAT([Total Sales], "$#,##0")       -- $1,250,000
Decimal      = FORMAT([Avg Score], "0.00")           -- 4.75
```

---

## Relationship & Virtual

### RELATED
Retrieve a value from a related table (many-to-one relationship). Used in calculated columns.
```dax
-- In FactSales calculated column
Category = RELATED(DimProduct[Category])
```

### RELATEDTABLE
Return the related table on the many side of a relationship. Used in calculated columns on the one side.
```dax
-- In DimCustomer calculated column
Order Count = COUNTROWS(RELATEDTABLE(FactOrders))
```

### TREATAS
Apply a table as a filter as if it were a filter on a specific column — creates a virtual relationship.
```dax
Sales Selected Products =
CALCULATE(
    [Total Sales],
    TREATAS(VALUES(SelectedProducts[ProductID]), DimProduct[ProductID])
)
```

### USERELATIONSHIP
Activate an inactive relationship for a specific measure.
```dax
Deliveries by Ship Date =
CALCULATE(
    [Total Deliveries],
    USERELATIONSHIP(FactDeliveries[ShipDate], DimDate[Date])
)
```

### CROSSFILTER
Modify the cross-filter direction of a relationship for a specific calculation.
```dax
-- Make a one-way relationship bidirectional for this measure
Customer Count per Product =
CALCULATE(
    DISTINCTCOUNT(FactSales[CustomerID]),
    CROSSFILTER(FactSales[ProductID], DimProduct[ProductID], BOTH)
)
```

---

## Table Functions

### SUMMARIZE
Group a table by specified columns and optionally add aggregation columns.
```dax
Sales by Category =
SUMMARIZE(
    FactSales,
    DimProduct[Category],
    "Total Sales", SUM(FactSales[Amount])
)
```

### SUMMARIZECOLUMNS
The modern, preferred alternative to SUMMARIZE. More flexible and better performing.
```dax
Sales Summary =
SUMMARIZECOLUMNS(
    DimProduct[Category],
    DimDate[Year],
    "Total Sales", [Total Sales],
    "Order Count", [Total Orders]
)
```

### GROUPBY
Group rows in a table and apply aggregations using CURRENTGROUP().
```dax
Category Totals =
GROUPBY(
    FactSales,
    DimProduct[Category],
    "Total", SUMX(CURRENTGROUP(), FactSales[Amount])
)
```

### ADDCOLUMNS
Add calculated columns to a table expression without modifying the original table.
```dax
Sales With Margin =
ADDCOLUMNS(
    FactSales,
    "Margin", FactSales[Amount] - FactSales[Cost],
    "Margin %", DIVIDE(FactSales[Amount] - FactSales[Cost], FactSales[Amount], 0)
)
```

### SELECTCOLUMNS
Return a table with only the specified columns — similar to SELECT in SQL.
```dax
Customer Names =
SELECTCOLUMNS(
    DimCustomer,
    "ID",   DimCustomer[CustomerID],
    "Name", DimCustomer[FirstName] & " " & DimCustomer[LastName]
)
```

### DISTINCT
Return a one-column table of unique values from a column.
```dax
Unique Countries = DISTINCT(DimGeography[Country])
```

### VALUES
Return a one-column table of unique values including the blank row if present. Respects filter context.
```dax
Selected Year = VALUES(DimDate[Year])
```

### TOPN
Return the top N rows of a table ordered by an expression.
```dax
Top 10 Products =
TOPN(
    10,
    DimProduct,
    [Total Sales], DESC
)
```

### NATURALINNERJOIN
Join two tables on their common columns — like SQL INNER JOIN.
```dax
Joined Table =
NATURALINNERJOIN(SalesData, ProductData)
```

### NATURALLEFTOUTERJOIN
Left outer join two tables on their common columns.
```dax
All Products With Sales =
NATURALLEFTOUTERJOIN(DimProduct, SalesSummary)
```

### UNION
Combine two or more tables with the same column structure. Keeps duplicates.
```dax
All Orders =
UNION(Orders2023, Orders2024)
```

### INTERSECT
Return rows that exist in both tables.
```dax
Repeat Customers =
INTERSECT(
    VALUES(Orders2023[CustomerID]),
    VALUES(Orders2024[CustomerID])
)
```

### EXCEPT
Return rows from the first table that do not exist in the second.
```dax
New Customers 2024 =
EXCEPT(
    VALUES(Orders2024[CustomerID]),
    VALUES(Orders2023[CustomerID])
)
```

### ROW
Create a single-row table with named columns.
```dax
Summary Row =
ROW(
    "Total Sales", [Total Sales],
    "Total Orders", [Total Orders]
)
```

### GENERATE
Cross join a table with a table returned by a function evaluated per row.
```dax
Expanded =
GENERATE(
    DimProduct,
    ROW("Sales", CALCULATE([Total Sales]))
)
```

### GENERATESERIES
Create a single-column table of sequential values.
```dax
Numbers 1 to 100 = GENERATESERIES(1, 100, 1)
Date Sequence    = GENERATESERIES(DATE(2024,1,1), DATE(2024,12,31), 1)
```

---

## Information

### SELECTEDVALUE
Return the value of a column when exactly one value is in filter context. Returns an alternate result otherwise.
```dax
Selected Year =
SELECTEDVALUE(DimDate[Year], "Multiple Years")
```

### HASONEVALUE
Return TRUE if a column has exactly one value in the current filter context.
```dax
Single Year Selected = HASONEVALUE(DimDate[Year])
```

### HASONEFILTER
Return TRUE if exactly one direct filter is applied to a column.
```dax
Is Year Filtered = HASONEFILTER(DimDate[Year])
```

### ISFILTERED
Return TRUE if a direct filter is applied to a column.
```dax
Region Is Filtered = ISFILTERED(DimGeography[Region])
```

### ISCROSSFILTERED
Return TRUE if a column is being filtered directly or through a related table.
```dax
Product Is Cross Filtered = ISCROSSFILTERED(DimProduct[Category])
```

### ISINSCOPE
Return TRUE if a column is in the grouping context of a visual — useful in matrix totals.
```dax
Show Subtotal =
IF(
    ISINSCOPE(DimDate[Month]),
    [Total Sales],
    BLANK()
)
```

### ISBLANK
Return TRUE if a value is blank.
```dax
No Data Flag = ISBLANK([Total Sales])
```

### ISNUMBER
Return TRUE if a value is a number.
```dax
Is Numeric = ISNUMBER(DimProduct[Code])
```

### ISTEXT
Return TRUE if a value is text.
```dax
Is Text = ISTEXT(DimCustomer[PostalCode])
```

### ISLOGICAL
Return TRUE if a value is a boolean (TRUE/FALSE).
```dax
Is Boolean = ISLOGICAL(DimProduct[IsActive])
```

### ISERROR
Return TRUE if an expression results in an error.
```dax
Has Error = ISERROR(DIVIDE([Sales], [Target]))
```

### NAMEOF
Return the name of a column or measure as a text string. Useful for dynamic titles.
```dax
Measure Name = NAMEOF([Total Sales])  -- returns "Total Sales"
```

### USERPRINCIPALNAME
Return the UPN (email address) of the currently logged-in user. Core to dynamic RLS.
```dax
Current User = USERPRINCIPALNAME()
-- Returns "alex.mensah@fttgsolutions.com"
```

### FIRSTNONBLANK
Return the first value in a column for which an expression is non-blank.
```dax
First Active Date =
FIRSTNONBLANK(DimDate[Date], [Total Sales])
```

### LASTNONBLANK
Return the last value in a column for which an expression is non-blank.
```dax
Last Sale Date =
LASTNONBLANK(DimDate[Date], [Total Sales])
```

---

## Ranking

### RANKX
Return the rank of a value in a table. Equivalent to SQL RANK() as a measure.
```dax
Product Sales Rank =
RANKX(
    ALL(DimProduct[ProductName]),
    [Total Sales],
    ,
    DESC,
    Dense   -- Dense = no gaps in ranking
)
```

### TOPN
Return the top N rows of a table — used in table functions and as a filter.
```dax
-- Use as a filter inside CALCULATE
Top 5 Products Sales =
CALCULATE(
    [Total Sales],
    TOPN(5, DimProduct, [Total Sales], DESC)
)
```

---

## Math & Stats

### DIVIDE
Safely divide two numbers — returns an alternate result instead of an error when the denominator is zero.
```dax
Attainment % =
DIVIDE([Total Sales], [Sales Target], 0)
-- Returns 0 instead of error when target is 0
```

### ROUND
Round a number to a specified number of decimal places.
```dax
Rounded Sales = ROUND([Total Sales] / 1000, 1)  -- to nearest 0.1K
```

### ROUNDUP / ROUNDDOWN
Always round up or always round down.
```dax
Units Needed = ROUNDUP([Demand] / [Pack Size], 0)
```

### INT
Return the integer portion of a number (truncates toward zero).
```dax
Full Years = INT(DATEDIFF(DimCustomer[BirthDate], TODAY(), DAY) / 365)
```

### TRUNC
Truncate a number to a specified number of decimal places without rounding.
```dax
Truncated = TRUNC(3.999, 1)  -- 3.9
```

### ABS
Return the absolute value of a number.
```dax
Variance = ABS([Actual] - [Target])
```

### MOD
Return the remainder of a division.
```dax
Is Even = IF(MOD(FactSales[RowNum], 2) = 0, "Even", "Odd")
```

### POWER
Raise a number to a power.
```dax
Squared = POWER([Value], 2)
```

### SQRT
Return the square root of a number.
```dax
Std Dev Approx = SQRT([Variance])
```

### SIGN
Return 1 if positive, -1 if negative, 0 if zero.
```dax
Direction = SIGN([Sales Change])
```

### MEDIAN
Return the median value of a column.
```dax
Median Order Value = MEDIAN(FactOrders[OrderTotal])
```

### MEDIANX
Iterate over a table and return the median of an expression.
```dax
Median Line Total =
MEDIANX(FactSales, FactSales[Quantity] * FactSales[UnitPrice])
```

### PERCENTILE.INC
Return the value at a given percentile (inclusive). 0 = min, 1 = max.
```dax
90th Percentile = PERCENTILE.INC(FactOrders[OrderTotal], 0.9)
```

### STDEV.P / STDEV.S
Return the standard deviation — P for entire population, S for a sample.
```dax
Sales Std Dev Pop    = STDEV.P(FactSales[Amount])
Sales Std Dev Sample = STDEV.S(FactSales[Amount])
```

---

## DAX Operators

### = (equal)
Test equality. Also used for assignment in calculated columns.
```dax
Is USA = DimGeography[Country] = "USA"
```

### == (strict equal)
Test equality treating BLANK and 0 as different values. Use when distinguishing blank from zero matters.
```dax
Strictly Zero = [Total Sales] == 0
-- Returns FALSE if [Total Sales] is BLANK
```

### > / < / >= / <=
Comparison operators for numeric and date values.
```dax
High Value = FactOrders[OrderTotal] >= 1000
Recent     = FactOrders[OrderDate]  >  DATE(2024, 1, 1)
```

### <> (not equal)
Test that two values are not equal.
```dax
Not Cancelled = FactOrders[Status] <> "Cancelled"
```

### + - * / ^
Standard arithmetic operators. `^` is exponentiation.
```dax
Line Total    = FactSales[Quantity] * FactSales[UnitPrice]
Margin        = FactSales[Amount]   - FactSales[Cost]
Growth Factor = 1.05 ^ 3  -- 1.05 to the power of 3
```

### & (concatenation)
Concatenate two text strings.
```dax
Full Name = DimCustomer[FirstName] & " " & DimCustomer[LastName]
```

### && (logical AND)
Return TRUE only if both conditions are true.
```dax
Premium Active =
DimCustomer[Tier] = "Premium" && DimCustomer[Status] = "Active"
```

### || (logical OR)
Return TRUE if at least one condition is true.
```dax
Key Region =
DimGeography[Region] = "East" || DimGeography[Region] = "West"
```

### IN { } (list test)
Test whether a value exists in a list. Equivalent to SQL IN.
```dax
Key Regions =
DimGeography[Region] IN { "East", "West", "Central" }

-- In a measure
Key Region Sales =
CALCULATE(
    [Total Sales],
    DimGeography[Region] IN { "East", "West" }
)
```

---

*Part of the FTTG Learn Cheat Sheet series — [fttgsolutions.com](https://learn.fttgsolutions.com/cheatsheets)*
