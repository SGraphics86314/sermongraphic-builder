# SermonGraphic Builder

Clean Next.js sermon graphic builder.

## Setup

1. Upload these files to GitHub.
2. Deploy to Vercel.
3. Add environment variable:

```
OPENAI_API_KEY=your_key_here
```

## Routes

- `/builder` main builder UI
- `/api/preview` generates watermarked preview background + browser-rendered overlay
- `/api/download` generates clean high-res image data

This app generates a text-free AI background and overlays title/scripture in the browser to avoid misspelled AI typography.
