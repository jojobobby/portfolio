---
title: Kubernetes platform engineering
org: Seneca Foundation and Tidan Games
role: Platform Engineer
dates: 2024 to Present
section: professional
order: 1
summary: Five ways of deploying, rebuilt as the scope grew, ending in two production clusters I run.
tech: [Kubernetes, k3s, Helm, Argo CD, Prometheus, Grafana, Loki, PostgreSQL, Redis, Terraform, Ansible, Harbor, Proxmox]
highlights:
  - Rebuilt the deployment architecture five times, each time the scope changed
  - Built Seneca Foundation's official cluster under my mentor Harrison
  - Run a second cluster for Tidan Games, deployed with Helm and Argo CD
  - Wrote a 1 year and 10 year hosting cost analysis
stats:
  - { value: '5', label: 'architectures built and replaced' }
  - { value: '2', label: 'production clusters run with GitOps' }
  - { value: '$12.6k', label: 'projected 10 year saving on one node' }
---

I learned infrastructure by building it, tearing it down and building it again. Each version was
right for its moment and wrong when the scope grew.

## The five architectures

1. **Compose.** `docker compose up` and `podman compose up` on one server.
2. **systemd services.** Units that start at boot and restart on failure, for uptime.
3. **AWS ECS with CI/CD.** The configuration lives in the repo, and the pipeline tests before it
   deploys.
4. **Kubernetes, from scratch.** I tore down every ECS service and its pipeline, then worked
   through Kubernetes the Hard Way and self-hosted a cluster. Along the way I learned
   certificates, Proxmox, networking and routing, and set up my own DNS server and router at
   home. That cluster became the blueprint for Tidan Games' architecture.
5. **Seneca Foundation's official cluster.** Everything above, applied to Seneca's cluster, under
   the supervision of Harrison, my boss and training mentor during my apprenticeship.

The full story, with dates from git, is in
[From Podman Compose to systemd services to Kubernetes clusters](/writing/seneca-infrastructure-journey).

## What runs on them

- **Delivery:** Helm charts, deployed by Argo CD from Git.
- **Metrics and logs:** Prometheus, Grafana and Loki.
- **Data:** self-managed PostgreSQL and Redis.
- **Secrets and images:** OpenBao (the open source Vault fork) and Harbor for Tidan Games;
  Sealed Secrets and a self-hosted registry for Seneca.
- **Edge:** ingress with cert-manager certificates.
- **Provisioning:** Terraform and Ansible.

Tidan Games' cluster is on its own page: [Tidan Games Platform](/projects/tidan-platform).

## Where to host it

When Seneca's cluster needed a long term home, I wrote a cost analysis of AWS and OVH over one
year and ten. At the medium tier, OVH is about $780 a year and AWS about $2,041, which is
$12,609.60 apart over ten years on one node. See [AWS vs OVH costs](/writing/aws-vs-ovh-k3s-cost-analysis).

## Still learning

I'm studying for the Certified Kubernetes Administrator (CKA) exam, and I run the cluster
Seneca's interns deploy to.
