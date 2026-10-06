---
title: Tidan Games Platform
org: Tidan Games LLC
role: Founder · Site Reliability Engineer
dates: Ongoing
section: studio
order: 2
summary: The self-hosted production platform behind my games and studio. Kubernetes managed entirely through GitOps, with data services, observability, email, backups and CI built in.
tech: [k3s, Argo CD, Helm, HAProxy, cert-manager, CloudNativePG, Redis, OpenBao, Prometheus, Grafana, Loki, GitHub Actions, BuildKit]
stats:
  - { value: '35', label: 'Argo CD applications' }
  - { value: '130+', label: 'running pods on one node' }
  - { value: '37', label: 'TLS certificates, auto-renewed' }
  - { value: 'Git', label: 'source of truth for every service' }
---

Everything Tidan Games runs lives on one self-managed Kubernetes node: the game servers, their
databases, the store, the studio's internal tools, email, monitoring and CI. Every service is a
Helm chart in its own Git repository, and **Argo CD** keeps the cluster matched to Git. A change
is a commit; nothing changed by hand survives, because Argo CD reverts drift.

<figure>
<svg viewBox="0 0 760 430" role="img" aria-labelledby="arch-title" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:var(--font);">
  <title id="arch-title">Architecture: GitHub repositories feed Argo CD, which deploys every workload on the k3s node behind HAProxy ingress</title>
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent)"/></marker>
  </defs>
  <g style="font-size:13px;">
    <rect x="20" y="20" width="160" height="70" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="100" y="48" text-anchor="middle" style="fill:var(--text);font-weight:700">GitHub</text>
    <text x="100" y="68" text-anchor="middle" style="fill:var(--text-dim);font-size:11.5px">one repo per service</text>
    <rect x="20" y="130" width="160" height="70" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="100" y="158" text-anchor="middle" style="fill:var(--text);font-weight:700">CI runners</text>
    <text x="100" y="178" text-anchor="middle" style="fill:var(--text-dim);font-size:11.5px">build + push images</text>
    <rect x="20" y="300" width="160" height="70" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="100" y="328" text-anchor="middle" style="fill:var(--text);font-weight:700">Players &amp; visitors</text>
    <text x="100" y="348" text-anchor="middle" style="fill:var(--text-dim);font-size:11.5px">HTTPS, game TCP, mail</text>
    <path d="M100 90 V128" style="stroke:var(--accent);stroke-width:2;fill:none" marker-end="url(#arr)"/>
    <path d="M180 55 H258" style="stroke:var(--accent);stroke-width:2;fill:none" marker-end="url(#arr)"/>
    <text x="219" y="47" text-anchor="middle" style="fill:var(--text-dim);font-size:11px">watches</text>
    <path d="M180 335 H258" style="stroke:var(--accent);stroke-width:2;fill:none" marker-end="url(#arr)"/>
    <rect x="260" y="14" width="480" height="402" rx="12" style="fill:none;stroke:var(--accent);stroke-dasharray:6 5"/>
    <text x="276" y="36" style="fill:var(--accent);font-weight:700">k3s node: 8 cores, 64 GB</text>
    <rect x="276" y="48" width="448" height="56" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="292" y="72" style="fill:var(--text);font-weight:700">Argo CD</text>
    <text x="292" y="92" style="fill:var(--text-dim);font-size:11.5px">app-of-apps · auto-sync · self-heal · prune</text>
    <rect x="276" y="300" width="448" height="56" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="292" y="324" style="fill:var(--text);font-weight:700">Edge: HAProxy ingress + cert-manager</text>
    <text x="292" y="344" style="fill:var(--text-dim);font-size:11.5px">Let's Encrypt certificates, issued and renewed automatically</text>
    <rect x="276" y="118" width="140" height="168" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="290" y="140" style="fill:var(--warm);font-weight:700">Workloads</text>
    <text x="290" y="162" style="fill:var(--text);font-size:12px">Arcana prod + dev</text>
    <text x="290" y="180" style="fill:var(--text);font-size:12px">game stores</text>
    <text x="290" y="198" style="fill:var(--text);font-size:12px">wiki · tasks</text>
    <text x="290" y="216" style="fill:var(--text);font-size:12px">support desk</text>
    <text x="290" y="234" style="fill:var(--text);font-size:12px">this website</text>
    <rect x="430" y="118" width="140" height="168" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="444" y="140" style="fill:var(--warm);font-weight:700">Data</text>
    <text x="444" y="162" style="fill:var(--text);font-size:12px">PostgreSQL (CNPG)</text>
    <text x="444" y="180" style="fill:var(--text);font-size:12px">Redis</text>
    <text x="444" y="198" style="fill:var(--text);font-size:12px">OpenBao secrets</text>
    <text x="444" y="216" style="fill:var(--text);font-size:12px">Harbor registry</text>
    <rect x="584" y="118" width="140" height="168" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="598" y="140" style="fill:var(--warm);font-weight:700">Operations</text>
    <text x="598" y="162" style="fill:var(--text);font-size:12px">Prometheus</text>
    <text x="598" y="180" style="fill:var(--text);font-size:12px">Grafana · Loki</text>
    <text x="598" y="198" style="fill:var(--text);font-size:12px">mail relay + inbox</text>
    <text x="598" y="216" style="fill:var(--text);font-size:12px">monthly backups</text>
    <text x="598" y="234" style="fill:var(--text);font-size:12px">CI runners</text>
    <text x="500" y="392" text-anchor="middle" style="fill:var(--text-dim);font-size:11.5px">Secrets never live in Git: they are created out of band or read from OpenBao.</text>
  </g>
</svg>
<figcaption>How a change reaches production: commit to GitHub, Argo CD notices, the cluster converges.</figcaption>
</figure>

## Design decisions

**GitOps for everything, including the platform itself.** The app-of-apps pattern means
registering a new service is a single file in one repository. Rollback is `git revert`, and the
cluster's state can always be reviewed as a diff. Operators (Argo CD, CloudNativePG,
cert-manager) are deployed the same way as the applications.

**One node, deliberately.** A single 8-core node is cheap and easy to reason about, and its
limits are explicit: CPU *requests* are nearly fully committed while real CPU use sits around
20%. So new workloads request little and burst into idle capacity. Everything needed to
rebuild the cluster lives in Git.

**Shared data services instead of one database per app.** The studio's wiki, issue tracker and
support desk each get their own login and database on one CloudNativePG cluster, and their own
logical database on the shared Redis. That saves about a dozen pods, and it means the monthly
backup covers every app's data automatically.

**Secrets out of Git.** Charts reference Secrets by name. Values are created out of band or
written into **OpenBao**. Automation gets an AppRole that can write secrets but can't read the
system configuration.

## What runs on it

| Area | Pieces |
|---|---|
| Delivery | Argo CD, GitHub Actions, self-hosted CI runners (one pool per repo, scaling from zero), rootless BuildKit image builds, Harbor |
| Edge | HAProxy ingress, cert-manager with Let's Encrypt HTTP-01, MetalLB |
| Data | PostgreSQL via CloudNativePG, Redis with AOF + RDB and a hard memory cap, OpenBao with Raft storage and automatic unseal |
| Observability | Prometheus, Grafana, Loki, Alloy |
| Email | A self-hosted send relay with DKIM signing and a full mailbox server (Rspamd spam filtering to Junk, IMAPS only, Fail2ban), plus webmail |
| Backups | Monthly jobs dump PostgreSQL, Redis, OpenBao and the game's file data, zip them and deliver them to the studio mailbox |
| Studio tools | Wiki (Docmost), issue tracker (Plane), player-support desk (Zammad) |

## Hardening choices

- No privileged containers for CI. Container images are built on a **rootless** BuildKit daemon
  instead of Docker-in-Docker, and a NetworkPolicy lets only runner pods reach it.
- When an upstream chart ships a privileged init container that only fixes file permissions, I
  replace it with an unprivileged one that drops every capability.
  ([The incident that taught me why it was there.](/writing/sticky-bit-postmortem))
- The mail server isn't an open relay, accepts submission only after authentication, and allows
  each user to send only as their own address.

## What I'd do next

- **Off-node backups.** The monthly backups are delivered to a mailbox on this same node. The next
  step is to copy them somewhere the node can't take down with it.
- **A second node,** so a reboot no longer takes every service down at once.

## Lessons I've written up

The platform's incidents are where most of my writing comes from. See [Writing](/writing).
