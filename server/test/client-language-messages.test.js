import test from 'node:test';
import assert from 'node:assert/strict';
import { localizedClientMessage } from '../../shared/language-detection.js';

const languages = ['ta-IN', 'ta-Latn', 'te-IN', 'te-Latn', 'hi-IN', 'hi-Latn', 'kn-IN', 'en-IN'];

test('client-side spoken replies are available for all eight selected language modes', () => {
  for (const language of languages) {
    for (const key of ['locationSelected', 'geocodeFound', 'geocodeNotFound', 'gpsFailed', 'speechFailed', 'conversationFailed']) {
      const message = localizedClientMessage(language, key, { place: 'Anna Nagar' });
      assert.equal(typeof message, 'string', `${language} / ${key}`);
      assert.ok(message.trim().length > 10, `${language} / ${key} should not be empty`);
    }
  }
});

test('romanized modes keep client-side assistant replies in Latin script', () => {
  for (const language of ['ta-Latn', 'te-Latn', 'hi-Latn']) {
    const message = localizedClientMessage(language, 'speechFailed');
    assert.doesNotMatch(message, /[\u0B80-\u0BFF\u0C00-\u0C7F\u0900-\u097F]/u, language);
  }
});
