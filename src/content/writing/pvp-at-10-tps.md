---
title: PvP at 10 TPS
date: 2026-10-09
kind: engineering
summary: Projectiles, movement and lag in a game that only updates 10 times a second.
project: arcana
---

Arcana's server runs at 10 ticks per second: one update every 100 ms. For fighting monsters
that's fine. Enemies move in patterns, and you dodge their bullets on your own screen.

PvP is different. Your target is a person who is also dodging, and at 10 TPS a sprinting
player can move almost a whole tile between updates. Shots that clearly hit on your screen
missed on the server. Players teleported around. It was hell.

So we're doing a full PvP rewrite. This is where it stands.

## Who decides a hit

The shooter's game says "I hit them", and the server checks the claim:

- Were both players allowed to fight? Different guilds, no spawn protection, same area.
- Has this bullet already hit this player? One hit per bullet per target.
- Was the shooter really where they say they shot from? They can't be further than they could
  have walked.
- Is the timing believable? Not from the future, and not too far in the past.
- Rewind the target to where the shooter saw them, and check the bullet actually passed
  through them, without going through a wall.

If anything fails it's just a miss. The server never says *why*, so a modified client can't
use it to learn the limits.

## Faster movement, only where it matters

The game itself stays at 10 TPS. That keeps everything else cheap. But on the PvP island,
movement runs faster: players send their position about 30 times a second instead of 10, and
the server passes hostile players' positions to each other between ticks, up to every 30 ms,
for the 32 nearest players. Everywhere else nothing changes.

On screen, other players glide smoothly between updates, and how long that glide takes adapts
to how steady the updates are arriving. Smooth movement is always on now; it used to be an
option.

## High ping vs low ping

When you shoot, you're aiming at where the other player *was* when your game last heard from
them. So the server rewinds the target by your ping plus that display delay.

- **Your ping is measured by the server**, not reported by you. Every update carries a number
  your game echoes back. Spikes are smoothed out, so faking lag doesn't buy you anything.
- **The rewind is capped at 300 ms.** Past that, you have to lead your shots. That keeps it
  fair for the person being shot: you never get hit for being somewhere long ago.
- **We fixed it for low ping too.** Test duels showed the rewind was going 35 to 85 ms too far
  back, and low-ping players were hurt the most. Cutting the display part of the rewind in
  half raised hits landing inside the window from 97.87% to 99.71%.

## Keeping it cheap

- Each player keeps a short position history (about 35 KB), searched in a few steps instead
  of scanned.
- Position updates are written straight into small byte arrays, with no new allocations per
  update.
- Each player gets one combined packet per tick instead of one per thing that changed.

## Rules that keep it fun

You get 15 seconds of protection when you arrive, and you can't attack during it either.
Attacking tags both players for 15 seconds, so nobody can teleport out of a fight. Hits on
players do a fraction of their normal damage, so a fight takes more than a couple of shots. And if you die, you drop everything,
which is why the island's loot is boosted.

## What's next

Dozens of automated tests cover the hit rules, the rewind, the relay and the movement limits,
and we test against simulated lag, jitter and stalls. What's left is the real thing: big fights
with real players on real connections.
