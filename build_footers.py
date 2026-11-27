#!/usr/bin/env python3
"""Valexirion: yazı sayfalarındaki kategori footer listelerini data.json'dan üretir.
Kullanım (proje klasöründe):
  python build_footers.py          -> değişen sayfaları günceller (.bak yedeği alır)
  python build_footers.py --check  -> yalnızca hangi sayfaların güncel olmadığını listeler
Yeni yazı eklemek için yalnızca data.json -> articles[] güncelle, sonra bu betiği çalıştır.
Betik tekrar çalıştırılabilir (idempotent). Yalnızca <details class="footer-category"> içeren
sayfalara dokunur; summary başlığı kategori adıyla eşleşen listeleri yeniden yazar."""
import glob, json, re, shutil, sys

CATS = [('bilim', 'Bilim'), ('tarih', 'Tarih'), ('sinema', 'Sinema'), ('muzik', 'Müzik'),
        ('felsefe', 'Felsefe'), ('belgesel', 'Belgesel'), ('doga', 'Doğa'), ('teknoloji', 'Teknoloji')]

def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

data = json.load(open('data.json', encoding='utf-8'))
items = {}
for key, label in CATS:
    rows = ['<li><a href="index.html#%s" class="footer-cat-link">Tüm %s yazıları</a></li>' % (key, label)]
    for a in data.get('articles', []):
        if a.get('category') == key and a.get('href') and a.get('title'):
            rows.append('<li><a href="%s" class="footer-link">%s</a></li>' % (a['href'], esc(a['title'])))
    items[label] = rows

BLOCK = re.compile(
    r'(<details class="footer-category">\s*<summary class="footer-heading">(?P<label>[^<]+)</summary>\s*'
    r'<ul class="footer-category-links">)(?P<lead>\s*)(?P<body>.*?)(?P<tail>\s*)(</ul>)', re.S)

def rebuild(m):
    label = m.group('label').strip()
    if label not in items:                      # Kurumsal vb. -> dokunma
        return m.group(0)
    return m.group(1) + m.group('lead') + '\n'.join(items[label]) + m.group('tail') + m.group(6)

check = '--check' in sys.argv
changed = 0
for f in sorted(glob.glob('*.html')):
    s = open(f, encoding='utf-8').read()
    if 'class="footer-category"' not in s:
        continue
    n = BLOCK.sub(rebuild, s)
    if n != s:
        changed += 1
        if check:
            print('güncel değil:', f)
        else:
            shutil.copy(f, f + '.bak')
            open(f, 'w', encoding='utf-8').write(n)
            print('güncellendi:', f)
print(changed, 'sayfa', 'güncel değil.' if check else 'güncellendi.')
