## CMS onboarding przez CI/CD

Repo ma teraz dwa workflowy GitHub Actions:

- `.github/workflows/deploy.yml` wdraża aplikację i wykonuje `prisma db push` przed buildem.
- `.github/workflows/admin-user.yml` tworzy lub resetuje użytkownika CMS bezpośrednio na VPS.

### Jak dodać nowego developera

1. Uruchom workflow `Create Or Reset CMS User`.
2. Podaj `email`, rolę `developer` i opcjonalnie `username`.
3. Odbierz hasło tymczasowe z `Step Summary`.
4. Developer loguje się przez `/admin/login`.

### Wymagane sekrety GitHub Actions

- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`
- `VPS_KNOWN_HOSTS`

### Lokalne wywołanie przez GitHub CLI

```bash
npm run admin:user:create:gh -- dev2@example.com developer dev2
```

Możesz też uruchomić bezpośrednio na serwerze:

```bash
npm run admin:user:create -- --email dev2@example.com --role developer --username dev2
```

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
