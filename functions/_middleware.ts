// Cloudflare Pages Function. Adds the same privacy-preserving security headers as public/_headers.
// The app makes no network requests of its own: connect-src is limited to the site itself (for the offline cache).
type Context = { next: () => Promise<Response> };

const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";

export const onRequest = async ({ next }: Context): Promise<Response> => {
  const res = await next();
  const headers = new Headers(res.headers);
  headers.set('Content-Security-Policy', CSP);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
};
