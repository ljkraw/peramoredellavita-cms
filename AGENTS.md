# Per Amore della Vita – CMS

## Projekt
Strona restauracji **Per Amore della Vita**. Frontend od zera z wbudowanym CMS.

## Stack
- Next.js 15, App Router, TypeScript
- Prisma + PostgreSQL (baza: `peramoredellavita_cms`)
- Tailwind CSS, CSS Modules dla komponentów
- Panel admin: `/admin`

## Konwencje kluczy CMS

Format: `{sekcja}.{pole}` lub `{strona}.{sekcja}.{pole}`

| Klucz | Opis |
|---|---|
| `hero.title` | Główny nagłówek hero |
| `hero.subtitle` | Podtytuł hero |
| `hero.button` | Tekst przycisku CTA |
| `hero.image` | Ścieżka obrazu hero |
| `about.title` | Nagłówek sekcji "O nas" |
| `about.text` | Tekst "O nas" |
| `contact.title` | Nagłówek sekcji kontakt |
| `contact.address` | Adres restauracji |
| `contact.phone` | Telefon |
| `contact.email` | Email |
| `contact.hours` | Godziny otwarcia |

## Czytanie CMS w komponentach

ZAWSZE użyj wzorca: CMS → fallback z lib/content.ts

```typescript
const title = content['hero.title'] || heroContent.title;
```

Seed ZAWSZE z `pageId` + `sectionId` (nigdy NULL).

## Lokalne uruchomienie

```bash
cp .env.example .env   # uzupełnij DATABASE_URL
npm run db:setup       # generate + push + seed
npm run dev
```

Panel: http://localhost:3000/admin

## Deployment
- Port lokalny: 3000
- Baza: peramoredellavita_cms (własna, izolowana)
- VPS: TBD

## Onboarding admin/developer
- Workflow: `.github/workflows/admin-user.yml`
- Skrypt GH CLI: `npm run admin:user:create:gh -- <email> [role] [username]`
- Skrypt lokalny/VPS: `npm run admin:user:create -- --email ... --role developer --username ...`
