# SermonGraphic Builder

A Next.js sermon graphic builder that generates text-free AI backgrounds and overlays clean controlled typography in the app.

## Deploy

1. Upload all files in this folder to GitHub.
2. Import the repo into Vercel.
3. Add environment variable:

```txt
OPENAI_API_KEY=your_openai_key_here
```

4. Deploy.

## Routes

- `/` redirects to `/builder`
- `/builder` app UI
- `/api/preview` generates watermarked preview
- `/api/download` generates clean high-res output placeholder

## Notes

Preview and download both call OpenAI. Add Stripe/credits before public launch.
