---
title: Game Launcher
org: Independent
role: Developer
dates: 2023 to 2026
section: earlier
order: 10
summary: Auto-updating Windows launchers for Arcana and Cosmic Realm.
tech: [C#, WPF / XAML, .NET 9, NUnit]
---

Both games install and update through a launcher I wrote in C# with WPF and XAML.

- Checks for a new version, downloads it, checks its SHA-256 hash, then unpacks it.
- Updates itself, and can switch between the live and test servers.
- Arcana's started on .NET Framework 4.8 in 2023 and moved to .NET 9 in 2026, with NUnit tests.
- Cosmic Realm's was rebuilt in 2026 as a state machine with 226 tests, so each step of an
  update (check, download, verify, install, launch) is its own state that can be tested alone.

More on [my C# and .NET work](/projects/csharp-dotnet).
