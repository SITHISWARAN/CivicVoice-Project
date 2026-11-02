import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyComplaint } from '../classification.js';

const cases = [
  ['There is a streetlight not working near my house.', 'Streetlight'],
  ['thanni varala', 'Water supply'],
  ['The drinking water is muddy and smells bad.', 'Water quality'],
  ['Water is leaking from a roadside pipe.', 'Water leakage'],
  ['சாக்கடை அடைப்பு', 'Drainage'],
  ['There is an uncovered manhole with no cover.', 'Open manhole'],
  ['A deep pothole is on the road.', 'Pothole'],
  ['The road surface is cracked and damaged.', 'Road damage'],
  ['The street name board is missing.', 'Road signage'],
  ['Vehicles are parked on the footpath, blocking pedestrians.', 'Illegal parking'],
  ['The street has had no electricity since yesterday.', 'Power outage'],
  ['The traffic signal is not working at the junction.', 'Traffic signal'],
  ['The public toilet is dirty and needs cleaning.', 'Public toilet'],
  ['There are too many mosquitoes near stagnant water.', 'Mosquito nuisance'],
  ['There is a stray dog injured near the school.', 'Stray animals'],
  ['A fallen tree is blocking the road.', 'Fallen tree'],
  ['Construction debris is blocking the footpath.', 'Construction debris'],
  ['People are illegally dumping waste here.', 'Illegal dumping'],
  ['Smoke from burning waste is causing air pollution.', 'Air pollution'],
  ['The bus shelter roof is broken.', 'Public transport facility'],
  ['Loud construction noise continues late at night.', 'Noise nuisance'],
  ['The park equipment is broken and needs maintenance.', 'Park maintenance'],
  ['A public bench is broken.', 'Public infrastructure'],
  ['There is a broken footpath and pedestrians must walk on the road.', 'Footpath damage'],
  ['There is an exposed wire and it is dangerous.', 'Public safety']
];

for (const [phrase, expected] of cases) {
  test(`classifies ${expected}: ${phrase}`, () => {
    const result = classifyComplaint(phrase);
    assert.equal(result.category, expected);
    assert.equal(result.needsReview, false);
  });
}

test('classifies colloquial Tamil streetlight complaint with duration', () => {
  for (const phrase of [
    'எங்கள் தெருவில் லைட்டு 2 நாளாக எரிய மாட்டேருக்கு',
    'எங்கள் தெருவில் லைட்டு 2 நாளாக எரியவில்லை ஸ்ட்ரீட் லைட்'
  ]) {
    const result = classifyComplaint(phrase);
    assert.equal(result.category, 'Streetlight', `${phrase}: ${JSON.stringify(result)}`);
    assert.equal(result.needsReview, false);
  }
});

test('classifies the reported Hindi-script streetlight complaint', () => {
  const result = classifyComplaint('मेरी स्ट्रीट में स्ट्रीट लाइट काम नहीं करता है।');
  assert.equal(result.category, 'Streetlight');
  assert.equal(result.needsReview, false);
});

test('classifies common Hindi-script streetlight wording', () => {
  const result = classifyComplaint('मेरे इलाके में स्ट्रीट लाइट नहीं जल रही है।');
  assert.equal(result.category, 'Streetlight');
  assert.equal(result.needsReview, false);
});

test('classifies Hinglish streetlight wording', () => {
  const result = classifyComplaint('Mere area mein street light kaam nahi kar rahi hai.');
  assert.equal(result.category, 'Streetlight');
  assert.equal(result.needsReview, false);
});

test('classifies Kannada-script streetlight wording', () => {
  const result = classifyComplaint('ನಮ್ಮ ರಸ್ತೆಯ ಬೀದಿ ದೀಪ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ.');
  assert.equal(result.category, 'Streetlight');
  assert.equal(result.needsReview, false);
});

test('does not classify a streetlight that is reported as working normally in Hindi', () => {
  const result = classifyComplaint('स्ट्रीट लाइट ठीक है');
  assert.equal(result.category, '');
});

test('asks for clarification when an English flood/drain report is ambiguous', () => {
  const result = classifyComplaint('water is flooding because the drain is blocked');
  assert.equal(result.category, '');
  assert.equal(result.needsReview, true);
  assert.deepEqual(result.candidates.slice(0, 2).map(item => item.category), ['Stormwater flooding', 'Drainage']);
});

test('keeps flooding primary and drainage related in the explicit colloquial Tamil case', () => {
  const result = classifyComplaint('மழை வந்தா உடனே ரோடு ஃபுல்லாக தண்ணி நிக்குது ட்ரெயினும் அடச்சுக்குது');
  assert.equal(result.category, 'Stormwater flooding');
  assert.deepEqual(result.relatedCategories, ['Drainage']);
  assert.equal(result.needsReview, false);
});

test('does not classify a negated pothole mention as a pothole', () => {
  const result = classifyComplaint('not a pothole, the road is cracked');
  assert.equal(result.category, 'Road damage');
});

test('returns no category for unrelated text', () => {
  const result = classifyComplaint('I would like to ask about a movie recommendation.');
  assert.equal(result.category, '');
  assert.equal(result.confidence, 'none');
});


test('classifies colloquial Telugu-script and romanized drainage complaints', () => {
  for (const phrase of [
    'డ్రైనేజ్ ప్రాబ్లంగా ఉంది',
    'డ్రైనేజ్ ప్రాబ్లం',
    'డ్రైనేజీ సమస్య ఉంది',
    'ఎంగాల్తెరు 2 4 డ్రైనేజ్ ప్రాబ్లమా ఇ',
    'drainage problem ga undi'
  ]) {
    const result = classifyComplaint(phrase);
    assert.equal(result.category, 'Drainage', `${phrase}: ${JSON.stringify(result)}`);
    assert.equal(result.needsReview, false, `${phrase}: ${JSON.stringify(result)}`);
  }
});


test('classifies the Tamil drainage phrasing from the reported conversation', () => {
  const result = classifyComplaint('எங்கள் தெருவில் 2 நாளாக டிரைனேஜ் ப்ராப்ளமாக இருக்கு');
  assert.equal(result.category, 'Drainage', JSON.stringify(result));
  assert.equal(result.needsReview, false);
});
