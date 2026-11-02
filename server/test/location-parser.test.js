import test from 'node:test';
import assert from 'node:assert/strict';
import { extractLocationFromNarrative } from '../location-parser.js';

const noPreset = () => null;

test('does not mistake “our street” plus a complaint for an address', () => {
  assert.equal(extractLocationFromNarrative('எங்கள் தெருவில் லைட்டு 2 நாளாக எரிய மாட்டேருக்கு', noPreset), '');
  assert.equal(extractLocationFromNarrative('எங்கள் தெருவில் லைட்டு 2 நாளாக எரியவில்லை ஸ்ட்ரீட் லைட்', noPreset), '');
});

test('extracts a named Tamil street when the locative suffix follows the name', () => {
  assert.equal(extractLocationFromNarrative('அண்ணா நகர் 2வது தெருவில் ஸ்ட்ரீட் லைட் எரியவில்லை', noPreset), 'அண்ணா நகர் 2வது தெரு');
});

test('does not mistake “my street” for a mappable English address', () => {
  assert.equal(extractLocationFromNarrative('Streetlight is not working in my street for 2 days', noPreset), '');
});


test('does not try to geocode the entire Tamil drainage complaint as though it were an address', () => {
  assert.equal(extractLocationFromNarrative('எங்கள் தெருவில் 2 நாளாக டிரைனேஜ் ப்ராப்ளமாக இருக்கு', noPreset), '');
});

test('does not interpret a generic Telugu street reference as a precise address', () => {
  assert.equal(extractLocationFromNarrative('మా వీధిలో 2 రోజులుగా డ్రైనేజ్ ప్రాబ్లంగా ఉంది', noPreset), '');
});


test('treats generic Tamil and Telugu locative phrases as incomplete rather than geocodable addresses', async () => {
  const { looksLikePlace } = await import('../location-parser.js');
  assert.equal(looksLikePlace('எங்கள் தெருவில்'), false);
  assert.equal(looksLikePlace('எங்கள் பகுதியில்'), false);
  assert.equal(looksLikePlace('మా వీధిలో'), false);
  assert.equal(looksLikePlace('మా రోడ్డులో'), false);
});
