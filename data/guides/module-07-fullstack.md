# Module 7 — Full-Stack Development (Next.js, NestJS, React)

**Client:** FTTG Retail
**Skill level:** Senior IC
**Read time:** ~6 min

---

## The core problem Alex solves

The Power BI reports at FTTG Retail work well for the analytics team and regional managers. But store managers — 300 of them — do not have Power BI Pro licenses. The business does not want to pay for 300 licenses. They want store managers to see their own store's KPIs in a simple, fast interface accessible from any device, without a Power BI login.

Alex is asked to build an internal web dashboard — a lightweight Next.js application that fetches live KPI data via a REST API and displays it in a clean interface. The backend reads from the Gold Lakehouse tables. The frontend is deployed on Vercel.

---

## Section 1 — The concept

### The modern full-stack architecture

A modern full-stack web application has three layers:

**Frontend** — what the user sees and interacts with. Built with a JavaScript framework. Responsible for rendering UI, handling user input, and making API calls to fetch data. The browser runs this code.

**Backend / API** — the server layer. Handles business logic, authentication, and data access. Receives requests from the frontend, queries the database or data source, and returns structured data (usually JSON). The server runs this code.

**Database / data layer** — where data is stored and queried. Could be a PostgreSQL database, a SQL Server instance, a REST API to an external service, or in this case, a Fabric Lakehouse SQL endpoint.

### Next.js

Next.js is a React framework built by Vercel. It adds server-side capabilities to a React application — server-side rendering (SSR), static site generation (SSG), API routes, and file-based routing. It is the dominant framework for production React applications.

Key concepts:

**App Router** — Next.js 13+ routing system. Pages and layouts are defined by folder structure under the `app/` directory. Each folder can have a `page.tsx` (the page component), a `layout.tsx` (shared wrapper), and a `loading.tsx` (loading state).

**Server Components vs Client Components** — By default in the App Router, components are Server Components. They run on the server and stream HTML to the browser. They can fetch data directly without an API call. Client Components (`"use client"` directive) run in the browser and handle interactivity — state, events, browser APIs.

**API Routes** — Next.js can serve its own backend via route handlers in `app/api/`. For a simple data API, this eliminates the need for a separate backend service.

### NestJS

NestJS is a Node.js backend framework built with TypeScript. It brings structure to Node.js development — modules, controllers, services, dependency injection — making it well-suited for larger backend applications that need clear separation of concerns.

When to use NestJS over Next.js API routes: when the backend logic is complex, when multiple frontend clients will consume the same API, when you need fine-grained control over authentication middleware, or when the team has separate frontend and backend engineers.

### React fundamentals for interviews

**Components** — reusable UI building blocks. A component is a function that takes props and returns JSX.

**State and hooks** — `useState` for local component state, `useEffect` for side effects (data fetching, subscriptions), `useContext` for sharing state across the component tree without prop drilling.

**Data fetching** — in the App Router, Server Components fetch data directly using `async/await`. Client Components use `useEffect` with `fetch`, or a library like SWR or React Query for caching and revalidation.

**TypeScript** — type safety for JavaScript. Interfaces define the shape of data. Union types handle conditional data shapes. Generics make reusable components and functions type-safe.

---

## Section 2 — Alex's story

### The situation at FTTG Retail

Store managers needed: today's sales vs target, week-to-date sales, top 5 selling products, and staff hours vs scheduled. That was it. Four KPIs. No drill-through, no date slicers, no complex filtering. A focused, fast, mobile-friendly interface.

The data source was the Gold Lakehouse in Fabric, which exposed a SQL endpoint Alex could query directly.

### What Alex built

**Backend — NestJS API.** Alex used NestJS for the backend because the authentication requirements were non-trivial — each store manager should only see their own store's data, and authentication needed to integrate with the company's existing Azure AD setup. NestJS with a JWT guard and an Azure AD token validation middleware handled this cleanly.

```typescript
// store-metrics.controller.ts
import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreMetricsService } from './store-metrics.service';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoreMetricsController {
  constructor(private readonly metricsService: StoreMetricsService) {}

  @Get(':storeId/kpis')
  async getStoreKpis(@Param('storeId') storeId: string, @Request() req) {
    // Verify the requesting user owns this store
    if (req.user.storeId !== storeId) {
      throw new ForbiddenException('Access denied');
    }
    return this.metricsService.getKpis(storeId);
  }
}
```

```typescript
// store-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class StoreMetricsService {
  constructor(private readonly db: DatabaseService) {}

  async getKpis(storeId: string) {
    const result = await this.db.query(`
      SELECT
        today_sales,
        today_target,
        wtd_sales,
        wtd_target,
        staff_hours_actual,
        staff_hours_scheduled
      FROM gold_store_kpis
      WHERE store_id = @storeId
        AND metric_date = CAST(GETDATE() AS DATE)
    `, { storeId });

    return result[0] ?? null;
  }
}
```

**Frontend — Next.js App Router.** A clean, mobile-first dashboard. Server Component for the initial page load, Client Component for the auto-refresh every 5 minutes.

```typescript
// app/dashboard/page.tsx — Server Component
import { KpiDashboard } from '@/components/KpiDashboard';
import { getServerSession } from 'next-auth';

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  // Initial fetch on the server — no loading spinner on first load
  const kpis = await fetch(
    `${process.env.API_URL}/stores/${session.user.storeId}/kpis`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  ).then(r => r.json());

  return <KpiDashboard initialData={kpis} storeId={session.user.storeId} />;
}
```

```typescript
// components/KpiDashboard.tsx — Client Component
'use client';

import { useState, useEffect } from 'react';
import { KpiCard } from './KpiCard';

interface StoreKpis {
  todaySales: number;
  todayTarget: number;
  wtdSales: number;
  wtdTarget: number;
  staffHoursActual: number;
  staffHoursScheduled: number;
}

export function KpiDashboard({ initialData, storeId }: { initialData: StoreKpis; storeId: string }) {
  const [kpis, setKpis] = useState<StoreKpis>(initialData);

  useEffect(() => {
    const interval = setInterval(async () => {
      const fresh = await fetch(`/api/stores/${storeId}/kpis`).then(r => r.json());
      setKpis(fresh);
    }, 5 * 60 * 1000); // refresh every 5 minutes

    return () => clearInterval(interval);
  }, [storeId]);

  const salesAttainment = Math.round((kpis.todaySales / kpis.todayTarget) * 100);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <KpiCard label="Today's Sales" value={`$${kpis.todaySales.toLocaleString()}`} subtext={`${salesAttainment}% of target`} />
      <KpiCard label="WTD Sales" value={`$${kpis.wtdSales.toLocaleString()}`} />
      <KpiCard label="Staff Hours" value={`${kpis.staffHoursActual}h`} subtext={`of ${kpis.staffHoursScheduled}h scheduled`} />
    </div>
  );
}
```

**Deployment.** Frontend deployed to Vercel with environment variables for the API URL and NextAuth configuration. Backend deployed as a containerized NestJS app on Azure Container Apps, connected to the Fabric SQL endpoint via a managed identity.

### The outcome

300 store managers had a mobile-friendly KPI view within three weeks. No Power BI license cost. Data refreshed every five minutes from the same Gold Lakehouse that fed the Power BI reports. The interface was fast — server-side rendered HTML on first load, client-side updates every five minutes. The whole thing was 12 components and one API module.

---

## Section 3 — Interview Q&A

**Q: What is the difference between Server Components and Client Components in Next.js?**

Server Components run on the server. They can fetch data directly, access server-side resources, and stream HTML to the browser. They do not add JavaScript to the client bundle — which makes pages faster. They cannot use browser APIs, React state, or event handlers.

Client Components run in the browser. They handle interactivity — state, events, browser APIs, real-time updates. They are declared with `"use client"` at the top of the file.

The pattern I use: Server Components for the initial data fetch and page shell — so the first load is fast and does not require a client-side API call. Client Components for anything that needs to update after the initial render — auto-refresh intervals, interactive filters, form submissions.

At FTTG Retail the dashboard page was a Server Component that fetched initial KPI data and passed it as props to a Client Component that handled the 5-minute auto-refresh.

---

**Q: When would you use NestJS instead of Next.js API routes for the backend?**

Next.js API routes are sufficient for simple backends — a handful of endpoints, straightforward data fetching, one client. They are fast to build and eliminate the need for a separate backend service.

NestJS makes sense when the backend is complex enough to benefit from structure — multiple modules with clear separation of concerns, sophisticated authentication middleware, many endpoints, or multiple frontend clients consuming the same API. NestJS's module system, dependency injection, and decorator-based routing make large backend codebases maintainable in a way that Next.js API routes do not naturally scale to.

At FTTG Retail I chose NestJS because the authentication requirements — Azure AD token validation, store-level access control — were non-trivial and warranted a structured backend with dedicated auth middleware rather than repeating auth logic across multiple API routes.

---

**Q: How do you handle authentication in a full-stack application?**

For internal enterprise applications the standard approach is OAuth 2.0 with the company's identity provider — Azure AD in a Microsoft shop. The user authenticates with Azure AD, gets a JWT access token, and the frontend includes that token in the Authorization header on every API call. The backend validates the token against Azure AD's public keys on every request.

For the frontend I use NextAuth — it handles the OAuth flow, session management, and token refresh. For the backend I use a JWT guard that extracts and validates the token from the Authorization header before the route handler runs.

The rule I never break: never trust the frontend for authorization. The store ID check in the backend — verifying that the requesting user actually owns the store they are querying — must happen server-side. A client-side check is decorative.

---

**Q: How does your full-stack experience make you a better BI engineer?**

It means I understand the full data journey. I know what the consuming application needs from the API. I understand why a REST endpoint returning 50,000 rows is a problem. I can build the data collection layer — forms and apps — as well as the reporting layer. I can talk to frontend engineers and backend engineers in their own vocabulary.

In a BI context specifically, it means I can build solutions that go beyond Power BI when Power BI is not the right tool. A mobile-first interface for field staff, an admin portal for managing configuration data, an API that exposes KPI data to a third-party system — these are real business needs that a BI engineer with full-stack skills can own end to end rather than handing off and waiting.

---

## Section 4 — Pitfalls

**Pitfall 1 — Describing React as a framework.**
React is a library, not a framework. It handles the view layer. Next.js is the framework — it adds routing, SSR, SSG, API routes, and build tooling on top of React. Mixing these up in an interview is a minor but notable signal.

**Pitfall 2 — Authorization only on the frontend.**
If you describe protecting a route with a client-side redirect when a user is not logged in, that is authentication UI — not authorization. Authorization is server-side. A senior engineer knows that every API endpoint must validate that the caller has permission to access that specific resource, regardless of what the frontend does.

**Pitfall 3 — Not knowing TypeScript.**
TypeScript is the standard for production Next.js and NestJS applications. If you describe your full-stack work as plain JavaScript, it signals either older experience or smaller-scale projects. Know the basics — interfaces, type annotations, generics, and why type safety matters in a large codebase.

**Pitfall 4 — Positioning full-stack as separate from BI.**
In a BI interview, full-stack skills are a differentiator — but only if you can explain how they make you better at BI work. The answer is not "I also know React." The answer is "I can build the data collection layer, the API layer, and the reporting layer, which means I own the full solution instead of depending on other teams for the parts I do not know."

---

*Part of the FTTG Learn Interview Prep Series — [Back to context guide](./fttg-interview-prep-context.md)*
