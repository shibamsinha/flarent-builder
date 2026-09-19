import { describe, expect, it } from 'vitest';
import type { TemplateDefaults } from './profile';
import { addressLines, emptyProfileInput, fullAddress, resolveProfile, suggestEmail } from './profile';

const DEFAULTS: TemplateDefaults = {
  tagline: 'Default tagline',
  description: 'Default description',
  email: 'default@example.com',
  phone: '+44 000 000',
  whatsapp: '+44111111',
  street: 'Default Street',
  city: 'Default City',
  hours: 'Mon-Fri 9-5',
  offerings: [
    { title: 'One', body: 'First default' },
    { title: 'Two', body: 'Second default' },
    { title: 'Three', body: 'Third default' },
  ],
};

describe('resolveProfile', () => {
  it('keeps every answer the user gave', () => {
    const profile = resolveProfile(
      {
        businessName: 'Riverside Dental',
        tagline: 'Gentle dentistry',
        email: 'hi@riverside.test',
        street: '12 Mill Lane',
        city: 'Bath',
      },
      DEFAULTS,
    );
    expect(profile.businessName).toBe('Riverside Dental');
    expect(profile.tagline).toBe('Gentle dentistry');
    expect(profile.email).toBe('hi@riverside.test');
    expect(fullAddress(profile)).toBe('12 Mill Lane, Bath');
  });

  it('falls back to the template default for blank answers', () => {
    const profile = resolveProfile(
      { businessName: 'Riverside Dental', tagline: '   ', email: '' },
      DEFAULTS,
    );
    expect(profile.tagline).toBe('Default tagline');
    expect(profile.email).toBe('default@example.com');
  });

  it('reuses the phone number for WhatsApp when none is given', () => {
    const profile = resolveProfile({ businessName: 'X', phone: '+44 7700 900123' }, DEFAULTS);
    expect(profile.whatsapp).toBe('+44 7700 900123');
  });

  it('prefers an explicit WhatsApp number over the phone', () => {
    const profile = resolveProfile(
      { businessName: 'X', phone: '+44 1', whatsapp: '+44 2' },
      DEFAULTS,
    );
    expect(profile.whatsapp).toBe('+44 2');
  });

  it('fills partially answered offerings from the defaults', () => {
    const profile = resolveProfile(
      {
        businessName: 'X',
        offerings: [{ title: 'Check-ups', body: '' }, { title: '', body: '' }, { title: '', body: '' }],
      },
      DEFAULTS,
    );
    expect(profile.offerings[0].title).toBe('Check-ups');
    expect(profile.offerings[0].body).toBe('First default');
    expect(profile.offerings[1].title).toBe('Two');
  });

  it('always yields three offerings', () => {
    const profile = resolveProfile({ businessName: 'X' }, DEFAULTS);
    expect(profile.offerings).toHaveLength(3);
  });

  it('never leaves the business name empty', () => {
    expect(resolveProfile({ businessName: '   ' }, DEFAULTS).businessName).toBe('Your business');
  });

  it('treats a blank colour as no override', () => {
    expect(resolveProfile({ businessName: 'X', primaryColor: '' }, DEFAULTS).primaryColor).toBeUndefined();
    expect(resolveProfile({ businessName: 'X', primaryColor: '#123456' }, DEFAULTS).primaryColor).toBe('#123456');
  });

  it('stacks the address for footer use', () => {
    const profile = resolveProfile({ businessName: 'X', street: 'A', city: 'B' }, DEFAULTS);
    expect(addressLines(profile)).toBe('A<br>B');
  });

  it('omits a missing address line rather than leaving a stray comma', () => {
    const profile = resolveProfile({ businessName: 'X', street: 'A', city: ' ' }, { ...DEFAULTS, city: '' });
    expect(fullAddress(profile)).toBe('A');
  });
});

describe('suggestEmail', () => {
  it('builds a plausible address from the business name', () => {
    expect(suggestEmail('Riverside Dental')).toBe('hello@riversidedental.com');
    expect(suggestEmail("O'Brien & Sons")).toBe('hello@obriensons.com');
  });

  it('returns nothing when there is no usable name', () => {
    expect(suggestEmail('   ')).toBe('');
  });
});

describe('emptyProfileInput', () => {
  it('starts with three blank offerings and no name', () => {
    const input = emptyProfileInput();
    expect(input.businessName).toBe('');
    expect(input.offerings).toHaveLength(3);
  });
});

describe('artwork follows the chosen brand colour', () => {
  it('keeps the template palette when no colour was chosen', async () => {
    const { artColors } = await import('@/templates/kit');
    const profile = resolveProfile({ businessName: 'X' }, DEFAULTS);
    expect(artColors(profile, '#5b3df5', '#8c6bff')).toEqual({ from: '#5b3df5', to: '#8c6bff' });
  });

  it('derives a matching pair from a chosen colour', async () => {
    const { artColors } = await import('@/templates/kit');
    const profile = resolveProfile({ businessName: 'X', primaryColor: '#0f7b4f' }, DEFAULTS);
    const art = artColors(profile, '#5b3df5', '#8c6bff');
    expect(art.from).toBe('#0f7b4f');
    // The second stop is the same hue, lightened, never the template's colour.
    expect(art.to).not.toBe('#8c6bff');
    expect(art.to).toMatch(/^#[0-9a-f]{6}$/);
  });
});
