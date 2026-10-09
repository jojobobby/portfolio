---
title: 'Postmortem: Removing a privileged init container broke Zammad''s temp directory'
date: 2026-09-23
kind: postmortem
summary: A support desk 500 caused by hardening one thing too far.
project: tidan-platform
---

**Impact:** the studio's new support desk (Zammad) returned HTTP 500 while its first admin was
connecting an email account in the setup wizard. Nothing else was affected, and no data was lost.
Time to fix, once reported: about ten minutes.

## Background

When I deployed the support desk from its official Helm chart, I turned off one of the chart's
init containers. It ran **privileged, as root**, and all it did was `chmod` a temporary
directory, an `emptyDir` volume. My reasoning: the pod already sets an `fsGroup`, so the
directory is writable by the app's group, and a privileged container on a shared node is a real
risk. The deployment came up healthy, and every page returned 200.

## What happened

1. The admin went through the setup wizard and reached the step that connects an email inbox.
2. That step failed with HTTP 500.
3. The server log showed one line: `ArgumentError: could not find a temporary directory`.

## Root cause

Kubernetes creates an `emptyDir` with mode `0777`, and with `fsGroup` set it becomes `2777`:
world-writable, with **no sticky bit**. Zammad runs on Ruby, and Ruby's `Dir.tmpdir` deliberately
refuses a world-writable directory without the sticky bit, because any user could delete or swap
another user's temporary files there. With no acceptable temp directory, any request that needed
a temporary file failed. Email setup was simply the first one.

The init container I'd removed was the fix for exactly this: it ran `chmod 770` on the
directory.

## Why it got past me

My checks loaded pages, and page loads don't create temporary files. "Every page returns 200"
proved the app started, not that it worked.

## Fix

I put the init container back, but not as upstream wrote it. Changing permissions on a
directory you own needs no special capability, and the `emptyDir` is owned by root, so the
container now runs as root with **every capability dropped**, not privileged and with no
privilege escalation. The directory is `770` again, and the error is gone.

```yaml
volumePermissions:
  enabled: true
  securityContext:
    runAsUser: 0
    privileged: false
    allowPrivilegeEscalation: false
    capabilities: { drop: [ALL] }
```

## A second finding from the same review

While debugging, I noticed the chart's setup Job deleted itself five minutes after finishing,
and Argo CD, seeing a tracked resource missing, recreated it. The app's full setup routine had
been re-running every few minutes since deploy. Making the Job an Argo CD **Sync hook** means
it runs once per change instead of forever.

## What I changed in how I work

- **Before removing something from an upstream chart, find out why it's there.** "It looks
  unnecessary" is a hypothesis, not a finding.
- **Prefer least privilege over removal.** The secure version of the init container was a
  five-line change; deleting it broke the app.
- **Smoke-test real workflows, not just page loads:** an upload, an email, anything that
  touches the disk.
