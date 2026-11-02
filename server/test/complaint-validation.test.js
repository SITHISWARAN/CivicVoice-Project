import test from 'node:test';
import assert from 'node:assert/strict';
import { validateComplaintSubmission } from '../complaint-validation.js';

const categories = ['Streetlight', 'Garbage', 'Other'];
const validPayload = () => ({
  confirmed: true,
  category: 'Streetlight',
  description: 'Streetlight not working after sunset.',
  address: 'Anna Nagar 2nd Street, Chennai',
  lat: 13.08518,
  lng: 80.21022,
  durationDays: 3,
  durationText: '3 days'
});

test('accepts a valid explicitly confirmed complaint payload', () => {
  const result = validateComplaintSubmission(validPayload(), categories);
  assert.equal(result.ok, true);
  assert.equal(result.value.category, 'Streetlight');
  assert.equal(result.value.lat, 13.08518);
  assert.equal(result.value.durationDays, 3);
});

test('rejects non-boolean confirmation values', () => {
  const payload = validPayload();
  payload.confirmed = 'true';
  assert.match(validateComplaintSubmission(payload, categories).error, /explicitly confirm/i);
});

test('rejects categories outside the catalogue', () => {
  const payload = validPayload();
  payload.category = 'Made-up category';
  assert.match(validateComplaintSubmission(payload, categories).error, /valid complaint category/i);
});

test('rejects blank coordinate strings instead of coercing them to zero', () => {
  const payload = validPayload();
  payload.lat = '';
  assert.match(validateComplaintSubmission(payload, categories).error, /map location/i);
});

test('rejects coordinates outside geographic ranges', () => {
  const payload = validPayload();
  payload.lat = 93;
  assert.match(validateComplaintSubmission(payload, categories).error, /coordinates are invalid/i);
});

test('rejects negative, fractional, and nonnumeric durations', () => {
  for (const value of [-1, 1.5, 'three', [], true]) {
    const payload = validPayload();
    payload.durationDays = value;
    assert.match(validateComplaintSubmission(payload, categories).error, /Duration in days/);
  }
});

test('allows a zero-day duration and numeric coordinate strings', () => {
  const payload = validPayload();
  payload.durationDays = 0;
  payload.lat = '13.08518';
  payload.lng = '80.21022';
  const result = validateComplaintSubmission(payload, categories);
  assert.equal(result.ok, true);
  assert.equal(result.value.durationDays, 0);
  assert.equal(result.value.lat, 13.08518);
});

test('enforces text field limits', () => {
  const longDescription = validPayload();
  longDescription.description = 'x'.repeat(1601);
  assert.match(validateComplaintSubmission(longDescription, categories).error, /description/i);
  const longAddress = validPayload();
  longAddress.address = 'x'.repeat(301);
  assert.match(validateComplaintSubmission(longAddress, categories).error, /location/i);
});
