#!/usr/bin/env python3
"""Valexirion yasal/teknik tutarlılık denetimi (yalnızca raporlar, dosya değiştirmez).
Kullanım: proje klasöründe  ->  python check_legal.py
Her .html için: consent.js var mı, 'Çerez Tercihleri' için footer noktası var mı, izin verilenler
dışında dış kaynak (script/link/img/iframe/form), reklam/analitik/embed/form, DOLDUR kalıntısı,
eski hakkimizda.html bağlantısı, eski rel="nofollow noopener" var mı."""
import glob, re

ALLOWED_HOSTS = {'fonts.googleapis.com', 'fonts.gstatic.com', 'valexirion.com'}
THIRD_PARTY_SIGNS = ['adsbygoogle', 'googlesyndication', 'googletagmanager', 'google-analytics',
                     'gtag(', 'doubleclick', 'facebook.net', 'connect.facebook', 'youtube.com/embed',
                     'youtube-nocookie', 'player.vimeo', 'disqus', 'addthis', 'sharethis',
                     'hotjar', 'clarity.ms', 'yandex', 'cdn.jsdelivr', 'unpkg.com', 'cdnjs.cloudflare',
                     'code.jquery', 'maps.google', 'recaptcha']
problems = 0
for f in sorted(glob.glob('*.html')):
    s = open(f, encoding='utf-8').read()
    out = []
    if 'consent.js' not in s:
        out.append('consent.js YOK -> onay banner\'ı çıkmaz')
    if 'class="footer-bottom"' not in s:
        out.append('footer-bottom YOK -> "Çerez Tercihleri" bağlantısı eklenemez')
    elif 'footer-legal' not in s:
        out.append('footer-legal YOK (yasal bağlantılar eksik)')
    for tag, attr in (('script', 'src'), ('link', 'href'), ('img', 'src'), ('iframe', 'src'),
                      ('source', 'src'), ('form', 'action')):
        for m in re.finditer(r'<%s\b[^>]*\b%s="(https?://[^"]+)"' % (tag, attr), s, re.I):
            host = re.sub(r'^https?://', '', m.group(1)).split('/')[0].lower()
            if tag == 'link' and 'canonical' in m.group(0):
                continue
            if host not in ALLOWED_HOSTS:
                out.append('dış kaynak <%s>: %s' % (tag, m.group(1)[:90]))
    low = s.lower()
    # 3. taraf izi: yalnızca <script> etiketlerinde ve src/action değerlerinde ara (politika metinlerindeki
    # "DoubleClick" gibi sözcükler yanlış alarm vermesin)
    scan = ' '.join(re.findall(r'<script\b.*?</script>', low, re.S) +
                    re.findall(r'(?:src|action|data-src)="[^"]*"', low))
    scan = scan.replace('src="consent.js"', '').replace('src="script.js"', '')
    for sign in THIRD_PARTY_SIGNS:
        if sign in scan:
            out.append('3. taraf izi: ' + sign)
    if re.search(r'<form\b', low): out.append('<form> var (kişisel veri toplayabilir)')
    if re.search(r'<(input|textarea)\b', low) and 'search-input' not in low:
        out.append('input/textarea var')
    if 'DOLDUR' in s: out.append('DOLDUR kalıntısı: %d yer' % s.count('DOLDUR'))
    if 'hakkimizda.html' in s: out.append('eski bağlantı: hakkimizda.html')
    if 'rel="nofollow noopener"' in s: out.append('eski rel="nofollow noopener"')
    if 'target="_blank"' in s and re.search(r'target="_blank"(?![^>]*rel="[^"]*noopener)', s):
        out.append('target=_blank rel=noopener olmadan')
    print(('SORUN ' if out else 'TEMİZ ') + f)
    for o in out:
        print('   -', o); problems += 1
print('\nToplam bulgu:', problems)
