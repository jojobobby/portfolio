// Pure helpers for the comment API: validation and request parsing. No I/O, so they are
// unit-tested directly (test/lib.test.mjs).
import { randomBytes, timingSafeEqual } from 'node:crypto';

export const LIMITS = {
  name: 40, body: 2000, email: 254, perIpPer10Min: 5, perDevicePer10Min: 5,
  sitePer10Min: 60, // all commenters together; stops a flood from many addresses
  confirmsPerAddressPerDay: 1, repliesPerAddressPerDay: 10, // no one can use us to spam an inbox
  keepIpsDays: 90,
};

const SLUG = /^[a-z0-9-]{1,100}$/;
const DEVICE = /^[A-Za-z0-9-]{8,64}$/;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
// Control characters, plus invisible ones that can fake or flip text: zero-width space, the
// left/right marks and bidi overrides, byte-order mark. Emoji joiners are kept.
const INVISIBLE = [0x200b, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069, 0xfeff];
const HIDDEN = new RegExp(`[\x00-\x08\x0b-\x1f\x7f-\x9f${String.fromCharCode(...INVISIBLE)}]`, 'g');

/** Remove characters that are invisible or can disguise text. Newlines and tabs are kept. */
export const clean = (s) => String(s ?? '').replace(/\r\n?/g, '\n').replace(HIDDEN, '');

/** Validate a new comment. Returns { ok, value } or { ok: false, error }. */
export function validateComment(input) {
  const post = String(input?.post ?? '');
  const name = clean(input?.name).replace(/\s+/g, ' ').trim();
  const body = clean(input?.body).replace(/\n{3,}/g, '\n\n').trim();
  const email = String(input?.email ?? '').trim().toLowerCase();
  const deviceId = String(input?.deviceId ?? '');
  const parentId = input?.parentId == null || input.parentId === '' ? null : Number(input.parentId);

  if (!SLUG.test(post)) return { ok: false, error: 'Unknown post.' };
  if (!name) return { ok: false, error: 'Add a name.' };
  if (name.length > LIMITS.name) return { ok: false, error: `Names are at most ${LIMITS.name} characters.` };
  if (!body) return { ok: false, error: 'Write a comment.' };
  if (body.length > LIMITS.body) return { ok: false, error: `Comments are at most ${LIMITS.body} characters.` };
  if (email && (email.length > LIMITS.email || !EMAIL.test(email))) return { ok: false, error: 'That email does not look right.' };
  if (!DEVICE.test(deviceId)) return { ok: false, error: 'Refresh the page and try again.' };
  if (parentId !== null && (!Number.isInteger(parentId) || parentId < 1)) return { ok: false, error: 'Unknown reply.' };
  return { ok: true, value: { post, name, body, email: email || null, deviceId, parentId } };
}

/**
 * The visitor's IP. Our HAProxy ingress appends the real client address to
 * X-Forwarded-For, so the LAST entry is the one a client cannot forge.
 */
export function clientIp(headers, remoteAddress) {
  const xff = headers['x-forwarded-for'];
  const list = (Array.isArray(xff) ? xff.join(',') : xff || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ip = (list.at(-1) || remoteAddress || '').replace(/^::ffff:/, '');
  return /^[0-9a-fA-F:.]{2,45}$/.test(ip) ? ip : null;
}

export const token = () => randomBytes(24).toString('base64url');

/** True when the Authorization header carries the admin token. Compared in constant time. */
export function isAdmin(header, adminToken) {
  if (!adminToken) return false;
  const got = Buffer.from(String(header || ''));
  const want = Buffer.from(`Bearer ${adminToken}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/** Plain-text email bodies. Short on purpose. */
export const mail = {
  confirm: (site, name, post, link) => ({
    subject: 'Confirm your email for replies',
    text: `Hi ${name},\n\nYou left a comment on ${site}/writing/${post}.\n\nConfirm this email to get an email when someone replies to you:\n${link}\n\nIf this wasn't you, ignore this email and nothing happens.\n\nYour email is never shown or shared. It is only used to tell you about replies.\n`,
  }),
  reply: (site, name, replier, excerpt, post, unsubscribe) => ({
    subject: `${replier} replied to your comment`,
    text: `Hi ${name},\n\n${replier} replied to your comment:\n\n"${excerpt}"\n\nRead it: ${site}/writing/${post}#comments\n\nStop reply emails: ${unsubscribe}\n`,
  }),
};
