# IEA Stays Image Import Guide

## Current Setup

The homepage is built to match the shared reference image. Right now, the PG room photos are cropped from:

`public/assets/homepage-reference.png`

This keeps the first version visually identical to the approved mockup.

## Replacing PG Photos For Publishing

1. Add your final room images inside:

   `public/assets/homes/`

2. Use these filenames:

   - `aries-studio.jpg`
   - `aries-nest.jpg`
   - `aries-bnb.jpg`

3. In `styles.css`, find the `.studio-photo`, `.nest-photo`, and `.bnb-photo` rules.

4. Replace them with:

```css
.studio-photo {
  background-image: url("assets/homes/aries-studio.jpg");
  background-size: cover;
  background-position: center;
}

.nest-photo {
  background-image: url("assets/homes/aries-nest.jpg");
  background-size: cover;
  background-position: center;
}

.bnb-photo {
  background-image: url("assets/homes/aries-bnb.jpg");
  background-size: cover;
  background-position: center;
}
```

## Recommended Image Size

Use landscape images around `1200 x 900px` or larger. Keep the bed/living area centered so the card crop looks clean on desktop and mobile.

## Future No-Code Admin Option

For a real published website where the owner can change images without editing code, connect this frontend to a CMS or admin backend such as Sanity, Strapi, Supabase, Firebase, or WordPress. The website structure is ready for that later; the current static version is best for launch preview or a simple hosted landing page.
