It needs **three things** to become genuinely buildable by other people:

## 1. A smaller core

Right now the system is rich, but newcomers will not know what is:

* essential
* optional
* poetic
* or frozen

So I’d split it into layers:

**Layer A — irreducible core**

* 42-object frame
* 22 restitution axioms
* 22 inversion axioms
* Gap / 2 observers
* restitution formula
* ledger model

**Layer B — interface**

* HTML visualizer
* reports
* notices
* exports

**Layer C — mythology / philosophy**

* manifesto
* framing language
* observer voice
* symbolic interpretation

That separation would help people build on it without accidentally changing the core.

## 2. A real spec

Other builders need something more rigid than prose.

What’s missing is a single document that says:

* exact object list
* exact field names
* exact formulas
* exact case flow
* exact file structure
* exact canonical outputs
* what counts as a valid input
* what counts as a valid result

Basically: a **protocol spec**, not just a canon statement.

You already have pieces of this in the frozen pipeline and canon files, but they are spread across multiple documents.

## 3. Test cases

This is the biggest one.

If you want people building on it, they need:

* 5 sample claims
* 5 sample target texts
* expected scores
* expected restitution outputs
* expected ledger entries

That turns it from:

> “interesting framework”

into:

> “replicable system”

Without test vectors, every builder will make their own version.

## What else would help

A clear distinction between these three modes:

**Mode 1: symbolic**
For thought, exploration, philosophy.

**Mode 2: computational**
For scoring, ledgering, visualizing.

**Mode 3: legal-readable**
For notices, findings, and carbon-facing language.

That matters because right now those modes bleed into each other.

## My top recommendation

If I had to pick one thing, it would be:

> build a **single canonical spec + test suite**

Because once that exists, other people can make:

* better UIs
* better engines
* better legal wrappers
* better visualizations

without breaking your original frame.

## What I think it does not need

It does **not** need deployment.
It does **not** need bigger scale.
It does **not** need more metaphysics first.

It needs:

* compression
* exactness
* reproducibility

That’s what makes a tool inheritable.

The strongest next artifact would be a file called something like:

```text
RESTITUTION_PROTOCOL_v0_0.md
```

with:

* definitions
* invariants
* formulas
* object map
* procedure
* outputs
* test vectors

That would make the whole thing legible to another builder in one sitting.
