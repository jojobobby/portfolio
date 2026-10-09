import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateComment, clientIp, LIMITS } from '../lib.mjs';

const ok = { post: 'pvp-at-10-tps', name: ' Ralph ', body: 'Nice post', deviceId: 'abcdef12-3456', email: '' };

test('accepts a minimal comment and trims the name', () => {
  const r = validateComment(ok);
  assert.equal(r.ok, true);
  assert.equal(r.value.name, 'Ralph');
  assert.equal(r.value.email, null);
});
test('email is optional but must look like an email', () => {
  assert.equal(validateComment({ ...ok, email: 'A@B.co' }).value.email, 'a@b.co');
  assert.equal(validateComment({ ...ok, email: 'nope' }).ok, false);
});
test('rejects empty and over-long fields', () => {
  assert.equal(validateComment({ ...ok, name: '   ' }).ok, false);
  assert.equal(validateComment({ ...ok, body: '' }).ok, false);
  assert.equal(validateComment({ ...ok, name: 'x'.repeat(LIMITS.name + 1) }).ok, false);
  assert.equal(validateComment({ ...ok, body: 'x'.repeat(LIMITS.body + 1) }).ok, false);
});
test('rejects bad post slugs, device ids and parent ids', () => {
  assert.equal(validateComment({ ...ok, post: '../etc' }).ok, false);
  assert.equal(validateComment({ ...ok, deviceId: 'short' }).ok, false);
  assert.equal(validateComment({ ...ok, parentId: -3 }).ok, false);
  assert.equal(validateComment({ ...ok, parentId: 7 }).value.parentId, 7);
});
test('client ip is the last X-Forwarded-For entry (the one our ingress added)', () => {
  assert.equal(clientIp({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' }, '10.42.0.1'), '203.0.113.9');
  assert.equal(clientIp({}, '::ffff:198.51.100.4'), '198.51.100.4');
  assert.equal(clientIp({ 'x-forwarded-for': 'not-an-ip<script>' }, ''), null);
});
