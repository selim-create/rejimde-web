This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Backend Integration

This project integrates with the `rejimde-core` WordPress plugin for backend API. See the documentation:

- **[API Integration Guide](docs/API_INTEGRATION.md)** - Complete API documentation
- **[Backend Configuration Checklist](docs/BACKEND_CHECKLIST.md)** - Backend setup requirements
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Common usage examples

### Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_WP_API_URL=http://api.rejimde.com/wp-json
```

## Project Structure

```
rejimde-web/
├── app/              # Next.js app directory (pages & routes)
├── components/       # Reusable React components
├── lib/              # Utility functions and API client
├── types/            # TypeScript type definitions
├── hooks/            # Custom React hooks
├── public/           # Static assets
└── docs/             # Documentation
```

## API Usage

```typescript
import { getPlans, getPlanBySlug, createPlan } from '@/lib/api';

// List all plans
const plans = await getPlans();

// Get single plan
const plan = await getPlanBySlug('plan-slug');

// Create new plan (requires authentication)
const result = await createPlan(planData);
```

See [Quick Reference](docs/QUICK_REFERENCE.md) for more examples.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
