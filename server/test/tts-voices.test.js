import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TTS_VOICES, resolveTtsVoice } from '../tts-voices.js';

test('blank Hindi and Kannada voice settings resolve to valid Timbre v2.5 defaults', () => {
  assert.equal(resolveTtsVoice({}, 'GNANI_TTS_VOICE_HI', 'hi-IN'), 'Nalini');
  assert.equal(resolveTtsVoice({}, 'GNANI_TTS_VOICE_KN', 'kn-IN'), 'Kavin');
});

test('Hinglish gets its dedicated voice by default', () => {
  assert.equal(resolveTtsVoice({}, 'GNANI_TTS_VOICE_HINGLISH', 'hi-Latn'), 'Poorvi');
});

test('unknown or mismatched .env voices safely fall back to a language-compatible default', () => {
  assert.equal(resolveTtsVoice({ GNANI_TTS_VOICE_HI: 'not-a-real-voice' }, 'GNANI_TTS_VOICE_HI', 'hi-IN'), 'Nalini');
  assert.equal(resolveTtsVoice({ GNANI_TTS_VOICE_KN: 'Nalini' }, 'GNANI_TTS_VOICE_KN', 'kn-IN'), 'Kavin');
});

test('valid language-compatible voice overrides are respected', () => {
  assert.equal(resolveTtsVoice({ GNANI_TTS_VOICE_KN: 'Saanvi' }, 'GNANI_TTS_VOICE_KN', 'kn-IN'), 'Saanvi');
});

test('every declared default is accepted for its language profile', () => {
  for (const [profile, voice] of Object.entries(DEFAULT_TTS_VOICES)) {
    assert.equal(resolveTtsVoice({}, 'unused', profile), voice);
  }
});
