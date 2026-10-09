---
title: Arcana
org: Tidan Games LLC
role: Founder, Lead Engineer & Designer
dates: 2023 to Present
section: studio
order: 1
summary: A pixel-art MMORPG. I design it, build it and run it.
tech: [C# / .NET 10, ASP.NET Core, WPF / XAML, Haxe / OpenFL, PostgreSQL, Redis, Kubernetes, Argo CD]
cover: /media/arcana/main-menu.jpg
coverAlt: Arcana's main menu
video: hUZl8HxzW1o
stats:
  - { value: '818', label: 'player accounts' }
  - { value: '2,000+', label: 'of my commits' }
  - { value: '2,400+', label: 'automated tests' }
  - { value: '200 to 500', label: 'playtesters' }
---

Dungeons, an open overworld, guilds, trading, crafting and PvP. I write the server and the
client, design the content, and run it in production.

## Design

- **Deserted Tomb:** light eight trial rooms to wake the boss. Light them all within a minute
  and it wakes in hard mode.
- **PvP island:** you can attack anyone outside your guild. New arrivals get 15 seconds of
  protection, and a fight tag stops you escaping mid-fight.
- **Allies:** summons, turrets and pets share one system, and you choose whose you see.
- **Enemy levels:** each enemy gets a level and a rank, and one formula sets its stats.

## From the game

<div class="sprites">
  <figure><img src="/media/arcana/mysterious-merchant-greet.gif" alt="Mysterious Merchant waving" /><figcaption>Mysterious Merchant</figcaption></figure>
  <figure><img src="/media/arcana/expedition-herald-greet.gif" alt="Expedition Herald greeting" /><figcaption>Expedition Herald</figcaption></figure>
  <figure><img src="/media/arcana/item-buyer-greet.gif" alt="Item Buyer greeting" /><figcaption>Item Buyer</figcaption></figure>
  <figure><img src="/media/arcana/sandsurge-behemoth-rise.gif" alt="Sandsurge Behemoth rising" /><figcaption>Sandsurge Behemoth</figcaption></figure>
  <figure><img src="/media/arcana/reef-lantern-angler-surface.gif" alt="Reef Lantern Angler surfacing" /><figcaption>Reef Lantern Angler</figcaption></figure>
  <figure><img src="/media/arcana/wandering-igloo-open.gif" alt="Wandering Igloo opening" /><figcaption>Wandering Igloo</figcaption></figure>
  <figure><img src="/media/arcana/radiant-reef-portal.gif" alt="Radiant Reef portal" /><figcaption>Radiant Reef portal</figcaption></figure>
</div>

## C# and .NET

- **Game server** on .NET 10, running at 10 ticks a second.
- **Account and game APIs** in the same process, plus a website and balance tool in ASP.NET Core
  Razor Pages.
- **Launcher** in WPF and XAML, with checked downloads and self-updates.
- **Metrics and logs**: Prometheus and Grafana, a tick profiler, and logs split by category.
- Case study: [a list of 52,000 enemies froze the server](/writing/list-that-froze-the-server).

More on [my C# and .NET work](/projects/csharp-dotnet).

## More videos

- [Item Enchants](https://www.youtube.com/watch?v=l-ouEhlwqAs), Aug 2023
- [Quest Showcase](https://www.youtube.com/watch?v=cRzuc4sMsc4), Jun 2025
- [Summoner Showcase](https://www.youtube.com/watch?v=FiEjzFGnL5Y), Jun 2025
- [Item Leveling Showcase](https://www.youtube.com/watch?v=o_K_tfyDBZI), Jun 2025
- [Crafting Station Showcase](https://www.youtube.com/watch?v=MMVDr1D3cBE), Jun 2025

## History

Started as Cosmic v2, a game I designed with 09 and Delik. I was doing most of the work, so I
split off with my own fork, Tidan's Realm. That became Tidan's Realm VI, renamed Arcana when I
founded Tidan Games in 2026.
