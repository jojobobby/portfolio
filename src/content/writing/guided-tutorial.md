---
title: 'A guided tutorial beats a room with 100 options'
date: 2026-10-09
kind: design
tag: learning
summary: Why Arcana's tutorial became a guided map instead of an open list of quests.
project: arcana
---

My first plan for Arcana's tutorial was a list of quests. Here's what to do, go do it in any
order. It sounded like freedom.

In practice, putting a new player in a room with 100 things to do and nowhere to start doesn't
work. They wander, miss the basics, and quit before the game gets good.

## The fix: a map that leads

So I built a tutorial map that walks you through the whole questline and still feels open:

- **Rooms with one lesson each.** You start in a small refuge, then move through a grove where
  you harvest your first materials, a market stall where you meet the crafting bench, a race,
  a shrine where you learn enchanting at the Forge, an armory for gear and storage, a training
  yard with your own dummy, and a graveyard that shows you what dying costs.
- **Doors that open as you learn.** Each room's quest opens the way forward, so you always
  know where to go next without being told every step.
- **Open rooms, not corridors.** The rooms are wide and dressed with props, so you can explore
  a little and never feel on rails.
- **Something new every room.** New effects and features keep stacking, so the tutorial keeps
  changing instead of repeating one idea.
- **Rewards from day one.** Every tutorial quest pays out real quest rewards, so you leave
  already progressing.

## Getting it right takes versions

I didn't get the race section right the first time. I built seven layouts for it, from a
meadow to a boardwalk to a lantern forest, before settling on one. Each new room gets reviewed
from a render before it ships.

## The point

A tutorial shouldn't be a slow walk past signs. It should feel like playing the game as fast
as you can, learning without noticing, and getting rewarded for it. Freedom is great, but only
once players know enough to use it.
