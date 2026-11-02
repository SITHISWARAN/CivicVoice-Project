import test from 'node:test';
import assert from 'node:assert/strict';
import { isDurationUnitOnly, parseBareNumber, parseDuration, parseDurationUnitOnly, parseYesNo } from '../complaint-parsing.js';

test('parses two-day durations in the supported languages and scripts', () => {
  const samples = [
    'எங்கள் தெருவில் 2 நாளாக டிரைனேஜ் பிரச்சினை',
    'enga street-la 2 naala drainage problem irukku',
    'మా వీధిలో రెండు రోజులుగా డ్రైనేజ్ సమస్య',
    'maa veedhi lo 2 rojulu ga drainage problem undi',
    'हमारी गली में दो दिन से ड्रेनेज की समस्या है',
    'hamari gali mein 2 din se drainage problem hai',
    'ನಮ್ಮ ರಸ್ತೆಯಲ್ಲಿ ಎರಡು ದಿನಗಳಿಂದ ಚರಂಡಿ ಸಮಸ್ಯೆ',
    'There is a drainage problem for 2 days',
  ];
  for (const sample of samples) {
    assert.deepEqual(parseDuration(sample), { text: '2 days', days: 2 }, sample);
  }
});

test('parses a number followed by a separate duration unit', () => {
  assert.equal(parseBareNumber('दो'), 2);
  assert.equal(parseBareNumber('ಎರಡು'), 2);
  assert.equal(parseBareNumber('రెండు'), 2);
  assert.equal(isDurationUnitOnly('दिन'), true);
  assert.equal(isDurationUnitOnly('ದಿನಗಳು'), true);
  assert.equal(isDurationUnitOnly('రోజులు'), true);
  assert.deepEqual(parseDurationUnitOnly('दिन', 2), { text: '2 days', days: 2 });
  assert.deepEqual(parseDurationUnitOnly('ದಿನಗಳು', 2), { text: '2 days', days: 2 });
});

test('parses yes/no confirmation in all supported languages', () => {
  for (const yes of ['yes', 'aama', 'avunu', 'haan', 'हाँ', 'ಹೌದು', 'ஆம்', 'சரி']) assert.equal(parseYesNo(yes), true, yes);
  for (const no of ['no', 'illa', 'ledu', 'nahi', 'नहीं', 'ಇಲ್ಲ', 'வேண்டாம்', 'వద్దు']) assert.equal(parseYesNo(no), false, no);
});
