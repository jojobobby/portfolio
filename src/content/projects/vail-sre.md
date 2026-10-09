---
title: Helm and Argo CD deployments
org: Vail Systems
role: SRE Apprentice
dates: Aug 2024 to Present
section: professional
order: 2
summary: Helping Vail deploy and maintain its services with Helm and Argo CD.
tech: [Kubernetes, Helm, Argo CD, GitHub Actions, Harbor, cert-manager, Grafana, Loki, Prometheus, Terraform, Ansible]
highlights:
  - Deploy and maintain services with Helm and Argo CD on Vail's existing setup
  - GitHub Actions pipelines for Node.js and .NET services
  - Harbor, cert-manager, ingress, secrets and RBAC for containerized workloads
  - Mentor interns on containers, Helm and Kubernetes
---

I help Vail deploy and maintain its services. Vail's Kubernetes and Argo CD setup was already
running when I joined. My part is the deployments on top of it, and keeping them healthy
afterwards.

## Deploying

- Helm charts and Argo CD releases for Vail's services.
- Turned each app's ports, environment variables, secrets, dependencies and health checks into
  Kubernetes deployment configuration, then checked that it started and released cleanly.
- Wrote deployment, update and account-provisioning scripts for the jobs that kept repeating, and
  to help new applications get onboarded.

## Pipelines

- GitHub Actions for Node.js, Next.js and .NET services: versioned container images, database
  migrations and health checks during every release.
- Containerized C++ services with Conan and build tooling, so native builds ship the same way as
  everything else.

## Platform and operations

- Harbor, cert-manager, ingress, secrets, RBAC and service-account image-pull access for
  containerized workloads.
- Terraform for infrastructure and Ansible for host configuration.
- Grafana, Loki and Prometheus to look at application behavior, container health, logs and
  failed deployments.
- Tracked down CI/CD, rollout, networking and registry failures across the application and
  infrastructure layers, and helped coworkers with their deployment problems.

## Mentoring

I teach interns networking, load balancing, SSH, Docker and Podman, container orchestration, Helm,
Kubernetes deployments, environment security, and CPU and memory limits.

The clusters I designed and run myself are on the
[Kubernetes platform engineering](/projects/kubernetes-platform) page.
