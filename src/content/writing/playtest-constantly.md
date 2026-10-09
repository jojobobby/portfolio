---
title: 'Adopted: The importance of CI-UT (continuous integration user testing) in game and system design'
date: 2026-10-09
kind: design
summary: Why I build games in a loop with playtest groups of 50+ players.
project: arcana
---

I don't think you can design a good game alone. You need people playing it every week and
telling you what's wrong.

For Arcana we run playtest groups of 50+ players. Every update goes to them first. They play
it, break it and tell us what felt bad. We fix it, and the next update goes back to the same
group. That loop doesn't stop. I call it CI-UT: continuous integration user testing. Every
build goes to real users, the same way every commit goes through CI.

## Why 50+

With five testers you get five opinions. With fifty you get patterns. The same complaint from
twenty people is a real problem. One loud complaint usually isn't. A big group also covers
every kind of player: the ones who rush, the ones who explore, the ones who only care about
loot, and the ones who will find the bug you'd never think to test.

## What makes it work

**Ship small and often.** A small update is easy to test and easy to roll back. A huge one
hides ten problems behind each other.

**Watch what they do, not only what they say.** People are great at telling you something
feels off and bad at telling you why. The numbers tell you where: which dungeon everyone
skips, where people log off, how long a drop really takes.

**Close the loop.** When something changes because of the testers, tell them. People keep
testing when they see their feedback land in the game.

**Keep the same group.** Testers who played last week notice when something got worse this
week. New testers can't.

## The point

We're not testing to prove we were right. We're testing to find out where we were wrong,
while it's still cheap to fix. Players can tell when a game was built with them in mind, and
the only way I know to do that is to keep asking them.
