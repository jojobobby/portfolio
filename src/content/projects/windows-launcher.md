---
title: Game Launcher
org: Independent
role: Developer
dates: 2023 to Present
section: earlier
order: 10
summary: Auto-updating Windows launchers for Arcana and Cosmic Realm.
tech: [C#, WPF / XAML, .NET 9, NUnit]
---

Both games install and update through a launcher I wrote in C# with WPF and XAML.

- Checks for a new version, downloads the ZIP asynchronously, checks its SHA-256 hash, extracts it
  and tracks the installed version locally.
- Every step is a clear update state, so the launcher always shows what it is doing.
- Updates itself, and can switch between the live and test servers.
- Reusable XAML components and scalable interface assets, without changing the update and play flow.
- Arcana's started on .NET Framework 4.8 in 2023 and moved to .NET 9 in 2026, with NUnit tests.
- Cosmic Realm's was rebuilt in 2026 as a state machine with 226 tests, so each step (check,
  download, verify, install, launch) can be tested alone.

More on [my C# and .NET work](/projects/csharp-dotnet).
