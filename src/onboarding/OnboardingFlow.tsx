import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader, Sparkles } from 'lucide-react';
import { Field, Modal } from '@/components/ui';
import { TEMPLATES } from '@/templates';
import type { TemplateDefinition } from '@/templates';
import { TemplateThumb } from '@/dashboard/TemplateThumb';
import type { ProfileInput } from './profile';
import { emptyProfileInput, suggestEmail } from './profile';

type StepId = 'template' | 'business' | 'offerings' | 'contact';

const STEPS: { id: StepId; label: string; title: string; blurb: string }[] = [
  {
    id: 'template',
    label: 'Style',
    title: 'Pick a starting point',
    blurb: 'Choose the layout closest to what you need. Everything in it can be changed later.',
  },
  {
    id: 'business',
    label: 'Business',
    title: 'Tell us about your business',
    blurb: 'This goes straight into your site, so you will not have to delete anyone else’s company name.',
  },
  {
    id: 'offerings',
    label: 'Offer',
    title: 'What do you want to lead with?',
    blurb: 'The three things customers should see first. Leave any of them blank to use the suggestion.',
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'How can people reach you?',
    blurb: 'Used on the contact page, in the footer and on the map.',
  },
];

const COLOR_CHOICES = [
  { label: 'Template default', value: '' },
  { label: 'Purple', value: '#7217b2' },
  { label: 'Blue', value: '#1d4ed8' },
  { label: 'Green', value: '#0f7b4f' },
  { label: 'Terracotta', value: '#b4552d' },
  { label: 'Black', value: '#151515' },
];

/**
 * Collects who the site is for, then builds the project around those answers.
 *
 * A template is a layout, not a finished company: picking one should never
 * leave someone editing a stranger's name out of every page.
 */
export function OnboardingFlow({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (templateId: string, profile: ProfileInput) => Promise<void>;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [profile, setProfile] = useState<ProfileInput>(emptyProfileInput);
  const [busy, setBusy] = useState(false);
  const [touchedName, setTouchedName] = useState(false);

  const template = useMemo(
    () => TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0],
    [templateId],
  );
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const nameMissing = profile.businessName.trim().length === 0;

  const set = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const setOffering = (index: number, field: 'title' | 'body', value: string) =>
    setProfile((current) => {
      const offerings = [...(current.offerings ?? [])];
      const existing = offerings[index] ?? { title: '', body: '' };
      offerings[index] = { ...existing, [field]: value };
      return { ...current, offerings };
    });

  function next() {
    if (step.id === 'business' && nameMissing) {
      setTouchedName(true);
      return;
    }
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  async function submit() {
    if (busy) return;
    if (nameMissing) {
      setTouchedName(true);
      setStepIndex(STEPS.findIndex((item) => item.id === 'business'));
      return;
    }
    setBusy(true);
    try {
      await onCreate(templateId, profile);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal wide title={step.title} description={step.blurb} onClose={onClose}
      footer={
        <>
          <span className="f-onb-progress">
            Step {stepIndex + 1} of {STEPS.length}
          </span>
          {stepIndex > 0 ? (
            <button className="f-btn f-btn-secondary" onClick={() => setStepIndex((i) => i - 1)} disabled={busy}>
              <ArrowLeft size={15} />
              Back
            </button>
          ) : (
            <button className="f-btn f-btn-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
          )}
          {isLast ? (
            <button className="f-btn f-btn-primary" onClick={() => void submit()} disabled={busy}>
              {busy ? <Loader size={15} className="f-spin" /> : <Sparkles size={15} />}
              {busy ? 'Building your site' : 'Build my website'}
            </button>
          ) : (
            <button className="f-btn f-btn-primary" onClick={next} disabled={busy}>
              Continue
              <ArrowRight size={15} />
            </button>
          )}
        </>
      }
    >
      <ol className="f-onb-steps">
        {STEPS.map((entry, index) => (
          <li
            key={entry.id}
            data-state={index === stepIndex ? 'current' : index < stepIndex ? 'done' : 'todo'}
          >
            <span className="f-onb-step-n">{index < stepIndex ? <Check size={12} /> : index + 1}</span>
            {entry.label}
          </li>
        ))}
      </ol>

      {step.id === 'template' ? (
        <TemplateStep selected={templateId} onSelect={setTemplateId} onConfirm={next} />
      ) : null}

      {step.id === 'business' ? (
        <div className="f-onb-fields">
          <Field
            label="Business name"
            help={touchedName && nameMissing ? undefined : 'Appears in the header, footer and page titles.'}
          >
            <input
              className="f-input"
              autoFocus
              value={profile.businessName}
              placeholder="Riverside Dental"
              onChange={(event) => {
                setTouchedName(true);
                set('businessName', event.target.value);
              }}
              onKeyDown={(event) => event.key === 'Enter' && next()}
            />
            {touchedName && nameMissing ? (
              <p className="f-onb-error">Your business needs a name before we can build the site.</p>
            ) : null}
          </Field>

          <Field label="One line about what you do" help="Used under your name and in the footer.">
            <input
              className="f-input"
              value={profile.tagline ?? ''}
              placeholder={template.defaults.tagline}
              onChange={(event) => set('tagline', event.target.value)}
            />
          </Field>

          <Field label="Short description" help="The opening paragraph on your home page.">
            <textarea
              className="f-textarea"
              rows={3}
              value={profile.description ?? ''}
              placeholder={template.defaults.description}
              onChange={(event) => set('description', event.target.value)}
            />
          </Field>

          <Field label="Brand colour" help="You can fine-tune every colour later in the Theme panel.">
            <div className="f-onb-colors">
              {COLOR_CHOICES.map((choice) => {
                const active = (profile.primaryColor ?? '') === choice.value;
                return (
                  <button
                    key={choice.label}
                    type="button"
                    className="f-onb-color"
                    data-active={active}
                    title={choice.label}
                    onClick={() => set('primaryColor', choice.value)}
                    style={{ background: choice.value || template.accent[0] }}
                  >
                    {choice.value === '' ? 'Auto' : ''}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      ) : null}

      {step.id === 'offerings' ? (
        <div className="f-onb-fields">
          {[0, 1, 2].map((index) => (
            <div key={index} className="f-onb-offering">
              <span className="f-onb-offering-n">{index + 1}</span>
              <div className="f-onb-offering-fields">
                <input
                  className="f-input"
                  value={profile.offerings?.[index]?.title ?? ''}
                  placeholder={template.defaults.offerings[index]?.title}
                  onChange={(event) => setOffering(index, 'title', event.target.value)}
                />
                <textarea
                  className="f-textarea"
                  rows={2}
                  value={profile.offerings?.[index]?.body ?? ''}
                  placeholder={template.defaults.offerings[index]?.body}
                  onChange={(event) => setOffering(index, 'body', event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {step.id === 'contact' ? (
        <div className="f-onb-fields">
          <div className="f-onb-row">
            <Field label="Email">
              <input
                className="f-input"
                type="email"
                value={profile.email ?? ''}
                placeholder={suggestEmail(profile.businessName) || template.defaults.email}
                onChange={(event) => set('email', event.target.value)}
              />
            </Field>
            <Field label="Phone" help="Also used for the WhatsApp button.">
              <input
                className="f-input"
                value={profile.phone ?? ''}
                placeholder={template.defaults.phone}
                onChange={(event) => set('phone', event.target.value)}
              />
            </Field>
          </div>

          <div className="f-onb-row">
            <Field label="Street">
              <input
                className="f-input"
                value={profile.street ?? ''}
                placeholder={template.defaults.street}
                onChange={(event) => set('street', event.target.value)}
              />
            </Field>
            <Field label="Town or city">
              <input
                className="f-input"
                value={profile.city ?? ''}
                placeholder={template.defaults.city}
                onChange={(event) => set('city', event.target.value)}
              />
            </Field>
          </div>

          <Field label="Opening hours" help="One line per row. Shown in the footer.">
            <textarea
              className="f-textarea"
              rows={3}
              value={profile.hours ?? ''}
              placeholder={template.defaults.hours}
              onChange={(event) => set('hours', event.target.value)}
            />
          </Field>

          <p className="f-onb-note">
            Anything you leave blank uses the suggestion shown in grey. All of it stays editable
            once your site opens.
          </p>
        </div>
      ) : null}
    </Modal>
  );
}

function TemplateStep({
  selected,
  onSelect,
  onConfirm,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="f-onb-templates">
      {TEMPLATES.map((template: TemplateDefinition) => (
        <button
          key={template.id}
          type="button"
          className="f-tpl"
          data-selected={template.id === selected}
          onClick={() => onSelect(template.id)}
          onDoubleClick={onConfirm}
        >
          <TemplateThumb from={template.accent[0]} to={template.accent[1]} />
          <div className="f-tpl-body">
            <h4>{template.name}</h4>
            <p>{template.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
