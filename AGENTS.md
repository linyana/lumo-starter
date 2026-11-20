# Agent instructions

Two tests decide whether a line belongs in this file: **a comment is worth writing only where the
code cannot say what it means**, and **a rule no tool executes is a comment pretending to be a
standard**. So every rule below names its judge — a compiler error, a lint rule, an `ls` — or it is
decidable by reading the one file in front of you. Anything else is a preference, and a preference
belongs in the pull request that argues for it, not here.

## Comments

**Code is truth. A comment is written only where the code cannot say what it means.** The name, the type and the
shape of the branch already carry what happens; a comment that repeats them reads one level louder
and then drifts, and the reader soon believes the prose over the code. Write one where the reason is
not in this repository at all: a wire a spec dictates, an ordering that exists for a side effect
outside the function, a workaround pinned to a version someone else ships. `// handle the edge case`
and `// added for the delete flow` are the two shapes to cut — the first says nothing the next line
did not, the second narrates a change instead of the code that remains.

## Functions

**Two or more parameters become one object parameter.** A function takes one positional value at most;
anything beyond that is a named object, so a call site reads as labels and a new field never re-orders
existing arguments.

```ts
// no
getUsers(page, pageSize, filter);
// yes
getUsers({ page, pageSize, filter });
```
