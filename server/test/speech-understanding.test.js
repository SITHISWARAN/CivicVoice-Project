import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreTranscriptCandidate } from '../speech-understanding.js';

test('prefers Tamil for Tamil-script civic speech', () => {
  const text = 'எங்கள் தெருவில் தெரு விளக்கு வேலை செய்யவில்லை';
  assert.ok(scoreTranscriptCandidate(text, 'ta-IN') > scoreTranscriptCandidate(text, 'en-IN'));
});

test('prefers Telugu for Telugu-script civic speech', () => {
  const text = 'మా వీధిలో వీధి దీపం పనిచేయడం లేదు';
  assert.ok(scoreTranscriptCandidate(text, 'te-IN') > scoreTranscriptCandidate(text, 'en-IN'));
});

test('recognizes romanized Tamil civic vocabulary', () => {
  const text = 'Anna Nagar street-la street light work aagala';
  assert.ok(scoreTranscriptCandidate(text, 'ta-IN') > scoreTranscriptCandidate(text, 'en-IN'));
});

test('penalizes too-short transcripts', () => {
  assert.ok(scoreTranscriptCandidate('hi', 'en-IN') < scoreTranscriptCandidate('There is a streetlight not working near my house.', 'en-IN'));
});


test('recognizes romanized Telugu-English drainage wording instead of over-scoring generic English words as Hindi', () => {
  const text = 'drainage problem ga undi';
  assert.ok(scoreTranscriptCandidate(text, 'te-IN') > scoreTranscriptCandidate(text, 'hi-IN'));
  assert.ok(scoreTranscriptCandidate(text, 'te-IN') > scoreTranscriptCandidate(text, 'en-IN'));
});
