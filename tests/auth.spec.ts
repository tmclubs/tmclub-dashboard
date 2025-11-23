import { test, expect } from '@playwright/test';

test('docs and auth flows (DRF Token + JWT)', async ({ request }) => {
  const base = 'http://127.0.0.1:8000';

  // docs.json should be reachable
  const docs = await request.get(base + '/docs.json');
  expect([200]).toContain(docs.status());
  const docsJson = await docs.json();
  expect(docsJson?.info?.title).toBeTruthy();

  // prepare unique credentials
  const u = `tmc_e2e_${Date.now()}`;
  const email = `${u}@local.test`;
  const pass = 'P@ssw0rd123';

  // register
  const reg = await request.post(base + '/authentication/basic-register/', {
    data: { username: u, email, password: pass, first_name: 'E2E' },
  });
  expect([200, 201]).toContain(reg.status());

  // manual login (DRF Token)
  const login = await request.post(base + '/authentication/manual-login/', {
    data: { username: email, password: pass },
  });
  expect(login.status()).toBe(200);
  const loginJson = await login.json();
  const drfToken: string | undefined = loginJson?.data?.token;
  expect(typeof drfToken).toBe('string');

  // account/me with Token
  const meTok = await request.get(base + '/account/me/', {
    headers: { Authorization: `Token ${drfToken}` },
  });
  expect(meTok.status()).toBe(200);
  const meTokJson = await meTok.json();
  expect(meTokJson?.data?.email).toBe(email);

  // JWT obtain
  const jwtObtain = await request.post(base + '/authentication/jwt/token/', {
    data: { username: email, password: pass },
  });
  expect(jwtObtain.status()).toBe(200);
  const jwtJson = await jwtObtain.json();
  const access: string | undefined = jwtJson?.access;
  const refresh: string | undefined = jwtJson?.refresh;
  expect(typeof access).toBe('string');
  expect(typeof refresh).toBe('string');

  // account/me with Bearer
  const meJwt = await request.get(base + '/account/me/', {
    headers: { Authorization: `Bearer ${access}` },
  });
  expect(meJwt.status()).toBe(200);
  const meJwtJson = await meJwt.json();
  expect(meJwtJson?.data?.email).toBe(email);

  // JWT refresh
  const ref = await request.post(base + '/authentication/jwt/refresh/', {
    data: { refresh },
  });
  expect(ref.status()).toBe(200);
  const refJson = await ref.json();
  expect(typeof refJson?.access).toBe('string');
});
