# The Riot — redesign concept

A pitch artifact for **The RIOT private club** (Bjørvika, Oslo). A complete one-page redesign built to a 2026 standard, so the upgrade can be *seen* — not described — inside a cold-outreach email.

## Concept: "Et opprør i ro"

A loud name delivered with extreme restraint. Quiet luxury, serene and calm: warm ivory paper, walnut-espresso ink, a high-contrast editorial serif at light weight, light-filled photography, italic emphasis, and a single muted amber as a whisper.

## The interaction: a sticky card-deck

The page is a deck of full-viewport cards. As you scroll, each card deals up over the previous one while the card behind eases back and dims — like dealing cards to the back of a stack. The stacking is pure CSS `position: sticky`; GSAP adds the scale/dim morph and the hero's opening reveal. It degrades gracefully (cards still stack with no JS / reduced motion).

## The cards (in order)

1. **Hero** — light serif over a warm, light-filled club interior; opening morph.
2. **Statement** — oversized serif, "Trening er bare *begynnelsen.*"
3–7. **Rooms** — full-bleed image cards: basseng & spa, badstue, isbad, behandling, pust & meditasjon.
8. **Poster** — an editorial card floating over a bright photo (the philosophy).
9. **Membership** — deep walnut color-block with the scarcity line and the `Søk medlemskap` CTA.

Then a quiet footer.

## Stack

Vanilla HTML/CSS/JS (matches their build, drops into anything), plus:
- **GSAP + ScrollTrigger** — hero reveal, horizontal gallery pin, parallax, masked statements.
- **Lenis** — smooth scroll.
- Fonts: **Zodiak** (display serif + italics, Fontshare); **Bricolage Grotesque** (body/UI) and **Schibsted Grotesk** (labels), both Google Fonts.
- `prefers-reduced-motion` honored; on mobile the gallery falls back to native horizontal swipe; degrades to static and visible if JS/CDN fails.

## Run it

Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Note on imagery

Photography is **indicative** (color-graded Unsplash, tuned to one warm palette). In a real engagement these slots are filled with The Riot's own studio photography from Bjørvika.
