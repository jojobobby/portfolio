---
title: AWS vs OVH costs
date: 2026-08-30
kind: engineering
summary: What a k3s cluster costs on AWS and OVH, over 1 year and 10.
project: vail-sre
---

When Seneca Foundation's Kubernetes cluster needed a long-term home, I wrote a technical and
financial analysis comparing **AWS** and **OVHcloud** for running it. This is that analysis.
The 12-month numbers are from my report (Aug 30, 2026). The 10-year table extends them in a
straight line at today's prices.

## The requirement

One production k3s node with **1 TB of block storage**, a **persistent IP**, and mid-range
compute: enough for multiple production-facing apps, each with its own environments.
Provisioning is automated either way:

- **Terraform** builds the infrastructure. On AWS that's a VPC, subnets, security groups, an
  EC2 instance and an EBS volume. On OVH it's a dedicated server or VPS through the OVH provider,
  plus attached block storage and a reserved failover IP.
- **Ansible** configures the host: root login disabled, certificate-based SSH and 2FA, custom
  `ip rule`s for traffic through the persistent IP, k3s with its storage provisioner on the
  1 TB volume, and `nftables`/`ufw` locking down the Kubernetes API and NodePort ranges.

## Compute at three tiers

| Tier | AWS | Monthly | OVH | Monthly |
|---|---|---|---|---|
| Small | t3.micro (2 vCPU, 1 GB) | $7.59 | VPS Starter (1 vCPU, 2 GB) | $4.20 |
| Medium | m5.large (2 vCPU, 8 GB) | $70.08 | Rise-1 (6 cores, 32 GB) | $65.00 |
| High-performance | c6g.2xlarge (8 vCPU, 16 GB) | $245.28 | Advance-3 (12 cores, 64 GB) | $145.00 |

On compute alone the gap is modest at the medium tier. The real difference is everything
around compute.

## Storage and networking decide it

| | AWS (usage-based) | OVH (flat-rate) |
|---|---|---|
| 1 TB block storage | ~$80/mo (gp3 at $0.08/GB) | included, or ~$10 to $20/mo on the smallest tier |
| Egress | ~$0.09/GB after the first 100 GB | included, unmetered |
| Budget | risk of "bill shock" as traffic grows | fixed monthly cost |

On AWS, **1 TB of storage costs more than an entire OVH server at the medium tier**, and egress
grows with traffic. For a cluster serving public apps, that's a cost you can't cap. I
estimated $20/month of AWS networking to keep the comparison fair.

## 1-year total cost

| Tier | AWS / year | OVH / year | Savings with OVH |
|---|---|---|---|
| Small | $1,291.08 | $170.40 | **$1,120.68** (87% less) |
| Medium | $2,040.96 | $780.00 | **$1,260.96** (62% less) |
| High-performance | $4,143.36 | $1,740.00 | **$2,403.36** (58% less) |

## 10 years at today's prices

The same totals over a decade. This assumes prices never change, so read it as the shape of
the gap, not a quote.

| Tier | AWS / 10 years | OVH / 10 years | Savings with OVH |
|---|---|---|---|
| Small | $12,910.80 | $1,704.00 | **$11,206.80** |
| Medium | $20,409.60 | $7,800.00 | **$12,609.60** |
| High-performance | $41,433.60 | $17,400.00 | **$24,033.60** |

## What I recommended, and why I trusted it

**OVHcloud, at the medium tier or above.** The small tiers on both providers are too tight on
RAM and CPU for a stable production k3s node. The dedicated Rise and Advance servers also give
isolated cores, so performance doesn't degrade from noisy neighbours.

I wasn't guessing about OVH. My own studio's cluster runs on an OVH dedicated server for
**$52/month**: 64 GB of RAM, 1 TB of storage and an extra IP. It hosts eight substantial projects
with two environments each ([the Tidan Games platform](/projects/tidan-platform)). That's
about $624 a year, or $6,240 over ten.

## Where AWS still wins

AWS has the broader ecosystem: managed databases, IAM, and services you'd otherwise build
yourself. And Reserved Instances can bring its compute price down. For a single-node cluster
with heavy storage and public traffic, though, the usage-based storage and egress pricing
outweighs those advantages.
