---
title: 'Only check the parts of the map where players are'
date: 2026-10-09
kind: engineering
tag: adopted
summary: Cosmic Realm checked all 16,384 map chunks every tick to find the players. Now it keeps count.
project: cosmic-realm
---

Cosmic Realm's server splits every map into chunks of 16 by 16 tiles. Enemies only run when a
player is within 3 chunks of them. Everything else sleeps, which is how a big realm stays cheap.

The slow part was finding where the players were. Every tick, in every world, the server checked
every chunk of the map for a player. A 2048 by 2048 realm has 16,384 chunks. With ten players
online, almost all of those checks found nothing. It also built a new set for the answer each
time, which is more garbage for .NET to clean up.

## The fix

Stop searching and keep count. Every chunk has a counter of how many things are in it, and the
map keeps a set of the chunks that aren't empty:

```csharp
void Occupy(int x, int y) { var i = ChunkIndex(x, y); if (_chunkCounts[i]++ == 0) _occupied.Add(i); }
void Vacate(int x, int y) { var i = ChunkIndex(x, y); if (--_chunkCounts[i] == 0) _occupied.Remove(i); }
```

Entering, leaving or moving between chunks updates the counters. A chunk joins the set when its
count goes from 0 to 1, and leaves when it drops back to 0. Finding the players is now a walk over
only those chunks: ten players means at most ten chunks, however big the map is. Each world also
reuses one set for the result instead of making a new one every tick.

Tests check that the new version gives exactly the same answer as the old full scan, including
after hundreds of random moves.

## Same idea, other places

The same pass found two more cases:

- **Projectiles** were looked up by a `Tuple` key, which allocates on every add, remove and
  lookup. Now the key is one `long`, with the owner's id and the bullet's id packed together.
- **Always-visible enemies** were found by searching every enemy and object in every world, every
  100 ms. Now they add themselves to a small list when they spawn.

## What I adopted

If the server asks the same question every tick, keep the answer up to date as things change
instead of searching again. It costs a counter update on each move and saves a full search on
every tick.
