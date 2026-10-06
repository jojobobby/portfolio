---
title: Cosmic Realm
org: Independent (pre-studio)
role: Founder · Lead Software Engineer
dates: 2018 – 2026
section: studio
order: 3
summary: My first game, started in 2018 as Tidan's Realm and renamed Cosmic Realm in 2020. A live multiplayer game I built and ran for eight years, from the C# server to Kubernetes.
tech: [C#, .NET, ActionScript 3, Adobe AIR, Redis, UDP/TCP, WPF, Docker, GitHub Actions, k3s, Argo CD, Prometheus, Grafana, Loki, Stripe]
stats:
  - { value: '3,000', label: 'registered accounts' }
  - { value: '200', label: 'peak concurrent players' }
  - { value: '~30', label: 'average players online daily' }
  - { value: '3× daily', label: 'automated database backups' }
---

Cosmic Realm is the game I started with. It began in August 2018 as a Realm of the Mad God
private server called **Tidan's Realm**, built on community server and client sources, with my
own items, sprites and quests. In July 2020 it became **Cosmic Realm**, and I kept building and
running it through 2026: the C# game server, the client, the launcher, its production
environment, and the people who worked on it.

> Not to be confused with *Cosmic v2*, a different game, which [Arcana](/projects/arcana) grew
> out of.

## Game systems

- **Server core:** a C#/.NET MMORPG server with multithreaded game instances and real-time
  entity updates; hybrid UDP/TCP networking with encrypted binary packets, WebSocket support,
  and packet processing and queueing.
- **Economy:** a player-driven market with Redis caching, and an XML/API-driven content pipeline.
- Real-time player synchronization, combat, raids, loot and player progression.
- A persistent in-game economy, with purchases tied to player accounts through Stripe.
- I modernized older C# 8 code to C# 11 conventions (LINQ, spans, hash-based collections,
  required members, ref semantics) to keep the server maintainable as it grew.

## Running it in production

- **Delivery:** Docker builds for the game server, launcher and client in GitHub Actions.
  Development and production lived on separate branches, each watched by Argo CD.
- **Platform:** k3s, with GitHub-managed Kustomize configuration and an Argo CD app-of-apps.
- **Data safety:** Redis on persistent volumes, backed up three times a day by a Kubernetes
  CronJob that disconnects clients before each backup so the snapshot is consistent.
- **Observability:** separate development and production monitoring with Prometheus, Grafana
  dashboards, Loki logs and player-activity metrics.

## The launcher

An auto-updating Windows launcher (C#, WPF): see [Windows game launcher](/projects/windows-launcher).

## Leading the team

I hired and paid developers, artists and game-balance contributors to spread the work, and
turned player feedback into a prioritized roadmap. When browsers dropped Flash, I moved the
client from ActionScript in the browser to Adobe AIR so desktop players could keep playing.
