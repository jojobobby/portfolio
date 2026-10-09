// Skills with the first year there is evidence for each one: my commits (every repo I own,
// plus Seneca Foundation's repos where I worked) or the start date of a job that lists it.
// Years are counted from "since" to the year the site is built, so they grow on their own.
// Anything I could not date is under alsoUsed, with no number.
export const FIRST_YEAR = 2018;

export type Skill = { name: string; since: number };
export type SkillGroup = { name: string; items: Skill[] };

export const skillGroups: SkillGroup[] = [
  {
    name: 'Languages',
    items: [
      { name: 'C#', since: 2018 },
      { name: 'ActionScript 3', since: 2018 },
      { name: 'HTML and CSS', since: 2022 },
      { name: 'JavaScript', since: 2022 },
      { name: 'Java', since: 2022 },
      { name: 'TypeScript', since: 2023 },
      { name: 'SQL', since: 2023 },
      { name: 'Bash', since: 2023 },
      { name: 'Python', since: 2024 },
      { name: 'Haxe', since: 2024 },
      { name: 'C++', since: 2024 },
    ],
  },
  {
    name: '.NET',
    items: [
      { name: '.NET Framework', since: 2018 },
      { name: 'LINQ', since: 2018 },
      { name: '.NET Core and modern .NET', since: 2021 },
      { name: 'WPF and XAML', since: 2023 },
      { name: 'MonoGame', since: 2024 },
      { name: 'ASP.NET Core', since: 2025 },
      { name: 'prometheus-net', since: 2025 },
      { name: 'Razor Pages', since: 2026 },
      { name: 'Blazor', since: 2026 },
      { name: 'NUnit and xUnit', since: 2026 },
    ],
  },
  {
    name: 'Web',
    items: [
      { name: 'React', since: 2022 },
      { name: 'Node.js', since: 2023 },
      { name: 'Express', since: 2023 },
      { name: 'REST APIs', since: 2023 },
      { name: 'Next.js', since: 2023 },
      { name: 'Prisma', since: 2023 },
      { name: 'Astro', since: 2026 },
    ],
  },
  {
    name: 'Game development',
    items: [
      { name: 'Multiplayer game servers', since: 2018 },
      { name: 'Game design and balancing', since: 2018 },
      { name: 'Combat and progression systems', since: 2018 },
      { name: 'Live-service operations', since: 2018 },
      { name: 'Playtesting', since: 2018 },
      { name: 'Flash and Adobe AIR clients', since: 2018 },
      { name: 'TCP/UDP networking, binary packets', since: 2020 },
      { name: 'Leading a team', since: 2020 },
      { name: 'Multithreading', since: 2024 },
      { name: 'Mentoring interns', since: 2024 },
    ],
  },
  {
    name: 'Containers and delivery',
    items: [
      { name: 'Docker', since: 2023 },
      { name: 'Docker Compose and Podman', since: 2024 },
      { name: 'GitHub Actions', since: 2024 },
      { name: 'Kubernetes (k3s)', since: 2024 },
      { name: 'Helm', since: 2024 },
      { name: 'Argo CD', since: 2024 },
      { name: 'Kustomize', since: 2025 },
      { name: 'Self-hosted runners and BuildKit', since: 2026 },
    ],
  },
  {
    name: 'Reliability and networking',
    items: [
      { name: 'Prometheus', since: 2025 },
      { name: 'Grafana', since: 2025 },
      { name: 'Loki', since: 2025 },
      { name: 'cert-manager and TLS', since: 2025 },
      { name: 'Ingress (HAProxy, NGINX)', since: 2025 },
      { name: 'MetalLB', since: 2025 },
      { name: 'RBAC', since: 2025 },
      { name: 'Health checks', since: 2025 },
      { name: 'Network policies', since: 2026 },
    ],
  },
  {
    name: 'Data',
    items: [
      { name: 'Redis', since: 2020 },
      { name: 'PostgreSQL', since: 2023 },
      { name: 'MySQL', since: 2023 },
      { name: 'Database migrations', since: 2023 },
      { name: 'Volume backups with CronJobs', since: 2025 },
    ],
  },
  {
    name: 'Cloud and automation',
    items: [
      { name: 'AWS', since: 2024 },
      { name: 'Linux and systemd', since: 2024 },
      { name: 'Sealed Secrets', since: 2026 },
      { name: 'Ansible', since: 2026 },
      { name: 'Terraform', since: 2026 },
      { name: 'OpenBao / Vault', since: 2026 },
    ],
  },
];

export const alsoUsed: string[] = [
  'WebSockets',
  'Proxmox',
  'SSH hardening',
  'Connection pooling',
  'Harbor',
  'Caddy',
  'Incident investigation',
];
