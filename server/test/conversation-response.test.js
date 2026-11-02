import test from 'node:test';
import assert from 'node:assert/strict';
import { conversationalIssueResponse } from '../conversation-response.js';
import { classifyComplaint } from '../classification.js';

test('asks for a location after recognizing an English issue', () => {
  const response = conversationalIssueResponse('en-IN', { category: 'Streetlight', relatedCategories: [] }, 'location');
  assert.match(response, /streetlight/i);
  assert.match(response, /street|neighbourhood|where/i);
});

test('provides Tamil response for a recognized issue', () => {
  const response = conversationalIssueResponse('ta-IN', { category: 'Streetlight', relatedCategories: [] }, 'location');
  assert.match(response, /தெரு|பகுதி/);
});

test('Hindi streetlight complaint advances to the location question instead of repeating the issue prompt', () => {
  const classification = classifyComplaint('मेरी स्ट्रीट में स्ट्रीट लाइट काम नहीं करता है।');
  assert.equal(classification.category, 'Streetlight');
  const response = conversationalIssueResponse('hi-IN', classification, 'location');
  assert.match(response, /स्ट्रीट लाइट/);
  assert.match(response, /सड़क या इलाके/);
});

test('returns Kannada streetlight guidance in Kannada script', () => {
  const response = conversationalIssueResponse('kn-IN', { category: 'Streetlight', relatedCategories: [] }, 'location');
  assert.match(response, /ರಸ್ತೆ ದೀಪ/);
  assert.match(response, /ಯಾವ ರಸ್ತೆ ಅಥವಾ ಪ್ರದೇಶ/);
});

test('keeps Hinglish streetlight guidance in romanized Hinglish', () => {
  const response = conversationalIssueResponse('hi-Latn', { category: 'Streetlight', relatedCategories: [] }, 'location');
  assert.match(response, /Theek hai/);
  assert.match(response, /street ya area/);
  assert.doesNotMatch(response, /[\u0900-\u097F]/);
});

test('keeps Tanglish location guidance in Latin script', () => {
  const response = conversationalIssueResponse('ta-Latn', { category: 'Streetlight', relatedCategories: [] }, 'location');
  assert.match(response, /Seri/);
  assert.match(response, /street illa area/);
  assert.doesNotMatch(response, /[\u0B80-\u0BFF]/);
});

test('keeps Telugish location guidance in Latin script', () => {
  const response = conversationalIssueResponse('te-Latn', { category: 'Streetlight', relatedCategories: [] }, 'location');
  assert.match(response, /Sare/);
  assert.match(response, /street leda area/);
  assert.doesNotMatch(response, /[\u0C00-\u0C7F]/);
});


test('acknowledges Tamil drainage and asks for a street or landmark rather than repeating the issue prompt', () => {
  const response = conversationalIssueResponse('ta-IN', { category: 'Drainage', relatedCategories: [] }, 'location', { description: 'எங்கள் தெருவில் 2 நாளாக டிரைனேஜ் ப்ராப்ளமாக இருக்கு' });
  assert.match(response, /வடிகால் பிரச்சினை/);
  assert.match(response, /தெருப் பெயர்|பகுதி/);
  assert.match(response, /வரைபடத்தில்/);
  assert.doesNotMatch(response, /என்ன பிரச்சினை ஏற்பட்டுள்ளது/);
});

test('acknowledges Telugu drainage and asks for an address and map confirmation', () => {
  const response = conversationalIssueResponse('te-IN', { category: 'Drainage', relatedCategories: [] }, 'location', { description: 'డ్రైనేజ్ ప్రాబ్లంగా ఉంది' });
  assert.match(response, /డ్రైనేజ్ సమస్య/);
  assert.match(response, /వీధి పేరు|ప్రాంతం/);
  assert.match(response, /మ్యాప్‌లో/);
});
