import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_CASES } from '../demo-data.js';

const expectedNonStreetlightCategories = [
  'Water supply', 'Water leakage', 'Water quality', 'Drainage', 'Open manhole',
  'Stormwater flooding', 'Garbage', 'Pothole', 'Road damage', 'Road obstruction',
  'Road signage', 'Illegal parking', 'Footpath damage', 'Power outage',
  'Traffic signal', 'Public toilet', 'Mosquito nuisance', 'Stray animals',
  'Fallen tree', 'Construction debris', 'Illegal dumping', 'Air pollution',
  'Public transport facility', 'Public infrastructure', 'Noise nuisance',
  'Park maintenance', 'Public safety', 'Other'
];

test('curated demo records cover every category outside the streetlight cluster', () => {
  const categories = new Set(DEMO_CASES.map(row => row.category));
  for (const category of expectedNonStreetlightCategories) assert.ok(categories.has(category), `missing ${category}`);
});

test('demo records vary by issue, area, status, duration, and report date', () => {
  assert.ok(DEMO_CASES.length >= 30);
  assert.ok(new Set(DEMO_CASES.map(row => row.status)).size >= 4);
  assert.ok(new Set(DEMO_CASES.map(row => row.reportedDaysAgo)).size >= 10);
  assert.ok(new Set(DEMO_CASES.map(row => row.area)).size >= 6);
  assert.ok(new Set(DEMO_CASES.map(row => row.description)).size === DEMO_CASES.length);
  for (const row of DEMO_CASES) {
    assert.ok(Number.isInteger(row.durationDays) && row.durationDays > 0);
    assert.ok(Number.isInteger(row.reportedDaysAgo) && row.reportedDaysAgo >= 1);
    assert.ok(['Received', 'Awaiting review', 'In progress', 'Resolved'].includes(row.status));
  }
});

test('sample case text contains no resident names, contact details, or invented personal identifiers', () => {
  for (const row of DEMO_CASES) {
    assert.ok(!/\b\+?\d[\d\s()-]{7,}\b/.test(row.description), row.description);
    assert.ok(!/@/.test(row.description), row.description);
  }
});
