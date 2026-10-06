---
title: Auto-updating Windows Game Launcher
org: Independent
role: Developer
dates: Cosmic Realm & Arcana
section: earlier
order: 10
summary: A WPF launcher that checks versions, downloads and unpacks updates in the background, and starts the game.
tech: [C#, WPF, XAML, .NET Framework 4.8]
---

The launcher is the first thing every player sees, and it has to be reliable: if an update
breaks, nobody can play.

- Version checking against the server, with local version tracking.
- Asynchronous ZIP downloads and extraction, with clear update states.
- Starting the game executable once it's up to date.
- Reusable XAML components and scalable interface assets, added without disturbing the existing
  update-and-play flow.
