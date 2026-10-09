---
title: Cosmic Realm
org: Independent
role: Founder, Lead Developer
dates: 2018 to 2026
section: studio
order: 3
summary: My first game. Started in 2018 as Tidan's Realm, renamed Cosmic Realm in 2020.
tech: [C# / .NET 10, ASP.NET Core, WPF / XAML, ActionScript 3, Adobe AIR, Redis, k3s, Argo CD]
cover: /media/covers/cosmic-realm.svg
video: bGHpJcUXNCQ
coverAlt: "Illustration: a ringed planet in a starfield"
stats:
  - { value: '3,000', label: 'registered accounts' }
  - { value: '200', label: 'peak players online' }
  - { value: '8 yrs', label: 'live' }
---

A live multiplayer action game I built and ran for eight years.

- C# game server: networking, combat, raids, loot, progression and a player market. Started on
  .NET Framework 4.6, now on .NET 10.
- Moved the client from browser Flash to Adobe AIR when Flash died, so players kept playing.
- Ran it on Kubernetes with Argo CD, monitoring and automatic backups.
- Hired and paid developers, artists and balance testers.

## C# and .NET

- **Account server** on ASP.NET Core, with caching so returning players skip a 4.5 MB download.
- **Shop website** and **balancer** in Razor Pages, with Stripe checkout.
- **Launcher** in WPF and XAML, rebuilt as a state machine with 226 tests.
- **Prometheus metrics** for tick time, players and the economy, plus a memory leak monitor.
- Case study: [only check the parts of the map where players are](/writing/only-check-where-players-are).

More on [my C# and .NET work](/projects/csharp-dotnet).

Not the same game as Cosmic v2, which [Arcana](/projects/arcana) came from.
