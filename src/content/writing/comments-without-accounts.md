---
title: 'Comments without accounts'
date: 2026-10-09
kind: engineering
tag: learning
summary: How you can comment here with just a name, and why your email stays private.
project: tidan-platform
---

Every post on this site has comments now, and you don't need an account. Type a name, write
your comment, done. Adding an email is optional.

## What gets saved

- **Your name and comment.** These are public.
- **Your email, if you give one.** Never shown, never shared. It's only used to email you when
  someone replies to you.
- **Your IP address and a random ID your browser keeps.** These stop spam. They're never shown
  either.

I first wanted to recognise people by a hardware ID, but websites can't read those, on
purpose. A random ID saved in your browser plus your IP does the same job: it can tell when
the same person comments again, without needing a login.

## Reply emails, done safely

If anyone could type any email and get it spammed with reply notifications, that would be a
problem. So the first time you use an email, you get one message with a confirm link. Nothing
else is sent until you click it. After that, you get an email when someone replies to you,
and every one of those emails has a link to stop them.

## Keeping spam out

- A hidden form field only bots fill in. If it's filled, the comment is quietly dropped.
- At most five comments every ten minutes from the same IP or the same browser.
- Names up to 40 characters, comments up to 2,000, and every comment is shown as plain text,
  so nobody can sneak code into the page.

Rate limits only work if you know the real IP. My cluster's ingress was rewriting every
visitor's address to an internal one, so the first fix was a one-line change to stop that.

## How it's built

A small Node service sits next to the site at `/api`. Comments live in their own database on
my self-hosted PostgreSQL, and emails go out through my own mail server. The same service also
keeps the [Videos](/videos) page in sync with my YouTube channel every six hours, saving only
each video's title, date and thumbnail. The videos themselves stay on YouTube.
