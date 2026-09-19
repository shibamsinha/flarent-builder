import { describe, expect, it } from 'vitest';
import { escapeHtml, normalisePhone, sanitizeEmbedUrl, sanitizeUrl } from './sanitize';
import { whatsappHref } from '@/engine/registry/components/business';

const NUL = String.fromCharCode(0);

describe('sanitizeUrl', () => {
  it('allows ordinary links', () => {
    expect(sanitizeUrl('https://example.com/page')).toBe('https://example.com/page');
    expect(sanitizeUrl('/about')).toBe('/about');
    expect(sanitizeUrl('#section')).toBe('#section');
  });

  it('blocks script schemes, including obfuscated ones', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('  javascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl(`java${NUL}script:alert(1)`)).toBeUndefined();
    expect(sanitizeUrl('vbscript:msgbox')).toBeUndefined();
  });

  it('allows inline images but no other data URLs', () => {
    expect(sanitizeUrl('data:image/png;base64,AAAA')).toContain('data:image/png');
    expect(sanitizeUrl('data:text/html;base64,AAAA')).toBeUndefined();
  });

  it('handles empty input', () => {
    expect(sanitizeUrl(undefined)).toBeUndefined();
    expect(sanitizeUrl('   ')).toBeUndefined();
  });
});

describe('sanitizeEmbedUrl', () => {
  it('requires https', () => {
    expect(sanitizeEmbedUrl('https://maps.google.com/x')).toBe('https://maps.google.com/x');
    expect(sanitizeEmbedUrl('http://maps.google.com/x')).toBeUndefined();
    expect(sanitizeEmbedUrl('javascript:alert(1)')).toBeUndefined();
  });
});

describe('escapeHtml', () => {
  it('escapes everything that could break out of markup', () => {
    expect(escapeHtml('<script>"x" & \'y\'</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;',
    );
  });
});

describe('whatsapp links', () => {
  it('strips formatting and encodes the message', () => {
    expect(whatsappHref('+1 (555) 010-2030', 'Hi there!')).toBe(
      'https://wa.me/15550102030?text=Hi%20there!',
    );
  });

  it('works without a message', () => {
    expect(whatsappHref('+15550102030', '')).toBe('https://wa.me/15550102030');
  });

  it('normalises phone input', () => {
    expect(normalisePhone('+44 (0)20 7946 0122')).toBe('+442079460122');
  });
});
