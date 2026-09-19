/**
 * What a template needs to know about the business it is being built for.
 *
 * A template supplies a full set of industry-appropriate fallbacks, so a user
 * who types only their business name still gets a coherent site. Everything
 * they do answer replaces the placeholder copy before the project is created,
 * which is the point: nobody should have to hunt through a finished template
 * deleting someone else's company name.
 */

export interface Offering {
  title: string;
  body: string;
}

export interface BrandProfile {
  businessName: string;
  /** One line describing what the business does. */
  tagline: string;
  /** A short paragraph for the hero and about sections. */
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  street: string;
  city: string;
  /** Free text, one entry per line, shown in the footer. */
  hours: string;
  /** The three things the business wants to lead with. */
  offerings: Offering[];
  /** Overrides the template's own primary colour when set. */
  primaryColor?: string;
}

/** Everything a template must provide so blank answers still produce a site. */
export type TemplateDefaults = Omit<BrandProfile, 'businessName' | 'primaryColor'>;

/** What the onboarding form collects. Every field except the name is optional. */
export type ProfileInput = Partial<BrandProfile> & { businessName: string };

function pick(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Merge what the user told us over the template's defaults. Blank answers fall
 * back rather than leaving holes in the page.
 */
export function resolveProfile(input: ProfileInput, defaults: TemplateDefaults): BrandProfile {
  const businessName = pick(input.businessName, 'Your business');
  const offerings = (input.offerings ?? []).map((offering, index) => ({
    title: pick(offering?.title, defaults.offerings[index]?.title ?? ''),
    body: pick(offering?.body, defaults.offerings[index]?.body ?? ''),
  }));

  return {
    businessName,
    tagline: pick(input.tagline, defaults.tagline),
    description: pick(input.description, defaults.description),
    email: pick(input.email, defaults.email),
    phone: pick(input.phone, defaults.phone),
    // A business almost always uses its main number for WhatsApp.
    whatsapp: pick(input.whatsapp, pick(input.phone, defaults.whatsapp)),
    street: pick(input.street, defaults.street),
    city: pick(input.city, defaults.city),
    hours: pick(input.hours, defaults.hours),
    offerings: offerings.length > 0 ? offerings : defaults.offerings,
    primaryColor: input.primaryColor?.trim() || undefined,
  };
}

/** `42 Fisher Street, Old Town` for single-line use. */
export function fullAddress(profile: BrandProfile): string {
  return [profile.street, profile.city].filter(Boolean).join(', ');
}

/** `42 Fisher Street<br>Old Town` for stacked footer use. */
export function addressLines(profile: BrandProfile): string {
  return [profile.street, profile.city].filter(Boolean).join('<br>');
}

/** Turn a business name into a plausible email when the user gives none. */
export function suggestEmail(businessName: string): string {
  const domain = businessName
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24);
  return domain ? `hello@${domain}.com` : '';
}

/** An empty form, ready for the onboarding questions. */
export function emptyProfileInput(): ProfileInput {
  return {
    businessName: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    whatsapp: '',
    street: '',
    city: '',
    hours: '',
    offerings: [
      { title: '', body: '' },
      { title: '', body: '' },
      { title: '', body: '' },
    ],
  };
}
