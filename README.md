# SermonGraphic Builder v4

A Next.js builder for generating sermon graphics, church flyers, social images, stage graphics, and web visuals using OpenAI image generation.

## What changed in v4

This version fixes the bad-looking AI results by changing the generation strategy:

1. OpenAI generates a **text-free background only**.
2. The app overlays the sermon title and scripture with controlled typography using Sharp/SVG.
3. Preview images are watermarked.
4. Clean high-res files are generated separately through `/api/download`.
5. Prompts now avoid cliché church-stock imagery such as generic churches, crosses, glowing Bibles, doves, and fake AI text.

## Routes

- `/builder` - user-facing builder
- `/api/preview` - generates a watermarked preview
- `/api/download` - creates a clean high-res export
- `/api/generate` - legacy route retained for compatibility

## Environment variables

```txt
OPENAI_API_KEY=your_openai_api_key
DOWNLOADS_REQUIRE_PAYMENT=false
```

Set `DOWNLOADS_REQUIRE_PAYMENT=true` later when Stripe/Supabase credits are connected.

## Deploy

Upload the contents of this folder to GitHub and deploy with Vercel as a Next.js project.
