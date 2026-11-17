import { test, expect } from '@playwright/test';

test('mutual match, persistence, blank Home, and swipe privacy work together', async ({
  page,
  request,
}) => {
  // Desktop and mobile share the isolated fixture database.
  const initialFeed = (await (await request.get('http://127.0.0.1:4001/api/feed')).json()).profiles;
  expect(initialFeed.every((p) => !('likedYou' in p) && !('outgoingSwipes' in p))).toBeTruthy();
  await page.goto('/');
  await expect(page.getByTestId('profile-card')).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('discover.png'), fullPage: true });
  const first = initialFeed[0];
  const [swipeResponse] = await Promise.all([
    page.waitForResponse(
      (response) => response.url().endsWith('/api/swipe') && response.request().method() === 'POST',
    ),
    page.getByRole('button', { name: `Like ${first.name}`, exact: true }).click(),
  ]);
  if ((await swipeResponse.json()).matched) {
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'It’s a match!' })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath('match.png'), fullPage: true });
    await page.getByRole('button', { name: 'See your matches', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Mutual matches' })).toContainText(first.name);
    await page.screenshot({ path: test.info().outputPath('matches.png'), fullPage: true });
    await page.reload();
    await page.getByRole('button', { name: /Matches/ }).click();
    await expect(page.getByRole('region', { name: 'Mutual matches' })).toContainText(first.name);
    await page.getByRole('button', { name: 'Discover', exact: true }).click();
  }
  await expect(page.getByTestId('profile-card')).not.toHaveAttribute(
    'aria-label',
    `${first.name}, ${first.age}`,
  );
  const before = await page.getByTestId('profile-card').getAttribute('aria-label');
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().endsWith('/api/swipe') && response.request().method() === 'POST',
    ),
    page.getByRole('button', { name: /^Pass on / }).click(),
  ]);
  await expect(page.getByTestId('profile-card')).not.toHaveAttribute('aria-label', before);
  await page.reload();
  await expect(page.getByTestId('profile-card')).not.toHaveAttribute('aria-label', before);
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('main', { name: 'Home' })).toBeEmpty();
  await page.getByRole('button', { name: 'Discover', exact: true }).click();
  await expect(page.getByTestId('profile-card')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});

test('empty states and load errors are distinct and can recover', async ({ page }) => {
  await page.route('**/api/feed', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Could not load. Please retry.' }),
    }),
  );
  await page.route('**/api/matches', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ matches: [] }) }),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Couldn’t load profiles.' })).toBeVisible();
  await page.route('**/api/feed', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ profiles: [] }) }),
  );
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'You’re all caught up.' })).toBeVisible();
  await page.getByRole('button', { name: 'See your matches' }).click();
  await expect(page.getByRole('heading', { name: 'No matches yet.' })).toBeVisible();
});

test('dragging a card saves a pass; server failures keep the card available', async ({ page }) => {
  await page.goto('/');
  const card = page.getByTestId('profile-card');
  await expect(card).toBeVisible();
  const previous = await card.getAttribute('aria-label');
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65 - 150, box.y + box.height * 0.4, { steps: 12 });
  await page.mouse.up();
  await expect(card).not.toHaveAttribute('aria-label', previous);
  const current = await card.getAttribute('aria-label');
  await page.route('**/api/swipe', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Please try again.' }),
    }),
  );
  await page.getByRole('button', { name: /^Pass on / }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Your card is back.' })).toBeVisible();
  await expect(card).toHaveAttribute('aria-label', current);
});
