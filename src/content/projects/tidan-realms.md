---
title: Tidan Realms
org: Independent (pre-studio)
role: Lead Software Engineer & Owner
dates: Nov 2020 – Sep 2026
section: studio
order: 4
summary: An MMORPG server with multithreaded game instances, hybrid UDP/TCP networking, a player-driven market and an auto-updating launcher.
tech: [C# / .NET, UDP/TCP, WebSockets, Redis, XML content pipeline, WPF/XAML, GitHub Actions]
stats:
  - { value: '600', label: 'registered accounts' }
---

Tidan Realms was my second live title. I designed and deployed its C#/.NET MMORPG server and
the tooling around it.

## What I built

- **Server core:** multithreaded game instances with real-time entity updates.
- **Networking:** hybrid UDP/TCP with encrypted binary packets, WebSocket support, and packet
  processing and queueing.
- **Economy:** a player-driven market, with Redis caching for hot data.
- **Content pipeline:** game content defined as XML and served through an API.
- **Delivery:** automated deployments with GitHub Actions, and an auto-updating launcher (see
  [Windows game launcher](/projects/windows-launcher)).
