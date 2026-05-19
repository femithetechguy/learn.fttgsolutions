# Thinking in Models

Most data analysts jump straight to the spreadsheet. They open a blank query, start writing `SELECT *`, and hope something interesting surfaces. It rarely does.

The analysts who consistently produce insight do something different — they build a mental model of the business *before* they open a tool. They ask: what is this business actually trying to do? Where does money enter and leave? What decisions need to be made, and by whom?

That mental model becomes the lens through which data becomes meaningful.

## What a Mental Model Actually Is

A mental model isn't a diagram. It isn't a formal spec. It's a working understanding of cause and effect in a system.

For a retail business: customers browse, add to cart, purchase, sometimes return. Revenue depends on how many people convert and at what value. Retention depends on whether they come back. Every metric you'll ever build traces back to one of those dynamics.

If you don't have that understanding before you query, you're generating numbers without context. A 12% increase in cart abandonment is either a crisis or a rounding error depending on what else changed that week — and only your mental model tells you which.

## Building the Model Before You Touch Data

Before opening any tool, answer three questions:

**1. What decision is this data supposed to inform?**
Every analysis has a consumer. If you can't name the decision and the decision-maker, you're doing exploration, not analysis. Exploration is fine — but name it honestly so you don't confuse motion with progress.

**2. What would change my answer?**
Think through what you *expect* to find, then think about what evidence would flip that expectation. This stops you anchoring on the first pattern you see and calling it insight.

**3. What does "good" look like for this metric?**
Without a baseline, every number is orphaned. Good compared to what? Last month? Last year? The industry average? Competitors? Define the comparison before you look at the number, not after.

## The Trap of Tool-First Thinking

When you lead with the tool, the tool shapes your question. Excel encourages you to think in rows and columns. SQL encourages you to think in joins and aggregations. Power BI encourages you to think in visuals.

None of these shapes are the shape of the actual business problem. The business problem has a shape of its own — and your job is to map your tools onto it, not the other way around.

A useful exercise: describe the analysis you're about to do in plain English, to someone who has never used your tool. If you can't do it, you don't understand the problem well enough to query it yet.

## When the Model Is Wrong

It will be wrong. The model is a starting point, not a destination. Data frequently reveals that the mental model was incomplete or simply incorrect.

That's not a failure — that's the point. You built the model to have something to update. When you find the discrepancy between what you expected and what the data shows, *that discrepancy is the insight*. The gap between model and reality is almost always more interesting than a number that confirms what you already believed.

## Practical Habit

At the start of every analysis, write a single sentence describing what you expect to find and why. Put it somewhere you'll see it before you look at results.

Not because you'll always be right — but because comparing your expectation to reality, honestly and systematically, is what turns data work from number-fetching into understanding.

The tools are just the last step.
