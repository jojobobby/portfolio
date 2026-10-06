---
title: Cosmic Realm
org: Independent (pre-studio)
role: Lead Software Engineer & Owner
dates: Nov 2025 – Sep 2026
section: studio
order: 3
summary: A live multiplayer game that reached 3,000 registered accounts and 200 peak concurrent players. I built its C# server and ran its production, from Kubernetes to backups.
tech: [C#, .NET, Redis, Docker, GitHub Actions, k3s, Kustomize, Argo CD, Prometheus, Grafana, Loki, Stripe]
stats:
  - { value: '3,000', label: 'registered accounts' }
  - { value: '200', label: 'peak concurrent players' }
  - { value: '~30', label: 'average players online daily' }
  - { value: '3× daily', label: 'automated database backups' }
---

Cosmic Realm was a live multiplayer action game with a daily player community. I built and ran
the C# game server, operated its production environment, and led the people who worked on it.

## Game systems

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

## Leading the team

I hired and paid developers, artists and game-balance contributors to spread the work, and
turned player feedback into a prioritized roadmap. When browsers dropped Flash, I moved the
client from ActionScript in the browser to Adobe AIR so desktop players could keep playing.
