# Module 6 — Power Platform (Power Apps & Power Automate)

**Client:** FTTG Insurance
**Skill level:** Senior IC
**Read time:** ~5 min

---

## The core problem Alex solves

FTTG Insurance has a claims processing team of 40 adjusters across three offices. Every week each adjuster fills in a spreadsheet with their caseload status — open claims, closed claims, pending documentation, estimated payouts. They email the spreadsheet to their team lead. The team lead consolidates all 40 spreadsheets into a master file. The analytics team picks up the master file on Friday afternoon and updates the Power BI report. By the time leadership sees the numbers, they are five days old and have passed through at least three manual hand-off points where errors can enter.

Alex is brought in to eliminate the spreadsheet chain — replace it with a structured data collection app and an automated distribution workflow.

---

## Section 1 — The concept

### What Power Apps is

Power Apps is Microsoft's low-code application development platform. It lets you build functional business applications — forms, data entry screens, approval interfaces — without writing traditional application code. Apps connect to data sources through connectors — SharePoint, Dataverse, SQL Server, Excel, and hundreds of third-party services.

There are two types of Power Apps canvas apps:

**Canvas apps** — you design the UI from scratch, placing controls on a canvas. Full control over layout. Logic is written in Power Fx — a formula language similar to Excel. Good for custom data collection forms, task management interfaces, and field service apps.

**Model-driven apps** — the UI is generated automatically from a Dataverse data model. Less visual control but faster to build when your data is already in Dataverse and you need standard CRUD interfaces.

For most data collection and form scenarios in an enterprise BI context, canvas apps are the right tool.

**Dataverse** is the preferred data storage layer for Power Apps in a governed environment. It is a structured database with built-in security, role-based access control, and native integration with the rest of the Power Platform. For simpler scenarios, SharePoint lists or SQL Server tables work as the data source.

### What Power Automate is

Power Automate is Microsoft's workflow automation platform. It connects services and automates repetitive processes — sending notifications, moving files, triggering approvals, distributing reports. Flows are built visually by connecting triggers and actions.

**Automated flows** — triggered by an event. A new row is added to a SharePoint list, a form is submitted, an email arrives with a specific subject line.

**Scheduled flows** — run on a time cadence. Every Monday at 6am, refresh this dataset and email the result.

**Instant flows** — triggered manually by a user, often from a button in a Power App or Teams.

The key skill with Power Automate is knowing its limits. It is excellent for straightforward automation — notifications, approvals, file movement, report distribution. It is not the right tool for complex data transformation or high-volume event processing.

### Power Platform governance

In an enterprise environment, ungoverned Power Platform adoption creates problems — shadow IT apps connecting to sensitive data, flows running with personal credentials that break when someone leaves, no visibility into what is running or who owns it.

Key governance controls:
- **Data Loss Prevention (DLP) policies** — define which connectors can be used together. Prevent a flow from taking data from a corporate SharePoint and sending it to a personal Gmail account.
- **Environment strategy** — separate environments for development, testing, and production. Apps and flows are promoted between environments, not built directly in production.
- **Service accounts** — flows and apps in production should run under a service account, not a personal user account. Personal account credentials expire, accounts get disabled, people leave.
- **Center of Excellence (CoE) toolkit** — Microsoft's governance toolkit for Power Platform admins. Provides visibility into all apps and flows in the tenant, usage analytics, and compliance tooling.

---

## Section 2 — Alex's story

### The situation at FTTG Insurance

The weekly spreadsheet process had three problems. First, inconsistency — adjusters had different versions of the template, different ways of categorizing claim statuses, different date formats. The consolidation step was painful because nothing lined up cleanly. Second, latency — five days from data entry to dashboard update. Third, no audit trail — if a number looked wrong, there was no way to trace it back to which adjuster entered what and when.

### What Alex built

**Power Apps canvas app — Claims Status Entry.** A structured data entry form replacing the spreadsheet. Each adjuster logged in, saw only their own cases, and updated status fields through dropdowns and date pickers — no free text where structure was needed.

The app connected to a SharePoint list as the data source (chosen over Dataverse because the IT team had existing SharePoint governance in place). Each form submission created or updated a row in the list with the adjuster's email, timestamp, case ID, status, and estimated payout. Status fields were controlled dropdowns — Open, Pending Documentation, Awaiting Approval, Closed — eliminating the inconsistency from free-text entry.

Key Power Fx logic in the app:

```
// Only show cases assigned to the current user
Filter(
    ClaimsStatusList,
    AssignedAdjuster = User().Email
)

// Prevent submission if required fields are empty
If(
    IsBlank(txtCaseID.Text) || IsBlank(drpStatus.Selected.Value),
    Notify("Please complete all required fields", NotificationType.Error),
    Patch(
        ClaimsStatusList,
        LookUp(ClaimsStatusList, CaseID = txtCaseID.Text),
        {
            Status: drpStatus.Selected.Value,
            EstimatedPayout: Value(txtPayout.Text),
            LastUpdated: Now(),
            UpdatedBy: User().Email
        }
    )
)
```

**Power Automate flow — Weekly Report Distribution.** A scheduled flow ran every Friday at 4pm. It triggered a Power BI dataset refresh, waited for the refresh to complete, generated a PDF export of the summary report page, and emailed it to the leadership distribution list with a link to the live report.

The flow used the Power BI connector actions: `Refresh a dataset`, `Get refresh execution details` (polled in a Do Until loop until status was not "Unknown"), then `Export to file for Power BI reports`.

**Second flow — Submission reminder.** An automated flow checked every Thursday at noon for adjusters who had not submitted their weekly update. It sent a Teams message directly to those adjusters — not a group broadcast, a targeted nudge.

### The outcome

The consolidation step was eliminated — data went directly from the app into SharePoint, which Power BI read on refresh. The Friday report was available by 4:30pm instead of the following Wednesday. Claim status categories were consistent across all 40 adjusters for the first time. The audit trail — who updated what and when — was built into the SharePoint list automatically.

---

## Section 3 — Interview Q&A

**Q: What is the difference between Power Apps and Power Automate, and when do you use each?**

Power Apps is for building interfaces — forms, screens, data entry, task management. Users interact with it. Power Automate is for automating workflows — moving data, sending notifications, triggering actions based on events. It runs in the background.

They work together often. A Power App might have a Submit button that triggers a Power Automate flow to send an approval request. The flow sends the request, waits for the approval response, and updates the SharePoint list based on the outcome.

At FTTG Insurance, Power Apps handled the data collection interface and Power Automate handled the downstream automation — the report distribution and the submission reminders. Clear separation of concerns.

---

**Q: What is Dataverse and when would you use it over SharePoint as a data source?**

Dataverse is a structured relational database built into the Power Platform. It has row-level security, role-based access, complex data types, relationships between tables, and native integration with Power Apps model-driven apps. It is the right data layer for serious enterprise applications.

SharePoint lists are simpler and more familiar to most organizations. They work fine for lower-complexity scenarios — a few hundred rows, simple data shapes, teams that already use SharePoint.

I choose Dataverse when the app needs row-level security beyond what SharePoint can handle, when data has complex relational structure, or when the app will be used by external users. I choose SharePoint when the organization already has SharePoint governance, the data shape is simple, and speed of delivery matters more than long-term scalability.

At FTTG Insurance we used SharePoint because the IT governance was already there and the data shape was simple. If the claims data had needed complex relational structure or external adjuster access, Dataverse would have been the answer.

---

**Q: How do you govern Power Platform in an enterprise environment?**

Three things: DLP policies, environment strategy, and service accounts.

DLP policies control which connectors can be used together. You define a policy that says the SharePoint connector and the Office 365 Mail connector can work together, but the SharePoint connector and a personal storage connector cannot. This prevents data from leaking out of the corporate boundary through an automated flow.

Environment strategy means having separate dev, test, and prod environments. Apps and flows are built in dev, tested, and promoted to prod through a release process. Nothing gets built directly in production.

Service accounts mean flows and apps in production run under a dedicated non-personal account. If a flow runs under John Smith's account and John leaves, the flow breaks. A service account does not leave.

---

**Q: What are the limitations of Power Automate that a senior engineer should know?**

Three main ones. First, it is not designed for high-volume event processing — flows have concurrency limits and are not the right tool if you need to process thousands of events per second. Use Azure Event Hub or Service Bus for that.

Second, flow runs have a timeout limit — around 30 days for most flow types, but individual action timeouts are much shorter. Long-running processes need to be designed with checkpoints.

Third, error handling requires deliberate design. By default, if a step in a flow fails, the flow fails and stops. For production flows you need explicit error handling — Scope blocks with configure run after settings to catch failures and route to an error notification path rather than just stopping silently.

---

## Section 4 — Pitfalls

**Pitfall 1 — Treating Power Platform as a toy.**
Power Apps and Power Automate are used at enterprise scale by major organizations. Candidates who dismiss them as "just for non-technical users" signal they have not worked in a large Microsoft ecosystem. A senior BI engineer who can connect Power Platform to a governed data layer and build something production-ready is genuinely valuable.

**Pitfall 2 — Not knowing DLP policies.**
Any senior engineer who has deployed Power Platform in a regulated environment should know what DLP policies are and why they matter. If your answer to "how do you govern Power Platform" does not include DLP, it is incomplete.

**Pitfall 3 — Personal accounts in production flows.**
If you describe a Power Automate flow that runs under your personal account, an interviewer will probe. In an interview for a senior role, you should know that production flows use service accounts. If you used personal accounts in a past role, acknowledge it as a lesson learned.

**Pitfall 4 — Over-engineering with Power Platform.**
The opposite mistake — building complex transformation logic inside a Power Automate flow that should live in a database or a Python pipeline. Power Automate is for workflow automation, not heavy data processing. Know where it belongs in the architecture and where it does not.

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context.md)*
