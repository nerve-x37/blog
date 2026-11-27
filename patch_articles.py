#!/usr/bin/env python3
"""Valexirion yazı sayfalarını toplu günceller (tekrar çalıştırılabilir).
Kullanım: proje klasöründe  ->  python patch_articles.py
Yaptıkları:
  1) consent.js'i ekler (yoksa banner/reklam çalışmaz); yasal sayfalarda ve ana sayfada da garanti eder
  2) Kaynak linklerinde rel="nofollow noopener" -> rel="noopener noreferrer"
  3) Alt bilgideki yasal bağlantıları günceller (Hakkında, İletişim, Gizlilik, Çerez, Koşullar)
Değişen dosyaların .bak yedeğini alır."""
import glob, os, shutil

SKIP = {'index.html','404.html','gizlilik-politikasi.html','cerez-politikasi.html',
        'kullanim-kosullari.html','hakkinda.html','iletisim.html'}
LEGAL = '''<span class="footer-legal">
        <a href="hakkinda.html" class="footer-link">Hakkında</a>
        <a href="iletisim.html" class="footer-link">İletişim</a>
        <a href="gizlilik-politikasi.html" class="footer-link">Gizlilik Politikası</a>
        <a href="cerez-politikasi.html" class="footer-link">Çerez Politikası</a>
        <a href="kullanim-kosullari.html" class="footer-link">Kullanım Koşulları</a>
      </span>'''
OLD_BOTTOM = '<a href="gizlilik-politikasi.html" class="footer-link">Gizlilik Politikas&#305;</a>'
KURUMSAL_OLD = '<li><a href="gizlilik-politikasi.html" class="footer-link">Gizlilik Politikası</a></li>'
KURUMSAL_NEW = (KURUMSAL_OLD +
  '\n              <li><a href="cerez-politikasi.html" class="footer-link">Çerez Politikası</a></li>'
  '\n              <li><a href="kullanim-kosullari.html" class="footer-link">Kullanım Koşulları</a></li>')

def ensure_consent(s):
    """Her sayfada consent.js olsun (onay banner'ı + 'Çerez Tercihleri' bağlantısı)."""
    if 'consent.js' in s:
        return s
    if '<script src="script.js"></script>' in s:
        return s.replace('<script src="script.js"></script>',
                         '<script src="script.js"></script>\n  <script src="consent.js"></script>')
    if '</body>' in s:
        return s.replace('</body>', '  <script src="consent.js"></script>\n</body>')
    return s

changed = 0
for f in sorted(glob.glob('*.html')):
    s = open(f, encoding='utf-8').read()
    o = s
    if f in SKIP:                       # yasal sayfalar / ana sayfa: yalnızca consent.js garantisi
        s = ensure_consent(s)
    else:
        s = ensure_consent(s)
        s = s.replace('rel="nofollow noopener"', 'rel="noopener noreferrer"')
        s = s.replace('href="hakkimizda.html"', 'href="hakkinda.html"')
        if 'cerez-politikasi.html' not in s:
            s = s.replace(KURUMSAL_OLD, KURUMSAL_NEW)
        if 'footer-legal' not in s:
            s = s.replace(OLD_BOTTOM, LEGAL)
    if s != o:
        shutil.copy(f, f + '.bak')
        open(f, 'w', encoding='utf-8').write(s)
        changed += 1
        print('güncellendi:', f)
print(changed, 'dosya güncellendi.')
