from pathlib import Path
import textwrap

from PIL import Image, ImageDraw, ImageFont, ImageFilter


OUT = Path(__file__).resolve().parent / "instagram-2026-bilim-kesifleri"
W, H = 1080, 1350
NAVY = (10, 18, 39)
NAVY_2 = (18, 33, 67)
WHITE = (248, 247, 243)
SAND = (225, 177, 126)
MUTED = (174, 187, 210)
LINE = (96, 112, 150)


def font(path, size):
    return ImageFont.truetype(path, size)


TITLE = r"C:\Windows\Fonts\segoeui.ttf"
TITLE_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
SERIF = r"C:\Windows\Fonts\georgia.ttf"
SERIF_BOLD = r"C:\Windows\Fonts\georgiab.ttf"


def crop_cover(im, top_h=430):
    ratio = W / top_h
    iw, ih = im.size
    scale = max(W / iw, top_h / ih)
    resized = im.resize((int(iw * scale), int(ih * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - W) // 2
    top = (resized.height - top_h) // 2
    return resized.crop((left, top, left + W, top + top_h))


def wrap(draw, text, fnt, width):
    words = text.split()
    lines, line = [], ""
    for word in words:
        test = f"{line} {word}".strip()
        if draw.textlength(test, font=fnt) <= width:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_wrapped(draw, text, xy, fnt, fill, spacing=10, width=920):
    x, y = xy
    lines = wrap(draw, text, fnt, width)
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + spacing
    return y


def base_slide(photo_name, index, total, category=None):
    photo = Image.open(OUT / photo_name).convert("RGB")
    top = crop_cover(photo)

    canvas = Image.new("RGB", (W, H), NAVY)
    canvas.paste(top, (0, 0))
    draw = ImageDraw.Draw(canvas)

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle((0, 0, W, H), fill=(NAVY[0], NAVY[1], NAVY[2], 105))
    od.rectangle((0, 390, W, H), fill=(NAVY[0], NAVY[1], NAVY[2], 245))
    od.rectangle((0, 410, W, H), fill=(10, 18, 39, 245))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(canvas)

    draw.text((52, 46), "VALEXIRION", font=font(TITLE_BOLD, 25), fill=WHITE)
    count = f"{index:02d} / {total:02d}"
    box = draw.textbbox((0, 0), count, font=font(TITLE_BOLD, 21))
    draw.text((W - 52 - (box[2] - box[0]), 50), count, font=font(TITLE_BOLD, 21), fill=WHITE)

    if category:
        draw.text((52, 474), category.upper(), font=font(TITLE_BOLD, 21), fill=SAND)
    draw.line((52, 1289, W - 52, 1289), fill=LINE, width=2)
    draw.text((52, 1308), "MERAK ET. SORGULA. KEŞFET.", font=font(TITLE_BOLD, 17), fill=MUTED)
    return canvas, draw


def title(draw, text, y=535, size=68):
    fnt = font(SERIF_BOLD, size)
    lines = wrap(draw, text, fnt, 940)
    for line in lines:
        draw.text((52, y), line, font=fnt, fill=WHITE)
        y += size + 8
    return y


def body(draw, text, y, size=34):
    fnt = font(TITLE, size)
    return draw_wrapped(draw, text, (52, y), fnt, MUTED, spacing=12, width=960)


def callout(draw, label, text, y, color=SAND):
    draw.rounded_rectangle((52, y, 1028, y + 148), radius=14, fill=(27, 44, 82), outline=(123, 137, 174), width=2)
    draw.rectangle((52, y, 66, y + 148), fill=color)
    draw.text((82, y + 18), label.upper(), font=font(TITLE_BOLD, 18), fill=SAND)
    draw_wrapped(draw, text, (82, y + 54), font(TITLE_BOLD, 28), WHITE, spacing=6, width=910)


slides = []

# 1 — Cover
canvas, draw = base_slide("hero.jpg", 1, 8)
draw.rectangle((52, 614, 1028, 920), fill=(12, 25, 56), outline=(86, 103, 145), width=2)
draw.text((82, 650), "BİLİMİN YENİ SINIRI", font=font(TITLE_BOLD, 24), fill=WHITE)
draw.text((82, 702), "2026'NIN", font=font(SERIF_BOLD, 78), fill=SAND)
draw.text((82, 798), "ÇIĞIR AÇAN", font=font(SERIF_BOLD, 78), fill=SAND)
draw.text((82, 894), "KEŞİFLERİ", font=font(SERIF_BOLD, 78), fill=WHITE)
draw.text((52, 1008), "Genetikten uzaya: insanlığın gelecek gündemi", font=font(TITLE, 34), fill=MUTED)
slides.append(("01-2026-bilim-kesifleri", canvas))

# 2 — Overview
canvas, draw = base_slide("scientist.jpg", 2, 8, "2026'DA İNSANLIK")
y = title(draw, "Bilim, sınırları yeniden çiziyor.", 535, 62)
body(draw, "2026'nın öne çıkan araştırmaları farklı alanlarda ilerliyor: yaşamın tasarımı, temiz enerji, evrenin görünmeyen maddesi, nöroteknoloji ve okyanusların derinlikleri.", y + 30)
callout(draw, "BÜYÜK TABLO", "Teknoloji değil, bilimdeki disiplinler arası dönüşüm hızlanıyor.", 1060)
slides.append(("02-bilim-gundemi", canvas))

# 3 — Synthetic life
canvas, draw = base_slide("gen.jpg", 3, 8, "1 / SENTETİK BİYOLOJİ")
y = title(draw, "Yapay zekâyla kodlanan yaşam", 535, 58)
body(draw, "Yapay zekâ modelleri canlı hücrelerin genomunu tasarlayabiliyor. Laboratuvarlarda sentetik bakteri üretildi; hedef, kişiselleştirilmiş tedavi ve yeni biyoyakıt yolları.", y + 28)
callout(draw, "DİKKAT", "Gelişim potansiyel getirse de gen düzenlemenin etik sınırları tartışılmayı sürdürüyor.", 1060)
slides.append(("03-yapay-zeka-ve-gen", canvas))

# 4 — Fusion
canvas, draw = base_slide("fusion.jpg", 4, 8, "2 / NÜKLEER FÜZYON")
y = title(draw, "90 dakikalık net enerji mesajı", 535, 58)
body(draw, "Bilim gündeminde öne çıkan bir özel şirket denemesi, net enerji kazancını 90 dakika sürdürdü. Bu süre, füzyon reaktörünün şebekeye elektrik vermesi için tartışılan eşikten daha yüksek.", y + 28)
callout(draw, "NEDEN ÖNEMLİ?", "Temiz ve yoğun enerji; ticari ölçeğe geçiş 2030'ların başında gündemde.", 1060)
slides.append(("04-nukleer-fuzyon", canvas))

# 5 — Dark matter
canvas, draw = base_slide("dark.jpg", 5, 8, "3 / KARANLIK MADDE")
y = title(draw, "Görünmez maddeye doğrudan sinyal", 535, 58)
body(draw, "İsviçre'deki derin bir dedektörde beklenmedik bir sinyal kaydedildi. Evrendeki kütlenin yaklaşık %85'ini oluşturduğu düşünülen karanlık madde için güçlü bir işaret olarak değerlendiriliyor.", y + 28)
callout(draw, "BİLİMSEL NOT", "Sonucun yeniden deneylerle doğrulanması; fiziğin yönünü değiştirebilir.", 1060)
slides.append(("05-karanlik-madde", canvas))

# 6 — Brain computer
canvas, draw = base_slide("brain.jpg", 6, 8, "4 / BEYİN–BİLGİSAYAR ARAYÜZÜ")
y = title(draw, "Düşünce dakikada 80 kelimeye dönüştü", 535, 58)
body(draw, "Bir beyin-bilgisayar arayüzünde motor korteks sinyalleri minik bir çiple okunuyor. Yapay zekâ sinyalleri gerçek zamanlı çözerek metne dönüştürüyor.", y + 28)
callout(draw, "OLASI ETKİ", "Felç, omurilik hasarı veya ALS yaşayan milyonlar için yeni bir iletişim yolu.", 1060)
slides.append(("06-beyin-bilgisayar", canvas))

# 7 — Ocean
canvas, draw = base_slide("ocean.jpg", 7, 8, "5 / OKYANUSLAR")
y = title(draw, "8 bin metrede gizli yaşam", 535, 58)
body(draw, "Pasifik Okyanusu'nun derinliklerinde daha önce görülmemiş canlı türlerinden oluşan bir ekosistem bulundu. Hidrotermal bacaların çevresindeki canlılar aşırı basınca dayanıklı kabuklar geliştirmiş.", y + 28)
callout(draw, "DAHA GENİŞ SORU", "Bu kimyasal süreçler, uzayda yaşam arayışına da ışık tutabilir.", 1060)
slides.append(("07-okyanus-ekosistemi", canvas))

# 8 — Closing
canvas, draw = base_slide("scientist.jpg", 8, 8, "KAPANIŞ")
y = title(draw, "Büyük keşifler, büyük sorumluluklar.", 535, 60)
body(draw, "2026'nın ortak gündemi; bilimin gücüyle etik sınırlar arasındaki denge. Her atılım, geride daha iyi sorular bırakıyor.", y + 28)
callout(draw, "KENDİNE NOT", "Bilimsel haberi okurken kaynakları, deneylerin tekrarını ve belirsizlikleri de kontrol et.", 1060)
draw.text((52, 1235), "Kaynak: gercek24.com.tr", font=font(TITLE, 19), fill=MUTED)
slides.append(("08-buyuk-resim", canvas))

for name, image in slides:
    image.save(OUT / f"{name}.png", optimize=True)

caption = """2026, bilimin sınırlarını farklı alanlarda yeniden çiziyor.

Bu kurguda öne çıkanlar:
• Sentetik biyoloji ve yapay zekâ
• Nükleer füzyonda net enerji
• Karanlık madde sinyali
• Beyin–bilgisayar arayüzleri
• Okyanusların derinliklerinde yeni yaşam

Teknoloji yalnızca kapasite değil, etik ve sorumluluk meselesi de taşıyor.

Bilimsel haberleri paylaşırken deneylerin tekrarını, kaynakları ve belirsizlikleri kontrol etmek en doğru yaklaşım.

Kaynak: https://gercek24.com.tr/2026-kesifleri-bilim-dunyasinda/

#2026 #bilim #bilimvegelecek #nöroteknoloji #sentetikbiyoloji #nükleerfüzyon #karanlıkmadde #okyanus #valexirion
"""

(OUT / "paylasim-aciklamasi.txt").write_text(caption, encoding="utf-8")
print(f"{len(slides)} kare oluşturuldu: {OUT}")
