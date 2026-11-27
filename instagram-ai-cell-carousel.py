from pathlib import Path
import zipfile

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "instagram-ai-cell-carousel-revised"
PHOTOS = ROOT / "instagram-ai-cell-carousel" / "photos"
W, H = 1080, 1350
PHOTO_HEIGHT = 555
BG = (15, 23, 35)
PANEL = (25, 36, 51)
CREAM = (246, 241, 230)
MUTED = (184, 194, 205)
ACCENT = (233, 169, 112)
FONT_DIR = Path(r"C:\Windows\Fonts")
SERIF = str(FONT_DIR / "georgiab.ttf")
SANS = str(FONT_DIR / "segoeui.ttf")
SANS_BOLD = str(FONT_DIR / "segoeuib.ttf")

PHOTO_IDS = {
    "cells.jpg": "photo-1576086213369-97a306d36557",
    "pipette.jpg": "photo-1532187863486-abf9dbad1b69",
    "microscope-man.jpg": "photo-1579154204601-01588f351e67",
    "microscope-woman.jpg": "photo-1511174511562-5f7f18b874f8",
    "lab.jpg": "photo-1582719471384-894fbb16e074",
}

SLIDES = [
    {
        "kind": "cover",
        "photo": "cells.jpg",
        "kicker": "İDDİA MI, BİLİMSEL GERÇEK Mİ?",
        "title": "Yapay zekâ sıfırdan bakteri mi tasarladı?",
        "body": "Gerçek24 bu çarpıcı iddiayı 2026 keşfi olarak aktarıyor. Bilimsel dayanağına birlikte bakalım.",
    },
    {
        "photo": "pipette.jpg",
        "title": "Verdiğin kaynak ne söylüyor?",
        "body": "Gerçek24, yapay zekâ modellerinin bakterinin genomunu sıfırdan tasarladığı ve laboratuvarda sentetik bakteri üretildiği iddiasını aktarıyor.",
        "takeaway": "Bu, haberin aktardığı iddia; yazıda araştırma makalesi veya DOI belirtilmiyor.",
    },
    {
        "photo": "microscope-man.jpg",
        "title": "Sentetik genom çalışması yeni değil",
        "body": "2010’da araştırmacılar, laboratuvarda sentezlenen bir bakteri genomunun kontrol ettiği hücreyi duyurdu. Çalışma, sentetik biyolojide önemli bir dönüm noktasıydı.",
        "takeaway": "Bu çalışma yapay zekâyla tasarlanmış bir bakteri değildi.",
    },
    {
        "photo": "microscope-woman.jpg",
        "title": "“Sıfırdan” ifadesinin önemli bir nüansı var",
        "body": "Sentetik genom, var olan bir bakterinin genom bilgisi temel alınarak kimyasal olarak oluşturuldu ve alıcı bir hücreye aktarıldı.",
        "takeaway": "Yani bu, hiçbir biyolojik başlangıç olmadan canlılık yaratmak anlamına gelmiyor.",
    },
    {
        "photo": "lab.jpg",
        "title": "Yapay zekâ biyolojide gerçekten ne yapıyor?",
        "body": "ESM3 adlı model, protein tasarımları üretti. Araştırmacılar bu tasarımlardan bazılarını laboratuvarda sentezleyip işlevlerini test etti.",
        "takeaway": "2025 tarihli çalışmada öne çıkan örnek, yeni bir floresan proteindi; bütün bir bakteri değildi.",
    },
    {
        "photo": "microscope-woman.jpg",
        "title": "Bir protein, canlı bir hücre demek değil",
        "body": "Protein tasarlamak ile kendi kendini sürdürebilen bir hücre tasarlamak çok farklı ölçeklerde problemler. Hücre, birlikte çalışan çok sayıda bileşene ve sürece bağlı.",
        "takeaway": "Bilimde heyecan verici ilerleme var; ama iddianın kapsamını doğru anlatmak önemli.",
    },
    {
        "photo": "cells.jpg",
        "title": "İddiayla kanıtlanmış bulguyu ayıralım",
        "body": "2010’da sentetik genomla kontrol edilen bir hücre üretildi. 2025’te yapay zekâ yeni proteinler tasarladı. Bunlar ayrı araştırma sonuçları.",
        "takeaway": "Gerçek24’nin bakteri iddiası için yazıda doğrulanabilir bir bilimsel yayın atfı yok.",
    },
    {
        "kind": "closing",
        "photo": "microscope-man.jpg",
        "title": "Bilimde heyecan, kaynakla güçlenir",
        "body": "Haberdeki iddiayı doğrulamak için çalışmanın kendisini, araştırmacılarını ve yöntemini görmek gerekir.",
        "takeaway": "Sen bu iddiayı ilk gördüğünde gerçek olduğunu düşündün mü?",
    },
]


def font(path, size):
    return ImageFont.truetype(path, size)


def crop_cover(image, width, height):
    ratio = max(width / image.width, height / image.height)
    resized = image.resize(
        (round(image.width * ratio), round(image.height * ratio)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


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


def base(slide_number, item):
    photo_path = PHOTOS / item["photo"]
    with Image.open(photo_path) as source:
        photo = crop_cover(source.convert("RGB"), W, PHOTO_HEIGHT).convert("RGBA")

    shade = Image.new("RGBA", (W, PHOTO_HEIGHT), (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    for y in range(PHOTO_HEIGHT):
        if y < 130:
            alpha = 115
        else:
            alpha = round(15 + 220 * ((y - 130) / (PHOTO_HEIGHT - 130)) ** 2)
        shade_draw.line((0, y, W, y), fill=(7, 13, 22, alpha))
    photo = Image.alpha_composite(photo, shade)

    canvas = Image.new("RGB", (W, H), BG)
    canvas.paste(photo.convert("RGB"), (0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.text((72, 48), "VALEXIRION", font=font(SANS_BOLD, 23), fill=CREAM)
    draw.text((W - 164, 49), f"{slide_number:02d} / 08", font=font(SANS_BOLD, 20), fill=CREAM)
    draw.text((72, PHOTO_HEIGHT - 39), "STOK FOTOĞRAF · TEMSİLİ GÖRSEL", font=font(SANS_BOLD, 15), fill=CREAM)
    return canvas, draw


def render_cover(canvas, draw, item):
    draw.rounded_rectangle((64, 572, 1016, 935), radius=20, fill=(9, 15, 23))
    draw.text((98, 605), item["kicker"], font=font(SANS_BOLD, 23), fill=ACCENT)

    title_font = font(SERIF, 65)
    title_lines = wrap_text(draw, item["title"], title_font, 880)
    if len(title_lines) > 2:
        title_font = font(SERIF, 57)
        title_lines = wrap_text(draw, item["title"], title_font, 880)
    title_end = write_lines(draw, title_lines, (96, 657), title_font, CREAM, round(title_font.size * 1.15))
    write_lines(
        draw,
        wrap_text(draw, item["body"], font(SANS, 32), 880),
        (80, title_end + 32),
        font(SANS, 32),
        MUTED,
        45,
    )
    draw.line((76, 1214, 1004, 1214), fill=(255, 255, 255, 50), width=1)
    draw.text((76, 1242), "MERAK ET. SORGULA. KEŞFET.", font=font(SANS_BOLD, 17), fill=MUTED)


def render_content(canvas, draw, slide_number, item):
    draw.text((76, 598), "BİLİM  /  YAPAY ZEKÂ & SENTETİK BİYOLOJİ", font=font(SANS_BOLD, 17), fill=ACCENT)

    title_font = font(SERIF, 65)
    title_lines = wrap_text(draw, item["title"], title_font, 930)
    if len(title_lines) > 2:
        title_font = font(SERIF, 58)
        title_lines = wrap_text(draw, item["title"], title_font, 930)
    title_end = write_lines(draw, title_lines, (76, 652), title_font, CREAM, round(title_font.size * 1.15))

    body_font = font(SANS, 33)
    body_y = title_end + 20
    body_lines = wrap_text(draw, item["body"], body_font, 915)
    body_end = write_lines(draw, body_lines, (80, body_y), body_font, MUTED, 47)

    takeaway_y = max(body_end + 40, 1000)
    takeaway_font = font(SANS_BOLD, 27)
    takeaway_lines = wrap_text(draw, item["takeaway"], takeaway_font, 810)
    box_height = max(145, 62 + len(takeaway_lines) * 40)
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
        draw.text((808, 1242), "YORUMLARA YAZ", font=font(SANS_BOLD, 16), fill=ACCENT)
    else:
        draw.text((918, 1242), f"{slide_number - 1} / 06", font=font(SANS_BOLD, 17), fill=CREAM)


def main():
    if not PHOTOS.exists():
        raise FileNotFoundError(f"Photo directory not found: {PHOTOS}")
    OUT.mkdir(parents=True, exist_ok=True)
    missing = [name for name in PHOTO_IDS if not (PHOTOS / name).is_file()]
    if missing:
        raise FileNotFoundError(f"Stock photos are missing: {', '.join(missing)}")

    for slide_number, item in enumerate(SLIDES, start=1):
        canvas, draw = base(slide_number, item)
        if item.get("kind") == "cover":
            render_cover(canvas, draw, item)
        else:
            render_content(canvas, draw, slide_number, item)
        canvas.save(OUT / f"{slide_number:02d}-ai-ve-hucre.png", format="PNG", optimize=True)

    caption = """Gerçek24’nin “Bilim Dünyasında 2026 Yılının En Büyük Keşifleri” yazısı, yapay zekânın sıfırdan bakteri genomu tasarladığı ve laboratuvarda sentetik bakteri üretildiği iddiasını aktarıyor. Bu haber, iddianın kaynağıdır; ancak ilgili bölümde bilimsel makale, araştırmacı veya DOI belirtilmiyor.

Bağlam için iki yayımlanmış çalışma: 2010’da araştırmacılar, kimyasal olarak sentezlenmiş bir genomla kontrol edilen bakteri hücresini duyurdu. 2025’te ESM3 adlı yapay zekâ modeli yeni proteinler tasarladı; laboratuvarda test edilen örneklerden biri floresan proteindi. Bu çalışmalar, 2026’daki bakteri iddiasını tek başına doğrulamıyor.

Kaynaklar:
Gibson et al. (2010), Science: https://doi.org/10.1126/science.1190719
Hayes et al. (2025), Science: https://doi.org/10.1126/science.ads0018
İddianın yer aldığı yazı: https://gercek24.com.tr/2026-kesifleri-bilim-dunyasinda/

#bilim #yapayzeka #sentetikbiyoloji #biyoloji #valexirion"""
    (OUT / "paylasim-aciklamasi.txt").write_text(caption, encoding="utf-8")

    source_lines = [
        "BİLİMSEL KAYNAKLAR",
        "Gibson et al. (2010), Creation of a Bacterial Cell Controlled by a Chemically Synthesized Genome, Science.",
        "https://doi.org/10.1126/science.1190719",
        "",
        "Hayes et al. (2025), Simulating 500 million years of evolution with a language model, Science.",
        "https://doi.org/10.1126/science.ads0018",
        "",
        "İDDİA KAYNAĞI",
        "https://gercek24.com.tr/2026-kesifleri-bilim-dunyasinda/",
        "Bu sayfa iddianın haber kaynağıdır; ilgili bölümde bilimsel yayın veya DOI belirtilmiyor.",
        "",
        "STOK FOTOĞRAF KAYNAKLARI",
        "Fotoğraflar Unsplash CDN üzerinden alınmıştır. Unsplash License: https://unsplash.com/license",
        "Fotoğraflar temsili stok görsellerdir; kaynak çalışmalardaki deney veya canlıları göstermemektedir.",
        "",
    ]
    source_lines.extend(
        f"{filename}: https://images.unsplash.com/{photo_id}"
        for filename, photo_id in PHOTO_IDS.items()
    )
    (OUT / "kaynaklar.txt").write_text("\n".join(source_lines), encoding="utf-8")

    preview = Image.new("RGB", (648, 900), (235, 235, 235))
    preview_draw = ImageDraw.Draw(preview)
    preview_font = font(SANS, 14)
    for index in range(len(SLIDES)):
        slide_path = OUT / f"{index + 1:02d}-ai-ve-hucre.png"
        with Image.open(slide_path) as source:
            thumb = source.convert("RGB")
            thumb.thumbnail((216, 270), Image.Resampling.LANCZOS)
        x, y = (index % 3) * 216, (index // 3) * 300
        preview.paste(thumb, (x, y))
        preview_draw.text((x + 4, y + 274), slide_path.name, font=preview_font, fill=(20, 20, 20))
    preview.save(OUT / "carousel-onizleme.jpg", quality=92)

    archive_path = OUT / "valexirion-ai-ve-sentetik-hucre-carousel.zip"
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(OUT.glob("*.png")):
            archive.write(path, path.name)
        for filename in PHOTO_IDS:
            path = PHOTOS / filename
            archive.write(path, f"photos/{path.name}")
        archive.write(OUT / "paylasim-aciklamasi.txt", "paylasim-aciklamasi.txt")
        archive.write(OUT / "kaynaklar.txt", "kaynaklar.txt")

    print(f"Created {len(SLIDES)} slides at {OUT}")
    print(f"Canvas: {W}x{H} px; format: PNG")


if __name__ == "__main__":
    main()
