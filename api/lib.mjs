// Pure helpers for the comment API: validation and request parsing. No I/O, so they are
// unit-tested directly (test/lib.test.mjs).
import { randomBytes } from 'node:crypto';

export const LIMITS = { name: 40, body: 2000, email: 254, perIpPer10Min: 5, perDevicePer10Min: 5 };

const SLUG = /^[a-z0-9-]{1,100}$/;
const DEVICE = /^[A-Za-z0-9-]{8,64}$/;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

/** Validate a new comment. Returns { ok, value } or { ok: false, error }. */
export function validateComment(input) {
  const post = String(input?.post ?? '');
  const name = String(input?.name ?? '').trim().replace(/\s+/g, ' ');
  const body = String(input?.body ?? '').trim();
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
