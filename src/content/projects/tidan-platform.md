---
title: Tidan Games Platform
org: Tidan Games LLC
role: Founder, SRE
dates: Ongoing
section: studio
order: 2
summary: The Kubernetes cluster that runs my games, studio tools, email and CI. Everything is deployed from Git.
tech: [k3s, Argo CD, Helm, Prometheus, Grafana, Loki, PostgreSQL, Redis, OpenBao, Harbor]
snippet:
  file: Arcana-Argocd-Apps / prod/portfolio.yaml
  code: |
    kind: Application
    metadata:
      name: portfolio
    spec:
      source:
        repoURL: git@github.com:jojobobby/portfolio.git
        targetRevision: main
        path: deploy
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
stats:
  - { value: '35', label: 'apps deployed by Argo CD' }
  - { value: '130+', label: 'pods on one node' }
  - { value: '$52/mo', label: 'OVH dedicated server' }
---

One server, everything defined in Git. Push a change and Argo CD applies it.

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
    <text x="292" y="92" style="fill:var(--text-dim);font-size:11.5px">app-of-apps, auto-sync, self-heal, prune</text>
    <rect x="276" y="300" width="448" height="56" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="292" y="324" style="fill:var(--text);font-weight:700">Edge: HAProxy ingress + cert-manager</text>
    <text x="292" y="344" style="fill:var(--text-dim);font-size:11.5px">Let's Encrypt certificates, issued and renewed automatically</text>
    <rect x="276" y="118" width="140" height="168" rx="8" style="fill:var(--bg-raised);stroke:var(--line)"/>
    <text x="290" y="140" style="fill:var(--warm);font-weight:700">Workloads</text>
    <text x="290" y="162" style="fill:var(--text);font-size:12px">Arcana prod + dev</text>
    <text x="290" y="180" style="fill:var(--text);font-size:12px">game stores</text>
    <text x="290" y="198" style="fill:var(--text);font-size:12px">wiki, tasks</text>
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
    <text x="598" y="180" style="fill:var(--text);font-size:12px">Grafana, Loki</text>
    <text x="598" y="198" style="fill:var(--text);font-size:12px">mail relay + inbox</text>
    <text x="598" y="216" style="fill:var(--text);font-size:12px">monthly backups</text>
    <text x="598" y="234" style="fill:var(--text);font-size:12px">CI runners</text>
    <text x="500" y="392" text-anchor="middle" style="fill:var(--text-dim);font-size:11.5px">Secrets never live in Git: they are created out of band or read from OpenBao.</text>
  </g>
</svg>
<figcaption>Commit to GitHub and Argo CD deploys it.</figcaption>
</figure>

- **Delivery:** Argo CD, GitHub Actions, self-hosted CI runners, Harbor registry.
- **Data:** PostgreSQL (CloudNativePG), Redis, OpenBao for secrets.
- **Monitoring:** Prometheus, Grafana, Loki.
- **Also runs:** the games, a store, email, a wiki, an issue tracker and a support desk.
- **Security:** non-root containers, no privileged pods, network policies.

**Next:** off-site backups and a second node.
