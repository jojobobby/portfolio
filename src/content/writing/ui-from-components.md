---
title: 'Takeaway: Build UI from a few components, not one-off screens'
date: 2026-10-09
kind: design
summary: How I learned UI over eight years, from hand-placed screens to a component system with declared states.
project: arcana
---

UI is one of the top reasons a game thrives or fails. Players forgive a lot, but not a menu
that fights them. It took me years to learn how to build it well.

## 2018 to 2022: every screen by hand

At first every window was its own code. Each tooltip, panel and button was positioned and
styled where it was used. My commits from then are full of one-off fixes: UI scale, HP bar
scaling, tooltip after tooltip. Changing how buttons looked meant finding every button.

## 2023: the first components

In April 2023 I pulled shared pieces out into components and fixed GUI scaling and positioning
across the whole client in one pass. Screens started to look like they belonged to the same
game.

## 2025: everything replicable

In November 2025 I committed to "everything is replicable". One `Button` class with an
`IButtonComponent` interface is the base for every button, and variants like the close button
are small overrides. A factory hands out the common pieces: backgrounds, headers, buttons,
line breaks. A screen becomes a list of steps, each about two lines of code:

```
addContainer();
addClose();
addName();
addScrollableContainer();
addRewards();
addPurchaseButton();
```

It wasn't pretty, but it got the job done, and every new screen came out consistent.

## 2026: a real system, with an artist

In September 2026 I spent 20 days redesigning and restructuring the whole UI infrastructure,
with new UI art from afentis:

- **A few building blocks.** Everything compiles down to the same small set of components:
  `button`, `input_text`, and bigger ones like `window` for building screens quickly.
- **Declared states.** A state machine generates every state of every component: normal,
  hover, pressed, disabled, selected, dragging. Each component lists its states, and the same
  states drive its tweens.
- **Cheap variations.** Because screens are assembled from blocks, I can try several versions
  of a screen fast and keep the one players like.

<figure><img src="/media/ui/button_default.png" alt="A button in its normal, hover, pressed, disabled and selected states" /></figure>
<figure><img src="/media/ui/stepper.png" alt="A number stepper at normal, at its minimum, at its maximum, and disabled" /></figure>
<figure><img src="/media/ui/window.png" alt="A window in its normal and dragging states" /></figure>

Arcana's client now has 157 UI component files, a sheet that renders every state of every
component, written rules for text sizes and colours, and a lint tool that checks screens
against those rules.

## What I'd tell myself in 2018

- Build the blocks once and use them everywhere. Consistency is free after that.
- States are design. If you haven't drawn the disabled state, you haven't designed the button.
- Make variations cheap, so players can pick instead of you guessing.
- Write the rules down and check them with a tool, not by memory.

The same idea carried into everything else I build, like the launcher and the websites. Small
parts, used everywhere.
