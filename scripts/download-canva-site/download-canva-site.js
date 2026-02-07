#!/usr/bin/env node
/**
 * Baixa o conteúdo do site atual (Canva) do Saldão de Móveis Jerusalém:
 * - HTML da página
 * - Todas as imagens (com Puppeteer + Chrome do sistema, ou só HTML via fetch)
 *
 * Uso: node download-canva-site.js
 * Saída: ../../site/downloaded/
 *
 * Requer Chrome instalado no sistema para baixar as imagens (Canva carrega tudo por JS).
 * Se não tiver Puppeteer-core ou Chrome, baixa só o HTML.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://paramim.my.canva.site/sald-o-de-m-veis';
const OUT_DIR = join(__dirname, '../../site/downloaded');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg)(\?|$)/i;
const IS_IMAGE_URL = (url) =>
  url &&
  !url.startsWith('data:') &&
  (IMAGE_EXT.test(url) || /canva\.com|cdn.*\.(com|net).*\.(jpg|jpeg|png|webp|gif)/i.test(url));

function safeFilename(url, index) {
  const m = url.match(/\.(jpe?g|png|gif|webp|svg)/i);
  const ext = (m && m[1]) || 'jpg';
  return `image-${String(index).padStart(2, '0')}.${ext.toLowerCase().replace('jpeg', 'jpg')}`;
}

function getChromePath() {
  const paths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    process.platform === 'win32' &&
      join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  for (const p of paths) {
    if (p && existsSync(p)) return p;
  }
  return null;
}

async function downloadWithPuppeteer() {
  const puppeteer = await import('puppeteer-core').catch(() => null);
  const executablePath = getChromePath();
  if (!puppeteer || !executablePath) return null;

  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ width: 1280, height: 800 });

    const networkUrls = new Set();
    await page.setRequestInterception(true);
    page.on('request', (r) => r.continue());
    page.on('response', (res) => {
      const u = res.url();
      if (IS_IMAGE_URL(u)) networkUrls.add(u);
    });

    await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.setRequestInterception(false);
    await new Promise((r) => setTimeout(r, 2000));

    const baseUrl = page.url().replace(/\?.*$/, '').replace(/\/?$/, '/');
    const domUrls = await page.evaluate((base) => {
      const seen = new Set();
      const add = (href) => {
        if (!href || href.startsWith('data:')) return;
        try {
          const u = new URL(href, base).href;
          if (u.startsWith('http') && !seen.has(u)) seen.add(u);
        } catch (_) {}
      };
      document.querySelectorAll('img').forEach((el) => {
        add(el.src);
        add(el.getAttribute('data-src'));
        add(el.getAttribute('data-lazy-src'));
      });
      document.querySelectorAll('[style*="background"]').forEach((el) => {
        const m = (el.getAttribute('style') || '').match(/url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/);
        if (m) add(m[1]);
      });
      return [...seen];
    }, baseUrl);

    const html = await page.content();
    const allUrls = [...new Set([...domUrls, ...networkUrls])].filter(IS_IMAGE_URL);
    return { html, imageUrls: allUrls };
  } finally {
    await browser.close();
  }
}

function extractImageUrlsFromHtml(html, baseUrl) {
  const seen = new Set();
  const add = (href) => {
    if (!href || href.startsWith('data:')) return;
    try {
      const u = new URL(href, baseUrl).href;
      if (u.startsWith('http') && IS_IMAGE_URL(u)) seen.add(u);
    } catch (_) {}
  };
  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = imgRe.exec(html))) add(m[1]);
  const urlRe = /url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi;
  while ((m = urlRe.exec(html))) add(m[1]);
  const httpRe = /https?:\/\/[^\s"'<>]+\.(jpe?g|png|gif|webp|svg)(\?[^"'\s]*)?/gi;
  while ((m = httpRe.exec(html))) add(m[0]);
  return [...seen];
}

async function downloadToFile(url, filepath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  writeFileSync(filepath, Buffer.from(buf));
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  let html;
  let imageUrls = [];

  const puppeteerResult = await downloadWithPuppeteer();
  if (puppeteerResult) {
    console.log('Página carregada com Chrome (Puppeteer).');
    html = puppeteerResult.html;
    imageUrls = puppeteerResult.imageUrls;
  } else {
    console.log('Chrome não encontrado ou puppeteer-core não instalado. Baixando só o HTML (sem imagens).');
    const res = await fetch(SITE_URL, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    if (!res.ok) throw new Error(`Falha ao carregar: HTTP ${res.status}`);
    html = await res.text();
    const baseUrl = res.url.replace(/\?.*$/, '').replace(/\/?$/, '/');
    imageUrls = extractImageUrlsFromHtml(html, baseUrl);
  }

  writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf8');
  console.log('Salvo: index.html');
  console.log('Encontradas', imageUrls.length, 'imagens.');

  const manifest = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const filename = safeFilename(url, i + 1);
    const filepath = join(OUT_DIR, filename);
    try {
      await downloadToFile(url, filepath);
      manifest.push({ url, filename });
      console.log('  Baixado:', filename);
    } catch (err) {
      console.warn('  Falha:', filename, err.message);
    }
  }

  writeFileSync(
    join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ siteUrl: SITE_URL, images: manifest }, null, 2),
    'utf8'
  );
  console.log('Total:', manifest.length, 'imagens em', OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
