import { Clock, Contact, Map as MapIcon, MessageCircle, Share2 } from 'lucide-react';
import type { ComponentDefinition } from '@/engine/registry/types';
import type { ListItem } from '@/types/props';
import { normalisePhone, sanitizeEmbedUrl } from '@/utils/sanitize';
import { bool, IconGlyph, itemId, list, num, str, STYLE_GROUPS } from './shared';

/* ---------------------------- contact form ----------------------------- */

const contactFormDef: ComponentDefinition<{
  title: string;
  description: string;
  fields: ListItem[];
  submitLabel: string;
  successMessage: string;
  layout: string;
}> = {
  type: 'contactForm',
  label: 'Contact form',
  icon: Contact,
  category: 'business',
  description: 'Collect enquiries with configurable fields.',
  keywords: ['enquiry', 'email', 'lead'],
  defaultProps: {
    title: 'Send us a message',
    description: 'We usually reply within one working day.',
    submitLabel: 'Send message',
    successMessage: 'Thanks — your message has been received.',
    layout: 'stacked',
    fields: [
      { id: itemId(), name: 'name', label: 'Your name', type: 'text', placeholder: 'Jane Doe', required: true },
      { id: itemId(), name: 'email', label: 'Email address', type: 'email', placeholder: 'jane@example.com', required: true },
      { id: itemId(), name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 010 2030', required: false },
      { id: itemId(), name: 'message', label: 'Message', type: 'textarea', placeholder: 'How can we help?', required: true },
    ],
  },
  defaultStyles: {
    desktop: {
      display: 'block',
      width: '100%',
      paddingTop: 32,
      paddingRight: 32,
      paddingBottom: 32,
      paddingLeft: 32,
      backgroundColor: 'var(--fl-color-background)',
      borderRadius: 'var(--fl-radius-lg)',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'var(--fl-color-border)',
    },
    mobile: { paddingTop: 24, paddingRight: 20, paddingBottom: 24, paddingLeft: 20 },
  },
  children: { kind: 'none' },
  inspector: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
    {
      key: 'layout',
      label: 'Layout',
      type: 'select',
      options: [
        { label: 'Stacked', value: 'stacked' },
        { label: 'Two columns', value: 'grid' },
      ],
    },
    {
      key: 'fields',
      label: 'Fields',
      type: 'list',
      itemLabelKey: 'label',
      addLabel: 'Add field',
      createItem: () => ({ id: itemId(), name: `field_${Math.floor(Math.random() * 1000)}`, label: 'New field', type: 'text', placeholder: '', required: false }),
      itemFields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'name', label: 'Field name', type: 'text', help: 'Used as the key in submissions.' },
        {
          key: 'type',
          label: 'Type',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'tel' },
            { label: 'Number', value: 'number' },
            { label: 'Long text', value: 'textarea' },
          ],
        },
        { key: 'placeholder', label: 'Placeholder', type: 'text' },
        { key: 'required', label: 'Required', type: 'toggle' },
      ],
    },
    { key: 'submitLabel', label: 'Button label', type: 'text' },
    { key: 'successMessage', label: 'Success message', type: 'text' },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ node, props, attrs, env }) => {
    const fields = list<ListItem>(props.fields);
    const interactive = env.mode !== 'editor';
    return (
      <div {...attrs}>
        <form
          className="fl-form"
          data-fl-form={node.id}
          data-fl-success={str(props.successMessage)}
          data-fl-endpoint={
            env.mode === 'export' ? env.project.settings.formEndpoint || undefined : undefined
          }
          onSubmit={(event) => {
            event.preventDefault();
            if (!interactive) return;
            void submitForm(event.currentTarget, node.id, str(props.successMessage));
          }}
        >
          {str(props.title) ? <h3 className="fl-form-title">{str(props.title)}</h3> : null}
          {str(props.description) ? <p className="fl-form-desc">{str(props.description)}</p> : null}
          <div className={str(props.layout, 'stacked') === 'grid' ? 'fl-form-grid' : 'fl-form-stack'}>
            {fields.map((field) => {
              const type = str(field.type, 'text');
              const fieldName = str(field.name, field.id);
              const wide = type === 'textarea' ? 'fl-form-row fl-form-row-wide' : 'fl-form-row';
              return (
                <label key={field.id} className={wide}>
                  <span>
                    {str(field.label)}
                    {bool(field.required) ? <em aria-hidden> *</em> : null}
                  </span>
                  {type === 'textarea' ? (
                    <textarea
                      name={fieldName}
                      rows={4}
                      placeholder={str(field.placeholder)}
                      required={bool(field.required)}
                      disabled={!interactive}
                    />
                  ) : (
                    <input
                      name={fieldName}
                      type={type}
                      placeholder={str(field.placeholder)}
                      required={bool(field.required)}
                      disabled={!interactive}
                    />
                  )}
                </label>
              );
            })}
          </div>
          <button type="submit" className="fl-btn fl-btn-primary fl-btn-md" disabled={!interactive}>
            {str(props.submitLabel, 'Send')}
          </button>
          <p className="fl-form-status" role="status" />
        </form>
      </div>
    );
  },
};

/**
 * Submission is deliberately routed through the form service rather than a
 * hardcoded endpoint, so swapping local storage for a hosted inbox later is a
 * one-line change.
 */
async function submitForm(form: HTMLFormElement, formId: string, successMessage: string) {
  const status = form.querySelector('.fl-form-status') as HTMLElement | null;
  const data: Record<string, string> = {};
  for (const [key, value] of new FormData(form).entries()) {
    data[key] = typeof value === 'string' ? value : value.name;
  }
  try {
    const { getFormService } = await import('@/services/forms');
    await getFormService().submit({ formId, data, submittedAt: Date.now() });
    if (status) {
      status.textContent = successMessage || 'Thank you.';
      status.dataset.state = 'ok';
    }
    form.reset();
  } catch (error) {
    if (status) {
      status.textContent = 'Something went wrong. Please try again.';
      status.dataset.state = 'error';
    }
    console.error('[flarent] form submission failed', error);
  }
}

/* -------------------------------- map ---------------------------------- */

const mapDef: ComponentDefinition<{
  embedUrl: string;
  address: string;
  height: number;
  radius: number;
  showAddress: boolean;
}> = {
  type: 'map',
  label: 'Map',
  icon: MapIcon,
  category: 'business',
  description: 'Show customers exactly where to find you.',
  keywords: ['google maps', 'location', 'directions'],
  defaultProps: {
    embedUrl: '',
    address: '128 High Street, London',
    height: 380,
    radius: 16,
    showAddress: true,
  },
  defaultStyles: { desktop: { display: 'block', width: '100%' } },
  children: { kind: 'none' },
  inspector: [
    { key: 'address', label: 'Address', type: 'text', help: 'Used for the caption and as a fallback map location.' },
    {
      key: 'embedUrl',
      label: 'Embed URL',
      type: 'embed',
      placeholder: 'https://www.google.com/maps/embed?pb=…',
      help: 'In Google Maps: Share → Embed a map → copy the src URL. Leave empty to use the address.',
    },
    { key: 'height', label: 'Height', type: 'number', min: 160, max: 900, unit: 'px' },
    { key: 'radius', label: 'Corner radius', type: 'number', min: 0, max: 48, unit: 'px' },
    { key: 'showAddress', label: 'Show address below map', type: 'toggle' },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ props, attrs }) => {
    const custom = sanitizeEmbedUrl(str(props.embedUrl));
    const address = str(props.address);
    const src = custom ?? (address ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : undefined);
    return (
      <div {...attrs}>
        {src ? (
          <iframe
            className="fl-map"
            src={src}
            title={address || 'Map'}
            style={{ height: num(props.height, 380), borderRadius: num(props.radius, 16) }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div
            className="fl-media-fallback"
            style={{ height: num(props.height, 380), borderRadius: num(props.radius, 16) }}
          >
            Add an address or a Google Maps embed URL
          </div>
        )}
        {bool(props.showAddress, true) && address ? <p className="fl-map-address">{address}</p> : null}
      </div>
    );
  },
};

/* ------------------------------ whatsapp -------------------------------- */

const whatsappDef: ComponentDefinition<{
  phone: string;
  message: string;
  label: string;
  style: string;
  size: string;
}> = {
  type: 'whatsapp',
  label: 'WhatsApp',
  icon: MessageCircle,
  category: 'business',
  description: 'One tap to a pre-filled WhatsApp chat.',
  keywords: ['chat', 'message', 'contact'],
  defaultProps: {
    phone: '+15550102030',
    message: 'Hi! I found you on your website and would like to know more.',
    label: 'Chat on WhatsApp',
    style: 'button',
    size: 'md',
  },
  defaultStyles: { desktop: { display: 'inline-flex' } },
  children: { kind: 'none' },
  inspector: [
    { key: 'phone', label: 'Phone number', type: 'text', placeholder: '+15550102030', help: 'Include the country code.' },
    { key: 'message', label: 'Pre-filled message', type: 'textarea', rows: 3 },
    { key: 'label', label: 'Button label', type: 'text', when: { key: 'style', equals: ['button'] } },
    {
      key: 'style',
      label: 'Display as',
      type: 'select',
      options: [
        { label: 'Button', value: 'button' },
        { label: 'Floating bubble', value: 'floating' },
      ],
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
  ],
  styleGroups: ['spacing', 'typography', 'border', 'effects'],
  render: ({ props, attrs, env }) => {
    const href = whatsappHref(str(props.phone), str(props.message));
    const floating = str(props.style, 'button') === 'floating';
    const className = [
      attrs.className,
      'fl-whatsapp',
      floating ? 'fl-whatsapp-floating' : `fl-btn fl-btn-whatsapp fl-btn-${str(props.size, 'md')}`,
    ].join(' ');
    return (
      <a
        {...attrs}
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={str(props.label, 'Chat on WhatsApp')}
        onClick={env.mode === 'editor' ? (event) => event.preventDefault() : undefined}
      >
        <WhatsAppGlyph />
        {!floating ? <span>{str(props.label, 'Chat on WhatsApp')}</span> : null}
      </a>
    );
  },
};

export function whatsappHref(phone: string, message: string): string {
  const digits = normalisePhone(phone).replace(/^\+/, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a9.83 9.83 0 0 0 4.69 1.19h.01c5.43 0 9.85-4.42 9.85-9.86 0-2.63-1.02-5.1-2.88-6.96A9.78 9.78 0 0 0 12.04 2Zm0 17.94c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.17.83.85-3.09-.2-.32a8.14 8.14 0 0 1-1.25-4.36c0-4.52 3.68-8.2 8.2-8.2 2.19 0 4.25.86 5.8 2.41a8.16 8.16 0 0 1 2.4 5.8c0 4.52-3.68 8.27-8.08 8.27Z" />
    </svg>
  );
}

/* --------------------------- business hours ---------------------------- */

const businessHoursDef: ComponentDefinition<{
  title: string;
  rows: ListItem[];
  highlightToday: boolean;
}> = {
  type: 'businessHours',
  label: 'Business hours',
  icon: Clock,
  category: 'business',
  description: 'Opening times, with today highlighted.',
  keywords: ['opening', 'times', 'schedule'],
  defaultProps: {
    title: 'Opening hours',
    highlightToday: true,
    rows: [
      { id: itemId(), day: 'Monday', hours: '9:00 – 18:00', closed: false },
      { id: itemId(), day: 'Tuesday', hours: '9:00 – 18:00', closed: false },
      { id: itemId(), day: 'Wednesday', hours: '9:00 – 18:00', closed: false },
      { id: itemId(), day: 'Thursday', hours: '9:00 – 20:00', closed: false },
      { id: itemId(), day: 'Friday', hours: '9:00 – 20:00', closed: false },
      { id: itemId(), day: 'Saturday', hours: '10:00 – 16:00', closed: false },
      { id: itemId(), day: 'Sunday', hours: '', closed: true },
    ],
  },
  defaultStyles: {
    desktop: {
      display: 'block',
      width: '100%',
      paddingTop: 24,
      paddingRight: 24,
      paddingBottom: 24,
      paddingLeft: 24,
      backgroundColor: 'var(--fl-color-surface)',
      borderRadius: 'var(--fl-radius-lg)',
    },
  },
  children: { kind: 'none' },
  inspector: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'highlightToday', label: "Highlight today's row", type: 'toggle' },
    {
      key: 'rows',
      label: 'Days',
      type: 'list',
      itemLabelKey: 'day',
      addLabel: 'Add day',
      createItem: () => ({ id: itemId(), day: 'Day', hours: '9:00 – 17:00', closed: false }),
      itemFields: [
        { key: 'day', label: 'Day', type: 'text' },
        { key: 'hours', label: 'Hours', type: 'text', when: { key: 'closed', equals: [false] } },
        { key: 'closed', label: 'Closed', type: 'toggle' },
      ],
    },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ props, attrs, env }) => {
    const today = env.mode === 'editor' ? -1 : new Date().getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return (
      <div {...attrs}>
        {str(props.title) ? <h3 className="fl-hours-title">{str(props.title)}</h3> : null}
        <ul className="fl-hours">
          {list<ListItem>(props.rows).map((row) => {
            const isToday =
              bool(props.highlightToday, true) && today >= 0 &&
              str(row.day).trim().toLowerCase() === dayNames[today];
            return (
              <li key={row.id} className={isToday ? 'fl-hours-row fl-hours-today' : 'fl-hours-row'}>
                <span>{str(row.day)}</span>
                <span>{bool(row.closed) ? 'Closed' : str(row.hours)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
};

/* ---------------------------- social links ----------------------------- */

const socialLinksDef: ComponentDefinition<{
  items: ListItem[];
  size: number;
  shape: string;
  gap: number;
}> = {
  type: 'socialLinks',
  label: 'Social links',
  icon: Share2,
  category: 'business',
  description: 'Row of icons linking to your profiles.',
  keywords: ['instagram', 'facebook', 'social'],
  defaultProps: {
    size: 20,
    shape: 'circle',
    gap: 10,
    items: [
      { id: itemId(), icon: 'Instagram', url: 'https://instagram.com/', label: 'Instagram' },
      { id: itemId(), icon: 'Facebook', url: 'https://facebook.com/', label: 'Facebook' },
      { id: itemId(), icon: 'Linkedin', url: 'https://linkedin.com/', label: 'LinkedIn' },
    ],
  },
  defaultStyles: { desktop: { display: 'flex', alignItems: 'center' } },
  children: { kind: 'none' },
  inspector: [
    { key: 'size', label: 'Icon size', type: 'number', min: 12, max: 48, unit: 'px' },
    { key: 'gap', label: 'Gap', type: 'number', min: 0, max: 48, unit: 'px' },
    {
      key: 'shape',
      label: 'Shape',
      type: 'select',
      options: [
        { label: 'Circle', value: 'circle' },
        { label: 'Rounded square', value: 'rounded' },
        { label: 'Plain icon', value: 'plain' },
      ],
    },
    {
      key: 'items',
      label: 'Profiles',
      type: 'list',
      itemLabelKey: 'label',
      addLabel: 'Add profile',
      createItem: () => ({ id: itemId(), icon: 'Globe', url: 'https://', label: 'Website' }),
      itemFields: [
        { key: 'icon', label: 'Icon', type: 'icon' },
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'url', label: 'URL', type: 'text', placeholder: 'https://' },
      ],
    },
  ],
  styleGroups: ['spacing', 'effects'],
  render: ({ props, attrs, env }) => (
    <div {...attrs} style={{ gap: num(props.gap, 10), ...attrs.style }}>
      {list<ListItem>(props.items).map((item) => (
        <a
          key={item.id}
          className={`fl-social fl-social-${str(props.shape, 'circle')}`}
          href={str(item.url, '#')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={str(item.label, 'Social profile')}
          onClick={env.mode === 'editor' ? (event) => event.preventDefault() : undefined}
        >
          <IconGlyph name={str(item.icon, 'Globe')} size={num(props.size, 20)} />
        </a>
      ))}
    </div>
  ),
};

export const businessComponents = [
  contactFormDef, mapDef, whatsappDef, businessHoursDef, socialLinksDef,
] as unknown as ComponentDefinition<never>[];
