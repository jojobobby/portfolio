---
title: C# and .NET
org: Tidan Games, Cosmic Realm and my own projects
role: Lead Engineer
dates: 2018 to Present
section: professional
order: 4
summary: Eight years of C#. Game servers, APIs, websites, launchers and tools.
tech: [C#, .NET 10, ASP.NET Core, Razor Pages, WPF / XAML, Blazor, MonoGame, prometheus-net, NUnit, xUnit]
snippet:
  file: Arcana / DungeonWorld.cs, commit 9846c6e
  code: |2
      public List<Player> rewardedPlayers;
      public List<DungeonEnemy> dungeonBosses;
    - public List<DungeonEnemy> dungeonEnemies;
    + // A set, not a list: the Overworld holds ~50k enemies...
    + public HashSet<DungeonEnemy> dungeonEnemies;
stats:
  - { value: '8 yrs', label: 'writing C#' }
  - { value: '2,000+', label: 'of my commits touch C#' }
  - { value: '4.6 to 10', label: '.NET versions upgraded through' }
---

C# is the language I've used the longest. The first game server I ran, in 2018, was written in
it. Today it runs both of my games, their websites, their launchers and the tools around them.

I stay with it because one language covers everything from the game loop to the launcher, so I
can follow a bug from the server to the website to the launcher without switching tools.

## Arcana

From Cosmic v2 in 2021, through Tidan's Realm, to Arcana today.

- **Game server** on .NET 10: worlds, combat, PvP, loot and a player market, at 10 ticks a second.
- **Account and game APIs** served from the same process.
- **Website and balance tool** in ASP.NET Core Razor Pages, and an encounter editor on ASP.NET Core.
- **Launcher** in WPF and XAML: SHA-256 checked downloads, self-updates and NUnit tests.
- **Storage behind one interface**, with Postgres, in-memory and cached versions, so the same
  game code runs against any of them.
- Upgraded the server from .NET 5 to 7, 8, 9 and then 10.

## Cosmic Realm

2018 to 2026, from .NET Framework 4.6 to .NET 10.

- **Game server**, now with worlds ticking in groups on their own threads instead of all on one.
- **Account server** on ASP.NET Core. Clients that already have the 4.5 MB of game data get a
  "not modified" reply instead of downloading it again. In a test with 100 clients starting at
  once, start-up took 7.4 s with nothing cached and 0.1 s with it cached.
- **Shop website** in Razor Pages with Stripe checkout, talking to the account server with
  HMAC-signed requests.
- **Balancer** in Razor Pages for tuning items, loot and bullet patterns.
- **Launcher** in WPF and XAML (MVVM), rebuilt as a state machine with 226 tests.

## Keeping it fast

Two case studies:

- [A list of 52,000 enemies froze the server](/writing/list-that-froze-the-server): my biggest
  speedup on a single call. One `/killall` in Arcana went from 26 seconds to about 1, with
  `List` swapped for `HashSet`.
- [Only check the parts of the map where players are](/writing/only-check-where-players-are):
  Cosmic Realm, tracking occupied chunks instead of scanning 16,384 every tick.

And the habits behind them:

- **Keep slow work off the game thread.** Saves and lock renewals run on workers, item ids come
  in blocks of 1,000, and Arcana's leaderboard rebuilds once per tick instead of on every death
  (each death used to cost up to about 240 database round trips).
- **Pick keys that don't allocate.** Packed `long` keys instead of tuples, and `TryGetValue`
  instead of a lookup followed by a second lookup.
- **Tune the runtime.** Server garbage collection with background collection, and tiered PGO.

## Metrics and logging

- **Prometheus metrics in both servers** with prometheus-net: tick time, tick rate, players,
  packets, connections and the in-game economy, with Grafana dashboards and alerts.
- **A leak monitor** for Cosmic Realm. The server ran fine for about 20 hours, then slowly lost
  headroom, so it now samples memory, garbage collection and entity counts every 5 seconds.
- **A tick profiler** for Arcana that times each stage of a tick and records garbage collections
  to rotating log files.
- **Logs split by category** (errors, crashes, chat, deaths, duplicate items) so problems are
  easy to find.

## Object-oriented design

- **`DungeonWorld`**, a base class I wrote in 2023 for every dungeon in Arcana. It handles how a
  dungeon is completed (all bosses or all enemies) and how players are rewarded, so a new dungeon
  only writes what's different. The open world builds on it too.
- **Pets and placeable objects** as their own entity types.
- **Locked objects** in Cosmic Realm: one interface and base class for anything that opens by
  rank, like the market.

## Other C# I've built

- **RealmHub**: a launcher backend made of small ASP.NET Core 8 services (accounts, servers,
  friends, notifications), with xUnit tests, deployed by Argo CD.
- **Home Workplace**: a Blazor interface in a .NET MAUI desktop app, a MonoGame office game with
  A* pathfinding, and ASP.NET Core services, with about 500 xUnit and bUnit tests.
- **Fallen Worlds**: a MonoGame game client (2024).
- **Tools**: a sprite sheet tool (console and WinForms) and load testers for my own servers.
- **2018 to 2021**: private server projects on .NET Framework, which is where I learned C#.

## Beyond C#

- [Tidan Games platform](/projects/tidan-platform): the Kubernetes cluster my games and company
  tools run on.
- **This website**: Astro, with a small Node service for comments and videos.
- **Better Accounts**: one sign-in (Google and Apple) for all my Better apps, in TypeScript.
