from pathlib import Path
import math
import zipfile

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "instagram-deep-earth-carousel"
W, H = 1080, 1350
ART_H = 555
BG = (15, 23, 35)
PANEL = (25, 36, 51)
CREAM = (246, 241, 230)
MUTED = (184, 194, 205)
ACCENT = (233, 169, 112)
FONT_DIR = Path(r"C:\Windows\Fonts")
SERIF = str(FONT_DIR / "georgiab.ttf")
SANS = str(FONT_DIR / "segoeui.ttf")
SANS_BOLD = str(FONT_DIR / "segoeuib.ttf")

SLIDES = [
    {
        "kind": "cover",
        "title": "Ayağınızın 2.900 km altında",
        "big": "6 GİZEMLİ BÖLGE",
        "body": "Bilim insanları, deprem dalgalarının izini sürerek Dünya'nın derinliklerinde yeni ipuçları buldu.",
        "takeaway": "Peki bu sinyaller, gezegenimizin içi hakkında ne anlatıyor?",
    },
    {
        "title": "Manto ile dış çekirdeğin buluştuğu sınır",
        "body": "Yaklaşık 2.900 kilometre derinlikte, katı manto ile sıvı dış çekirdek karşı karşıya geliyor. Bu uzak sınır doğrudan gözlemlenemiyor.",
        "takeaway": "Bilim insanları burayı, içinden geçen dalgaları ölçerek inceliyor.",
    },
    {
        "title": "Depremler yeraltının sinyalini taşıyor",
        "body": "Büyük depremlerden yayılan sismik dalgalar, farklı kaya ve malzemelerden geçerken hız ve yön değiştiriyor. İstasyonlar bu titreşimleri kaydediyor.",
        "takeaway": "Kayıtları karşılaştırmak, derinlikler için bir harita çıkarıyor.",
    },
    {
        "title": "Asıl ipucu, çok zayıf bir sinyaldi",
        "body": "Araştırmacılar, ana dalgadan önce ulaşabilen zayıf “PKP öncüllerini” aradı. Bu sinyaller, derindeki küçük farklılıklarda saçılabiliyor.",
        "takeaway": "Sinyaldeki küçük sapmalar, görünmeyen malzemeler hakkında ipucu verebilir.",
    },
    {
        "title": "Yapay zekâ milyonlarca kaydı taradı",
        "body": "Model, 2 milyondan fazla sismik kaydı inceleyerek 174.929 yüksek kaliteli PKP öncül sinyali belirledi.",
        "takeaway": "Bu, önceki çalışmalardaki sinyal sayısının yaklaşık 10 katı.",
    },
    {
        "title": "Haritada altı farklı bölge belirdi",
        "body": "Sinyaller, manto ile dış çekirdeğin sınırında çevresinden farklı davranan altı olası saçılma bölgesine işaret etti.",
        "takeaway": "Bunlar bina ya da kesin sınırları çizilmiş cisimler değil; verilerden çıkarılan farklılıklardır.",
    },
    {
        "title": "Neyden oluşuyor olabilirler?",
        "body": "Olasılıklardan biri, çok eski dönemlerde derinlere taşınmış malzemeler. Bir diğeri, Ay'ı oluşturan dev çarpışmadan kalmış izler.",
        "takeaway": "Bunlar araştırma hipotezleri; bölgelerin kesin bileşimi henüz bilinmiyor.",
    },
    {
        "kind": "closing",
        "title": "Dünya'nın içini, dalgaların izinden okuyoruz",
        "body": "Altı bölge, doğrudan görülmüş yapılar değil; sismik ölçümlerden çıkarılan olası heterojenlikler. Yeni veriler bu haritayı geliştirebilir.",
        "takeaway": "Kaynak: Guan ve ark., JGR Solid Earth (2026) · DOI: 10.1029/2025JB033195",
    },
]


def font(path, size):
    return ImageFont.truetype(path, size)


def wrap_text(draw, text, typeface, max_width):
    lines = []
    current = ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=typeface)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def write_lines(draw, lines, xy, typeface, fill, leading):
    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=typeface, fill=fill)
        y += leading
    return y


def make_art(slide_number):
    image = Image.new("RGB", (W, H), BG)
    pixels = image.load()
    start = (17, 38, 48)
    end = (54, 42, 42)
    for y in range(ART_H):
        t = y / ART_H
        color = tuple(round(start[i] * (1 - t) + end[i] * t) for i in range(3))
        for x in range(W):
            pixels[x, y] = color

    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, W, 130), fill=(12, 20, 29))

    center = (802, 317)
    draw.ellipse((542, 57, 1062, 577), fill=(49, 76, 77), outline=(119, 139, 128), width=3)
    draw.ellipse((632, 147, 972, 487), fill=(155, 91, 67), outline=(221, 150, 100), width=3)
    draw.ellipse((723, 238, 881, 396), fill=(220, 159, 87), outline=(247, 203, 125), width=3)

    for index in range(4):
        radius = 105 + index * 36
        draw.arc(
            (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius),
            198,
            342,
            fill=(238, 183, 120),
            width=3,
        )

    wave_points = []
    for x in range(70, 610, 3):
        y = 335 + 26 * (1 if slide_number % 2 else -1) * math.sin((x - 70) / 22)
        wave_points.append((x, round(y)))
    draw.line(wave_points, fill=(239, 177, 115), width=4)

    markers = [(650, 404), (711, 444), (776, 466), (846, 463), (910, 432), (960, 386)]
    for index, (x, y) in enumerate(markers):
        radius = 11 if slide_number in (1, 6, 8) else 7
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=ACCENT)
        if slide_number == 6:
            draw.text((x - 12, y - 38), f"{index + 1}", font=font(SANS_BOLD, 16), fill=CREAM)

    draw.text((76, 48), "VALEXIRION", font=font(SANS_BOLD, 23), fill=CREAM)
    draw.text((W - 164, 49), f"{slide_number:02d} / 08", font=font(SANS_BOLD, 20), fill=CREAM)
    return image, ImageDraw.Draw(image)


def render_cover(canvas, draw, item):
    draw.rounded_rectangle((64, 230, 1016, 519), radius=20, fill=(9, 15, 23))
    draw.text((98, 265), "DÜNYANIN EN DERİN SINIRINDA", font=font(SANS_BOLD, 27), fill=CREAM)
    draw.text((91, 311), item["big"], font=font(SERIF, 78), fill=ACCENT)

    body_lines = wrap_text(draw, item["body"], font(SANS_BOLD, 36), 900)
    body_end = write_lines(draw, body_lines, (76, 638), font(SANS_BOLD, 36), CREAM, 49)
    write_lines(draw, wrap_text(draw, item["takeaway"], font(SANS, 30), 900),
                (80, body_end + 40), font(SANS, 30), MUTED, 44)
    draw.line((76, 1214, 1004, 1214), fill=(255, 255, 255, 50), width=1)
    draw.text((76, 1242), "MERAK ET. SORGULA. KEŞFET.", font=font(SANS_BOLD, 17), fill=MUTED)


def render_content(canvas, draw, slide_number, item):
    draw.text((76, 598), "BİLİM  /  DÜNYA'NIN DERİNLİKLERİ", font=font(SANS_BOLD, 18), fill=ACCENT)

    title_font = font(SERIF, 67)
    title_lines = wrap_text(draw, item["title"], title_font, 930)
    if len(title_lines) > 2:
        title_font = font(SERIF, 60)
        title_lines = wrap_text(draw, item["title"], title_font, 930)
    title_end = write_lines(draw, title_lines, (76, 653), title_font, CREAM, round(title_font.size * 1.16))

    body_font = font(SANS, 35)
    body_y = title_end + 23
    body_lines = wrap_text(draw, item["body"], body_font, 915)
    body_end = write_lines(draw, body_lines, (80, body_y), body_font, MUTED, 49)

    takeaway_y = max(body_end + 44, 1003)
    takeaway_font = font(SANS_BOLD, 28)
    takeaway_lines = wrap_text(draw, item["takeaway"], takeaway_font, 810)
    box_height = max(145, 62 + len(takeaway_lines) * 41)
    draw.rounded_rectangle(
        (76, takeaway_y, 1004, takeaway_y + box_height),
        radius=18,
        fill=PANEL,
        outline=(255, 255, 255, 34),
        width=2,
    )
    draw.rounded_rectangle((76, takeaway_y, 84, takeaway_y + box_height), radius=4, fill=ACCENT)
    draw.text((111, takeaway_y + 20), "AKLINDA OLSUN", font=font(SANS_BOLD, 16), fill=ACCENT)
    write_lines(draw, takeaway_lines, (111, takeaway_y + 55), takeaway_font, CREAM, 39)

    draw.line((76, 1214, 1004, 1214), fill=(255, 255, 255, 50), width=1)
    draw.text((76, 1242), "MERAK ET. SORGULA. KEŞFET.", font=font(SANS_BOLD, 17), fill=MUTED)
    if item.get("kind") == "closing":
        draw.text((814, 1242), "KAYDIRMAYI KAYDET", font=font(SANS_BOLD, 16), fill=ACCENT)
    else:
        draw.text((918, 1242), f"{slide_number - 1} / 06", font=font(SANS_BOLD, 17), fill=CREAM)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for slide_number, item in enumerate(SLIDES, start=1):
        canvas, draw = make_art(slide_number)
        if item.get("kind") == "cover":
            render_cover(canvas, draw, item)
        else:
            render_content(canvas, draw, slide_number, item)
        canvas.save(OUT / f"{slide_number:02d}-derin-dunya.png", format="PNG", optimize=True)

    caption = """Ayaklarımızın yaklaşık 2.900 km altında, manto ile sıvı dış çekirdeğin buluştuğu sınır var. Bilim insanları, depremlerin ürettiği zayıf PKP öncül sinyallerini inceleyerek bu bölgede daha önce yeterince örneklenmemiş altı olası saçılma alanı belirledi.

Önemli not: Bunlar yeraltında bulunan binalar ya da doğrudan görülmüş yapılar değil; sismik verilerden çıkarılan olası heterojenlikler. Ne oldukları ve hangi maddelerden oluştukları araştırılmaya devam ediyor.

Bilimsel çalışma: Guan ve ark., “Global Distribution of PKP Precursors Derived From Three Decades of Seismic Data With Deep Learning,” JGR: Solid Earth (2026). https://doi.org/10.1029/2025JB033195
Haber: https://www.hurriyet.com.tr/dunya/dunyanin-en-ulasilmaz-noktasinda-buyuk-kesif-6-gizemli-yapi-ortaya-cikti-gelen-sinyal-her-seyi-degistirdi-43294728

#bilim #deprem #jeoloji #dunya #sismoloji #valexirion"""
    (OUT / "paylasim-aciklamasi.txt").write_text(caption, encoding="utf-8")

    sources = """GÖRSEL KAYNAĞI
Tüm görseller bu carousel için Pillow ile özgün olarak çizilmiştir; dış fotoğraf kullanılmamıştır.

BİLİMSEL KAYNAK
Guan, Y. et al. (2026). Global Distribution of PKP Precursors Derived From Three Decades of Seismic Data With Deep Learning.
Journal of Geophysical Research: Solid Earth.
https://doi.org/10.1029/2025JB033195

HABER KAYNAĞI
Hürriyet, “Dünyanın en ulaşılmaz noktasında büyük keşif: 6 gizemli yapı ortaya çıktı”
https://www.hurriyet.com.tr/dunya/dunyanin-en-ulasilmaz-noktasinda-buyuk-kesif-6-gizemli-yapi-ortaya-cikti-gelen-sinyal-her-seyi-degistirdi-43294728
"""
    (OUT / "kaynaklar.txt").write_text(sources, encoding="utf-8")

    preview = Image.new("RGB", (648, 900), (235, 235, 235))
    preview_draw = ImageDraw.Draw(preview)
    preview_font = font(SANS, 14)
    for index in range(len(SLIDES)):
        slide_path = OUT / f"{index + 1:02d}-derin-dunya.png"
        with Image.open(slide_path) as source:
            thumb = source.convert("RGB")
            thumb.thumbnail((216, 270), Image.Resampling.LANCZOS)
        x, y = (index % 3) * 216, (index // 3) * 300
        preview.paste(thumb, (x, y))
        preview_draw.text((x + 4, y + 274), slide_path.name, font=preview_font, fill=(20, 20, 20))
    preview.save(OUT / "carousel-onizleme.jpg", quality=92)

    archive_path = OUT / "valexirion-derin-dunya-carousel.zip"
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(OUT.glob("*.png")):
            archive.write(path, path.name)
        archive.write(OUT / "paylasim-aciklamasi.txt", "paylasim-aciklamasi.txt")
        archive.write(OUT / "kaynaklar.txt", "kaynaklar.txt")

    print(f"Created {len(SLIDES)} slides at {OUT}")
    print(f"Canvas: {W}x{H} px; format: PNG")


if __name__ == "__main__":
    main()
