# SermonGraphic Builder

A Next.js builder for generating sermon graphics, church flyers, social images, stage graphics, and web visuals using OpenAI image generation.

## Features

- Sermon title, scripture, and theme inputs
- Church-focused visual style presets
- Preset aspect ratios:
  - 1080x1080
  - 1080x1350
  - 1080x1920
  - 1280x720
  - 1640x624
  - 1920x800
  - 1920x1080
  - 3840x2160
  - 3840x1080
  - 4096x1152
  - 5760x1080
  - 7680x2160
- Custom size option
- Download PNG
- Backend safety filters for sexual content, nudity, gore, gross imagery, graphic violence, and self-harm imagery

## Important note about image sizes

OpenAI image models generate in a limited set of native sizes. This app accepts your desired church output dimensions and uses the closest supported OpenAI generation shape. For exact final dimensions like 4096x1152 or 7680x2160, add a server-side resize/upscale step later.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your OpenAI key to `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

Then open:

```txt
http://localhost:3000/builder
```

## Vercel setup

1. Push this project to GitHub.
2. Import the GitHub repo into Vercel.
3. Add an environment variable:

```txt
OPENAI_API_KEY=your_openai_api_key
```

4. Deploy.
5. Open `/builder` on your deployed Vercel URL.
6. Embed that URL into Wix with an Embed Site / HTML iframe element.

## Safety guardrails

Safety lives in `lib/safety.ts` and is enforced in `app/api/generate/route.ts` before the image request reaches OpenAI.

Blocked content includes:

- Sexual content
- Nudity
- Fetish content
- Pornographic content
- Gore
- Gross bodily fluids
- Mutilation
- Graphic violence
- Self-harm imagery
- Sexual content involving minors

You can add more blocked terms or connect a moderation model/API later for stronger semantic filtering.
