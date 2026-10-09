---
title: 'A list of 52,000 enemies froze the server'
date: 2026-10-09
kind: engineering
tag: learning
summary: Swapping a List for a HashSet took /killall from 26 seconds of frozen server to about 1.
project: arcana
---

Arcana has a developer command, `/killall`, that kills every enemy in a world. In the
Overworld it froze the whole server until we restarted it.

## The cause

In 2023 I wrote `DungeonWorld`, the base class every dungeon in Arcana is built on. It kept its
enemies in a `List`. A dungeon has a few hundred enemies, so that was fine.

Later the Overworld was built on the same class. It holds about 52,000 enemies.

Removing something from a `List` means walking the list until you find it. Every death removed
the enemy twice: once when it died, and again when it left the world. The second time it was
already gone, so that walk went all the way to the end and found nothing. Every kill paid for
two walks over up to 52,000 entries, and `/killall` did that 52,000 times on the main thread.

It wasn't only `/killall`. Every normal kill in the Overworld paid the same cost, just spread
out where nobody noticed it.

## The fix

```csharp
// before
public List<DungeonEnemy> dungeonEnemies;

// after: removing one takes the same time with 50 enemies or 50,000
public HashSet<DungeonEnemy> dungeonEnemies;
```

A `HashSet` finds an item by its hash instead of walking, so removing one doesn't depend on how
many there are. The open world's enemy lists per terrain got the same change.

Two more changes, so one huge command can't stall the game:

- **Kill in slices of time, not count.** `/killall` used to kill a fixed 300 per tick. Now it
  kills for at most 25 ms of each 100 ms tick, and the rest goes to players, packets and the
  other worlds.
- **Item ids in blocks.** Every dropped item asked Postgres for a new id, on the game thread.
  Now the server reserves 1,000 ids in one query and refills them in the background.

## The result

Measured against the real Overworld: 26 seconds of frozen main thread became about 1 second of
work, spread over about 35 ticks, never more than about 35 ms of any tick.

A test now kills the same number of enemies in a world of 2,000 and a world of 40,000, and fails
if the bigger one is much slower per kill. With the old `List` it would be about 20 times
slower, so this can't quietly come back.

## What I learned

Pick the collection for the biggest world the code will ever run in, not the one you're writing
it for. A `List` was right for a dungeon, and wrong the day the same class ran an open world.
