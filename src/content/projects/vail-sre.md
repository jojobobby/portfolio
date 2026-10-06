---
title: AWS ECS to Kubernetes Migration
org: Vail Systems
role: Site Reliability Engineer Apprentice
dates: Aug 2024 – Present
section: professional
order: 1
summary: Led the move of production workloads from AWS ECS to a self-managed k3s platform, with GitOps delivery, observability and hardened access.
tech: [Kubernetes (k3s), Helm, Argo CD, GitHub Actions, Terraform, Ansible, Harbor, Vault, cert-manager, Prometheus, Grafana, Loki, AWS]
cover: /media/covers/vail-sre.svg
coverAlt: "Illustration: containers moving from AWS ECS to a k3s cluster managed by Argo CD"
stats:
  - { value: 'ECS → k3s', label: 'production platform migration' }
  - { value: '3 envs', label: 'development, staging, production' }
  - { value: 'GitOps', label: 'every release driven by Argo CD' }
---

As a site reliability engineer apprentice at Vail Systems, I led the migration of production
workloads from AWS ECS/ECR to a self-managed **k3s** Kubernetes platform, and I operate the
toolchain around it. The move reduced infrastructure cost while keeping releases repeatable,
observable and auditable.

> Vail's internal systems are confidential, so this page describes my role and the kind of work
> rather than the architecture itself. The [Tidan Games platform](/projects/tidan-platform) shows the
> same practices on infrastructure I can show in full.

## What I owned

**The migration.** I translated each service's ports, environment variables, secrets,
dependencies and health checks into Helm configuration, and moved it onto Argo CD GitOps
deployments across development, staging and production, validating startup and release
behavior along the way.

**Delivery.** I rearchitected CI/CD around GitOps. GitHub Actions builds versioned container
images for Node.js/Next.js and .NET services and publishes them to Harbor and ECR, and Argo CD
releases them, coordinating database migrations and health checks. I also built deployment
workflows for dedicated Linux servers (Podman Compose and systemd) and for AWS ECS (ECR, IAM,
security groups, ACM, Route 53).

**The platform toolchain.** I deployed and operate Terraform, Ansible, Vault and cert-manager,
plus a Prometheus, Grafana and Loki stack used to validate rollouts and investigate
production failures.

**Access and security.** I hardened multi-user cluster access with RBAC, namespaced service
accounts, Kubernetes network policies, certificate-based SSH, 2FA and host firewall rules, and
managed image-pull access for workloads.

**Legacy services.** I containerized C++ services built with Make, Conan and GCC, and shipped
them to Kubernetes through reusable Helm chart templates.

**Operations.** I investigate CI/CD, rollout, networking and registry failures across the
application and infrastructure layers, and I wrote deployment, update and account-provisioning
scripts to automate recurring operational work.

## Mentoring

I built and administer a k3s training cluster where Seneca Foundation interns deploy real
applications with Helm and GitOps. I mentor them on networking, load balancing, SSH,
Docker/Podman, container orchestration, Kubernetes deployments, environment security and
CPU/memory sizing.
