import { getContentByPage } from '@/lib/cms-client';
import { heroContent, aboutContent, contactContent } from '@/lib/content';
import Image from "next/image";

export default async function HomePage() {
  const content: Record<string, string> = await getContentByPage('strona-glowna').catch(
    () => ({})
  );

  const hero = {
    title: content['hero.title'] || heroContent.title,
    subtitle: content['hero.subtitle'] || heroContent.subtitle,
    button: content['hero.button'] || heroContent.button,
    image: content['hero.image'] || heroContent.image,
  };

  const about = {
    title: content['about.title'] || aboutContent.title,
    text: content['about.text'] || aboutContent.text,
  };

  const contact = {
    title: content['contact.title'] || contactContent.title,
    address: content['contact.address'] || contactContent.address,
    phone: content['contact.phone'] || contactContent.phone,
    email: content['contact.email'] || contactContent.email,
    hours: content['contact.hours'] || contactContent.hours,
  };

  return (
    <>
      <main>
        {/* HERO */}
        <section
          id="hero"
          style={{
            minHeight: '100vh',
            background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${hero.image}) center/cover no-repeat`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#fff',
            padding: '2rem',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginBottom: '1.5rem', whiteSpace: 'pre-line', letterSpacing: '0.02em' }}>
              {hero.title}
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9, lineHeight: 1.6 }}>
              {hero.subtitle}
            </p>
            <a
              href="#kontakt"
              style={{
                display: 'inline-block',
                padding: '0.9rem 2.5rem',
                border: '1px solid #c8a96e',
                color: '#c8a96e',
                fontSize: '0.95rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'all 0.3s',
              }}
            >
              {hero.button}
            </a>
          </div>
        </section>

        {/* O NAS */}
        <section
          id="o-nas"
          style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            {about.title}
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
            {about.text}
          </p>
        </section>

        {/* KONTAKT */}
        <section
          id="kontakt"
          style={{ padding: '6rem 2rem', background: 'var(--bg-warm)' }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--primary)' }}>
                {contact.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                <p>📍 {contact.address}</p>
                <p>📞 {contact.phone}</p>
                <p>✉️ {contact.email}</p>
                <p>🕐 {contact.hours}</p>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '15px' }}>&copy; {new Date().getFullYear()} Per Amore della Vita. Wszelkie prawa zastrzeżone.</p>
        <a
          href="https://suntara.systems"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center opacity-60 hover:opacity-90 transition-opacity"
        >
          <Image
            src="/powered-suntara-white.svg"
            alt="Suntara Systems"
            width={110}
            height={28}
            className="h-auto"
          />
        </a>
      </footer>
    </>
  );
}

function ContactForm() {
  return (
    <form
      action="/api/contact"
      method="POST"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
        Napisz do nas
      </h3>
      {[
        { name: 'name', label: 'Imię i nazwisko', type: 'text' },
        { name: 'email', label: 'Adres email', type: 'email' },
        { name: 'phone', label: 'Telefon (opcjonalnie)', type: 'tel' },
      ].map((f) => (
        <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {f.label}
          </label>
          <input
            name={f.name}
            type={f.type}
            required={f.name !== 'phone'}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              background: '#fff',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Wiadomość
        </label>
        <textarea
          name="message"
          required
          rows={4}
          style={{ padding: '0.75rem 1rem', border: '1px solid var(--border)', background: '#fff', fontSize: '1rem', resize: 'vertical', outline: 'none' }}
        />
      </div>
      <button
        type="submit"
        style={{
          padding: '0.9rem',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          fontSize: '0.95rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Wyślij wiadomość
      </button>
    </form>
  );
}
