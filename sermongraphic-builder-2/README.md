# SermonGraphic Builder

Concept-first AI sermon graphic builder based on the SermonGraphic.com visual style.

## Vercel Environment Variable

`OPENAI_API_KEY=your_key_here`

## Routes

- `/builder` main tool
- `/api/preview` watermarked preview image
- `/api/download` clean high-res image

## Notes

This app generates a text-free AI background, then overlays the sermon typography in the browser using your style system. That keeps titles clean instead of letting AI misspell or make generic church posters.
