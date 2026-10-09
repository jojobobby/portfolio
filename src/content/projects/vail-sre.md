---
title: AWS ECS to Kubernetes
org: Vail Systems
role: SRE Apprentice
dates: Aug 2024 to Present
section: professional
order: 1
summary: Led the move of production from AWS ECS to self-managed Kubernetes.
tech: [k3s, Helm, Argo CD, GitHub Actions, Terraform, Ansible, Vault, Prometheus, Grafana]
highlights:
  - Dev, staging and prod on k3s with Helm and Argo CD
  - Prometheus, Grafana and Loki to check every rollout
  - Locked down with RBAC, network policies and certificate SSH
---

- Migrated services from AWS ECS to k3s with Helm and Argo CD (dev, staging, prod).
- Rebuilt CI/CD around GitOps: GitHub Actions builds, Argo CD releases.
- Run Terraform, Ansible, Vault, cert-manager and Prometheus/Grafana/Loki.
- Locked down access: RBAC, network policies, certificate SSH, 2FA.
- Containerized legacy C++ services.
- Mentor Seneca Foundation interns on a training cluster I built.

More in [how Seneca's infrastructure evolved](/writing/seneca-infrastructure-journey).
