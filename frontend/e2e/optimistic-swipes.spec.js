import { test, expect } from '@playwright/test';

const profiles = ['Alex', 'Blair', 'Casey', 'Dana'].map((name, index) => ({
  id: 'optimistic-' + index,
  name,
  age: 24,
  photoUrl: '/coy-wordmark.svg',
  bio: 'Coffee, books, and weekend walks.',
  location: 'Bengaluru',
  college: 'University',
  interests: ['Coffee', 'Books'],
}));

function deferred() {
  let resolve;
  const promise = new Promise((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

async function mockFeed(page, feed = profiles) {
  await page.route('**/api/feed', (route) => route.fulfill({ json: { profiles: feed } }));
  await page.route('**/api/matches', (route) => route.fulfill({ json: { matches: [] } }));
}

async function expectCard(page, name) {
  await expect(page.getByTestId('profile-card')).toHaveAttribute('aria-label', name + ', 24');
}

test('a valid drag exits without snapping back while its save is still pending', async ({
  page,
}) => {
  await mockFeed(page);
  const response = deferred();
  await page.route('**/api/swipe', async (route) => {
    await response.promise;
    await route.fulfill({ json: { matched: false, match: null } });
  });
  await page.goto('/');
  await expectCard(page, 'Alex');
  const box = await page.getByTestId('profile-card').boundingBox();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65 - 150, box.y + box.height * 0.4, { steps: 12 });
  await page.evaluate(() => {
    const card = document.querySelector('[data-testid="profile-card"]');
    window.swipePositions = [];
    function sample() {
      if (!card.isConnected) return;
      window.swipePositions.push(new DOMMatrix(getComputedStyle(card).transform).m41);
      requestAnimationFrame(sample);
    }
    sample();
  });
  await page.mouse.up();
  await expectCard(page, 'Blair');
  await expect(page.getByRole('button', { name: 'Pass on Blair' })).toBeEnabled();
  await expect(page.getByText('Saving 1 choice…', { exact: true })).toBeVisible();
  const positions = await page.evaluate(() => window.swipePositions);
  expect(positions.length).toBeGreaterThan(2);
  // After release, every frame continues left instead of returning to the origin.
  expect(Math.max(...positions)).toBeLessThanOrEqual(positions[0] + 4);
  expect(Math.min(...positions)).toBeLessThan(-300);
  response.resolve();
  await expect(page.getByText('Saving 1 choice…', { exact: true })).not.toBeVisible();
  await expectCard(page, 'Blair');
});

test('a failed save returns queued unsaved cards in order and can be retried', async ({ page }) => {
  await mockFeed(page);
  const response = deferred();
  const requests = [];
  await page.route('**/api/swipe', async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) {
      await response.promise;
      await route.fulfill({ status: 500, json: { error: 'Couldn’t save your choice.' } });
    } else await route.fulfill({ json: { matched: false, match: null } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Pass on Alex' }).click();
  await expectCard(page, 'Blair');
  await page.getByRole('button', { name: 'Like Blair', exact: true }).click();
  await expectCard(page, 'Casey');
  expect(requests).toHaveLength(1);
  response.resolve();
  await expect(
    page.getByRole('alert').filter({ hasText: '2 unsaved cards are back.' }),
  ).toBeVisible();
  await expectCard(page, 'Alex');
  await page.getByRole('button', { name: 'Retry pass' }).click();
  await expectCard(page, 'Blair');
  await expect(page.getByRole('alert').filter({ hasText: 'unsaved cards' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Pass on Blair' }).click();
  await expectCard(page, 'Casey');
  await expect.poll(() => requests.length).toBe(3);
  expect(requests.map((request) => request.profileId)).toEqual([
    profiles[0].id,
    profiles[0].id,
    profiles[1].id,
  ]);
});

test('optimistic likes do not expose matches before confirmation and keep confirmed dialogs in order', async ({
  page,
}) => {
  await mockFeed(page);
  const response = deferred();
  let calls = 0;
  await page.route('**/api/swipe', async (route) => {
    calls++;
    const { profileId } = route.request().postDataJSON();
    if (calls === 1) await response.promise;
    await route.fulfill({
      json: {
        matched: true,
        match: {
          ...profiles.find((profile) => profile.id === profileId),
          matchedAt: new Date().toISOString(),
        },
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Like Alex', exact: true }).click();
  await expectCard(page, 'Blair');
  await page.getByRole('button', { name: 'Like Blair', exact: true }).click();
  await expectCard(page, 'Casey');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Matches', exact: true })).toBeVisible();
  response.resolve();
  await expect(page.getByRole('dialog')).toContainText('You and Alex liked each other.');
  await page.getByRole('button', { name: 'Keep discovering' }).click();
  await expect(page.getByRole('dialog')).toContainText('You and Blair liked each other.');
  await page.getByRole('button', { name: 'See your matches' }).click();
  const matches = page.getByRole('region', { name: 'Mutual matches' });
  await expect(matches).toContainText('Alex');
  await expect(matches).toContainText('Blair');
});

test('the final card stays recoverable while saving, including across tab navigation', async ({
  page,
}) => {
  await mockFeed(page, [profiles[0]]);
  const response = deferred();
  await page.route('**/api/swipe', async (route) => {
    await response.promise;
    await route.fulfill({ status: 500, json: { error: 'Connection lost.' } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Pass on Alex' }).click();
  await expect(page.getByRole('heading', { name: 'Saving your last choice…' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'You’re all caught up.' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('main', { name: 'Home' })).toBeEmpty();
  response.resolve();
  await page.getByRole('button', { name: 'Discover', exact: true }).click();
  await expectCard(page, 'Alex');
  await expect(page.getByRole('button', { name: 'Retry pass' })).toBeEnabled();
});

test('an already-saved decision reconciles the feed instead of restoring that card', async ({
  page,
}) => {
  let savedElsewhere = false;
  await mockFeed(page);
  await page.route('**/api/feed', (route) =>
    route.fulfill({ json: { profiles: savedElsewhere ? profiles.slice(1) : profiles } }),
  );
  await page.route('**/api/swipe', (route) => {
    savedElsewhere = true;
    return route.fulfill({ status: 409, json: { error: 'Already saved.' } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Pass on Alex' }).click();
  await expectCard(page, 'Blair');
  await expect(page.getByRole('button', { name: 'Pass on Blair' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Pass on Alex' })).not.toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Your card is back.' })).not.toBeVisible();
});
