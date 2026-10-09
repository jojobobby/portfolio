---
title: Cosmic Realm
org: Independent
role: Founder, Lead Developer
dates: 2018 to 2026
section: studio
order: 3
summary: My first game. Started in 2018 as Tidan's Realm, renamed Cosmic Realm in 2020.
tech: [C# / .NET 10, ASP.NET Core, WPF / XAML, ActionScript 3, Adobe AIR, Redis, k3s, Argo CD]
video: bGHpJcUXNCQ
stats:
  - { value: '3,000', label: 'registered accounts' }
  - { value: '200', label: 'peak players online' }
  - { value: '8 yrs', label: 'live' }
---

A live multiplayer action game I built and ran for eight years. It reached 3,000 registered
accounts and 200 players online at once, with about 30 on an average day.

## Server

- C# game server on .NET Framework 4.6 then, now .NET 10, with multithreaded game instances and
  real-time entity updates.
- Hybrid UDP and TCP networking with encrypted binary packets, WebSocket support, and packet
  queueing.
- Combat, raids, loot, progression, a persistent economy and a player-driven market.
- Redis caching, and an XML and API driven pipeline for game content.
- Modernized old C# 8 code with C# 11: LINQ, spans, hash-based collections, required members and
  ref semantics.
- Moved the client from browser Flash to Adobe AIR when Flash died, so players kept playing.

## Running it

- Docker and GitHub Actions build the servers, launchers and clients. Development and production
  are separate branches watched by Argo CD.
- k3s with Kustomize and an Argo CD app-of-apps.
- Redis on persistent volumes, backed up three times a day by a Kubernetes CronJob, which
  disconnected Redis clients first.
- User-activity metrics, with separate development and production dashboards in Grafana,
  Prometheus and Loki.

## The team

I hired and paid developers, artists and balance testers to share the work, and turned player
feedback into the roadmap.

## C# and .NET

- **Account server** on ASP.NET Core, with caching so returning players skip a 4.5 MB download.
- **Shop website** and **balancer** in Razor Pages, with Stripe checkout.
- **Launcher** in WPF and XAML, rebuilt as a state machine with 226 tests.
- **Prometheus metrics** for tick time, players and the economy, plus a memory leak monitor.
- Case study: [only check the parts of the map where players are](/writing/only-check-where-players-are).

More on [my C# and .NET work](/projects/csharp-dotnet).

Not the same game as Cosmic v2, which [Arcana](/projects/arcana) came from.
