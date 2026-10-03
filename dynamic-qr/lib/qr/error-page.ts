import { NextResponse } from 'next/server';

/** Branded HTML for the public redirect route (it has no React layout). */
export function renderRedirectErrorPage(status: 404 | 500 | 503, title: string, message: string) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} · Dynamic QR</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#0b0d12;color:#e8eaf0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  main{max-width:420px;text-align:center}
  .badge{display:inline-grid;place-items:center;width:56px;height:56px;border-radius:16px;background:#5b50e6;color:#fff;font-weight:700;font-size:20px;margin-bottom:20px}
  h1{margin:0 0 8px;font-size:28px;letter-spacing:-0.02em}
  p{margin:0 0 24px;color:#9aa3b5;line-height:1.55}
  a{display:inline-block;padding:10px 18px;border-radius:10px;background:#1a1e29;color:#e8eaf0;text-decoration:none;border:1px solid #272c3a}
  a:focus-visible{outline:2px solid #8b83ff;outline-offset:2px}
</style>
</head>
<body>
<main>
  <div class="badge" aria-hidden="true">QR</div>
  <h1>${title}</h1>
  <p>${message}</p>
  <a href="/">Go to Dynamic QR</a>
</main>
</body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
