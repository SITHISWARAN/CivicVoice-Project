import test from 'node:test';
import assert from 'node:assert/strict';
import { inferLanguageFromTranscript, localizedClientMessage, resolveInitialConversationLanguage } from '../../shared/language-detection.js';

test('detects the supported native and romanized conversation modes', () => {
  const cases = [
    ['ta-IN', 'எங்கள் தெருவில் 2 நாளாக டிரைனேஜ் ப்ராப்ளமாக இருக்கு'],
    ['ta-Latn', 'enga street-la drainage problem irukku'],
    ['te-IN', 'మా వీధిలో రెండు రోజులుగా డ్రైనేజ్ సమస్య'],
    ['te-Latn', 'maa veedhi lo drainage problem ga undi'],
    ['hi-IN', 'हमारी गली में दो दिन से ड्रेनेज की समस्या है'],
    ['hi-Latn', 'hamari gali mein drainage problem hai'],
    ['kn-IN', 'ನಮ್ಮ ರಸ್ತೆಯಲ್ಲಿ ಎರಡು ದಿನಗಳಿಂದ ಚರಂಡಿ ಸಮಸ್ಯೆ'],
  ];
  for (const [expected, transcript] of cases) {
    assert.equal(inferLanguageFromTranscript(transcript), expected, transcript);
  }
});

test('does not let typed English inherit the default Tamil locale, while preserving STT evidence for unmarked romanized speech', () => {
  assert.equal(inferLanguageFromTranscript('There is a pothole near my house'), null);
  assert.equal(resolveInitialConversationLanguage('There is a drainage problem on my street for two days', 'en-IN', 'ta-IN'), 'en-IN');
  assert.equal(resolveInitialConversationLanguage('There is a pothole near my house', null, 'ta-IN'), 'en-IN');
  assert.equal(resolveInitialConversationLanguage('problem x y', 'te-IN', 'ta-IN'), 'te-IN');
});

test('location replies remain in the selected romanized script', () => {
  assert.match(localizedClientMessage('ta-Latn', 'geocodeFound'), /map-la/i);
  assert.match(localizedClientMessage('te-Latn', 'geocodeFound'), /map-lo/i);
  assert.match(localizedClientMessage('hi-Latn', 'geocodeFound'), /map par/i);
});
