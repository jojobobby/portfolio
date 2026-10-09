---
title: 'Learning: From Podman Compose to systemd services to Kubernetes clusters'
date: 2026-10-06
kind: engineering
summary: How Seneca Foundation's infrastructure got rebuilt five times.
project: vail-sre
---

Seneca Foundation runs an apprenticeship where new engineers build and ship real
applications. Over two years I deployed those applications five different ways. Not because
the earlier ways were wrong, but because each time the scope grew, the old architecture stopped
fitting. This is the path, with dates from the git history.

## 1. Containers on a server: `docker compose` and `podman compose` (2024)

The first deployments were containers on a single server. In August 2024 I added Dockerfiles
and compose files to the Business Locator app so its API and front end could run together.
Compose is the right first step: one file describes the whole app, and `docker compose up`
or `podman compose up` brings it up.

**What broke the model:** nothing restarted the stack when the server rebooted or a process
died. It ran fine until it didn't.

## 2. systemd services for uptime

So I put the services under **systemd**. Units start at boot, restart on failure, and log to
the journal. Reliability on a single host went up immediately.

**What changed next:** the scope. More projects needed deploying the same way, and the
deployment configuration needed to live with the code, not on a server.

## 3. A full AWS ECS deployment, driven by CI/CD (Aug 2024 to 2025)

Next came a proper cloud deployment. In August 2024 I set up GitHub Actions to **build and push
images to ECR for all four of the Business Locator's applications** and deploy them as ECS
task definitions. Dev Landing followed (merged December 2024). Through 2025, the pipelines grew
into **test-before-deploy** workflows with the deployment configuration kept **in the repo**, and
a shared deploy template so every project shipped the same way.

**What changed next:** the scope again, and the next architecture was Kubernetes.

## 4. Ripping it all down and learning Kubernetes

So I tore it all down: every ECS service and every pipeline that fed it. Then I learned
Kubernetes properly. I worked through **Kubernetes the Hard Way** to understand what a cluster
is made of, then **self-hosted a Kubernetes machine** of my own. Along the way I learned the
parts a managed cloud hides from you:

- **Certificates and TLS**, issued and renewed automatically.
- **Proxmox** virtualization, to run and rebuild nodes freely.
- **Networking and routing**, including my own home **DNS server and router**.

That personal cluster became the blueprint for my studio's infrastructure, the
[Tidan Games platform](/projects/tidan-platform).

## 5. Seneca Foundation's official cluster (Sep 2025 to 2026)

Then I applied all of it to **Seneca Foundation's official Kubernetes cluster**, under the
supervision of **Harrison**, my boss and training mentor during my apprenticeship. The git
history shows the build-out:

| When | What landed |
|---|---|
| Sep 2025 | Argo CD app-of-apps: every project registered as an application |
| Oct 2025 | The first Seneca apps deployed through it |
| Jan 2026 | Helm configuration; load balancer and certificates as cluster infrastructure |
| Feb 2026 | A self-hosted container registry and Sealed Secrets |
| Feb to Mar 2026 | Ingress: NGINX (F5, then community), then cert-manager with a cluster issuer |
| Mar 2026 | PostgreSQL as a chart, with a network policy and a disruption budget |
| Aug 2026 | Terraform + Ansible provisioning, and a [cost analysis of where to host it](/writing/aws-vs-ovh-k3s-cost-analysis) |

The ingress rows tell the most honest story: I changed controllers, tried TLS passthrough,
and moved certificate handling twice before settling on a design. That's what learning in
production looks like when every step is in git and can be reviewed.

Alongside all of this, I've been studying for the **Certified Kubernetes Administrator
(CKA)** exam.

## 6. Where it is now

Today I run two well-defined clusters, both managed entirely with GitOps:

- **Seneca Foundation's cluster**, hosting all of its deployed projects.
- **The Tidan Games cluster**, for my studio: Helm charts deployed by **Argo CD**; metrics and
  logs in **Prometheus, Grafana and Loki**; self-managed **PostgreSQL and Redis**; secrets in
  **OpenBao** (the open-source Vault fork); and **Harbor** as the internal registry.

## What tearing it down taught me

- **Rebuild when the scope changes, not when it breaks.** Each stage was right for its moment.
  Keeping an architecture past its moment is how you end up with the fragile parts.
- **Version control is the real platform.** The jump that mattered most wasn't ECS or
  Kubernetes. It was the configuration moving into git, so every change is reviewable and
  repeatable.
- **Managed services hide the fundamentals.** Self-hosting forced me to understand
  certificates, DNS, routing and storage. That's exactly what I need when something breaks at 2 a.m.
- **Have a mentor review your work.** Building Seneca's cluster under Harrison's supervision
  meant every decision got questioned, and the design is better for it.
