---
title: Getting a self-hosted mail server past Gmail
date: 2026-09-21
kind: engineering
summary: Five rejections in a row, what each one meant, and the setup that finally put mail in the inbox instead of spam.
project: tidan-platform
---

I wanted the studio's monthly backups delivered by email, without paying a mail provider. So the
cluster got its own mail system: a send-only relay that signs outgoing mail, and a full mailbox
server with spam filtering. The first test email bounced. So did the next four. Each rejection
was a different, precise message, and each one taught me a rule the big providers enforce.

## 1. `550-5.7.1` — no Message-ID

Gmail rejected the very first message because it had no `Message-ID` header. My backup job
built the email by hand in Python and only set From, To and Subject. Gmail treats a missing
`Message-ID` (and `Date`) as a sign of a broken or abusive sender.

**Fix:** always set both headers.

```python
msg["Date"] = email.utils.formatdate(localtime=False)
msg["Message-ID"] = email.utils.make_msgid(domain="tidangames.com")
```

## 2. `550-5.7.26` — neither SPF nor DKIM passed

With valid headers, the next bounce was about authentication: the domain published no SPF
record, so Gmail had no evidence the server was allowed to send for it. The relay was already
signing mail with DKIM, but the public key wasn't in DNS yet. I published three records:

| Record | Purpose |
|---|---|
| SPF (`v=spf1 ip4:… -all`) | says which IP may send mail for the domain |
| DKIM (`mail._domainkey`) | public key that verifies the relay's signature |
| DMARC (`_dmarc`) | tells receivers what to do when a check fails |

## 3. DNS refused the DKIM key: `CharacterStringTooLong`

The DKIM public key was 417 characters long, and a single DNS TXT string can hold at most 255.
The record has to be split into several quoted strings, which receivers join back together:

```
"v=DKIM1; k=rsa; p=MIIBIjANBgkqh…first 200 chars…" "…the rest of the key…"
```

## 4. `504` — need a fully-qualified HELO

Once the relay accepted the job's mail, my own inbox server rejected some senders because they
introduced themselves with a bare container hostname. Mail servers expect the `HELO`/`EHLO` name
to be a fully-qualified domain name. Python's `smtplib` uses the machine's hostname unless you
pass `local_hostname`, and inside a Kubernetes pod that hostname is just the pod name.

## 5. Delivered, but straight to Junk

Mail now arrived, in the spam folder. The backup job connected to the mail server from inside
the cluster without logging in, so its mail failed SPF from the server's own point of view, and
Rspamd (which files spam into Junk rather than deleting it) did its job. The fix was to stop
treating the backup job as an outside sender: it now **logs in and submits mail as the mailbox
user**, which is what authenticated submission is for.

## Takeaways

- Every one of these errors named the exact rule that failed. Reading the full bounce text was
  faster than any guessing.
- Deliverability is mostly DNS. SPF, DKIM and DMARC are the price of entry, and they're cheap.
- Treat internal jobs like real users: authenticate them, give them proper headers and names.
- Test against a strict receiver and a strict server of your own. Gmail caught the first three
  problems; my own mail server's checks caught the last two.
