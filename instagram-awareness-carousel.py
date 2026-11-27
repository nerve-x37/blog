from pathlib import Path
import zipfile

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "instagram-awareness-carousel-relevant"
PHOTOS = ROOT / "instagram-awareness-carousel" / "photos" / "relevant"
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

PHOTOS_BY_SLIDE = {
    1: "cover.jpg",
    2: "pleasing.jpg",
    3: "waiting.jpg",
    4: "comparison.jpg",
    5: "overthinking.jpg",
    6: "postponing.jpg",
    7: "change.jpg",
    8: "support.jpg",
    9: "closing.jpg",
}

SLIDES = [
    {
        "kind": "cover",
        "title": "İnsanların farkında olmadan yaptığı",
        "big": "7 HATA",
        "subtitle": "Belki sen de bunlardan birkaçını yapıyorsun.",
    },
    {
        "title": "Herkesi memnun etmeye çalışmak",
        "body": "Başkalarını mutlu etmeye çalışırken kendi ihtiyaçlarını geri plana atabilirsin.",
        "takeaway": "Herkesin seni sevmesi senin sorumluluğun değil.",
    },
    {
        "title": "Sürekli doğru zamanı beklemek",
        "body": "Her şeyin kusursuz olmasını beklerken başlamayı erteleyebilir, bazı fırsatları kaçırabilirsin.",
        "takeaway": "Bazen hazır hissetmeden atılan küçük bir adım yeterlidir.",
    },
    {
        "title": "Kendini başkalarıyla kıyaslamak",
        "body": "Başkalarının öne çıkan anlarını kendi sıradan günlerinle karşılaştırmak, resmin tamamını göstermez.",
        "takeaway": "Herkesin koşulları ve ilerleme temposu farklıdır.",
    },
    {
        "title": "Her şeyi fazla düşünmek",
        "body": "Henüz yaşanmamış ihtimalleri tekrar tekrar düşünmek, karar vermeyi ve harekete geçmeyi zorlaştırabilir.",
        "takeaway": "Kontrol edebildiğin bir sonraki küçük adıma odaklan.",
    },
    {
        "title": "Kendini sürekli ertelemek",
        "body": "“İşler bitsin, herkes mutlu olsun, şartlar düzelsin…” derken kendine ayıracağın zamanı sürekli sonraya bırakabilirsin.",
        "takeaway": "Kendi ihtiyaçlarına da bugün küçük bir yer aç.",
    },
    {
        "title": "Değişime direnmek",
        "body": "Sana iyi gelmeyen alışkanlıklara, ortamlara veya düşüncelere sırf tanıdık oldukları için tutunabilirsin.",
        "takeaway": "Alışmış olmak, orada kalmanın sana iyi geldiği anlamına gelmez.",
    },
    {
        "title": "Her şeyi tek başına halletmeye çalışmak",
        "body": "Yardım istemeyi zayıflık gibi görüp her yükü tek başına taşımaya çalışabilirsin.",
        "takeaway": "Destek istemek de güçlü ve sağlıklı bir beceridir.",
    },
    {
        "kind": "closing",
        "title": "Fark etmek, değişimin ilk adımı olabilir.",
        "body": "Büyük kararlar almadan da küçük farkındalıklarla başlayabilirsin.",
        "takeaway": "Bu 7 maddeden hangisi sana tanıdık geliyor? Yorumlara yaz; sonra tekrar okumak için kaydet.",
    },
]


def font(path, size):
    return ImageFont.truetype(path, size)


def crop_cover(image, width, height):
    ratio = max(width / image.width, height / image.height)
    resized = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.Resampling.LANCZOS)
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


def add_photo_and_brand(slide_number):
    photo_path = PHOTOS / PHOTOS_BY_SLIDE[slide_number]
    with Image.open(photo_path) as source:
        image = crop_cover(source.convert("RGB"), W, PHOTO_HEIGHT).convert("RGBA")

    shade = Image.new("RGBA", (W, PHOTO_HEIGHT), (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    for y in range(PHOTO_HEIGHT):
        if y < 130:
            alpha = 115
        else:
            alpha = round(15 + 220 * ((y - 130) / (PHOTO_HEIGHT - 130)) ** 2)
        shade_draw.line((0, y, W, y), fill=(7, 13, 22, alpha))
    image = Image.alpha_composite(image, shade)
    canvas = Image.new("RGB", (W, H), BG)
    canvas.paste(image.convert("RGB"), (0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.text((72, 48), "VALEXIRION", font=font(SANS_BOLD, 23), fill=CREAM)
    draw.text((W - 164, 49), f"{slide_number:02d} / 09", font=font(SANS_BOLD, 20), fill=CREAM)
    return canvas, draw


def render_cover(canvas, draw):
    draw.rounded_rectangle((64, 292, 1016, 534), radius=20, fill=(9, 15, 23))
    draw.text((99, 325), "İNSANLARIN FARK ETMEDEN YAPTIĞI", font=font(SANS_BOLD, 28), fill=CREAM)
    draw.text((94, 370), "7 HATA", font=font(SERIF, 105), fill=ACCENT)
    draw.text((76, 655), "Belki sen de bunlardan birkaçını", font=font(SANS_BOLD, 37), fill=CREAM)
    draw.text((76, 704), "yapıyorsun.", font=font(SANS_BOLD, 37), fill=CREAM)
    draw.text((76, 824), "Kendine kızmak için değil, fark etmek için.", font=font(SANS, 28), fill=MUTED)
    draw.line((76, 1241, 1004, 1241), fill=(255, 255, 255, 50), width=1)
    draw.text((76, 1270), "KENDİNE BİR ADIM DAHA YAKIN.", font=font(SANS_BOLD, 16), fill=MUTED)


def render_content(canvas, draw, slide_number, item):
    draw.text((76, 600), "FARKINDALIK  /  KÜÇÜK BİR DURUP DÜŞÜNME", font=font(SANS_BOLD, 17), fill=ACCENT)

    title_font = font(SERIF, 57)
    title_lines = wrap_text(draw, item["title"], title_font, 920)
    if len(title_lines) > 2:
        title_font = font(SERIF, 51)
        title_lines = wrap_text(draw, item["title"], title_font, 920)
    title_y = 660
    title_end = write_lines(draw, title_lines, (76, title_y), title_font, CREAM, round(title_font.size * 1.18))

    body_y = title_end + 28
    body_font = font(SANS, 30)
    body_lines = wrap_text(draw, item["body"], body_font, 910)
    body_end = write_lines(draw, body_lines, (80, body_y), body_font, MUTED, 45)

    takeaway_y = max(body_end + 54, 1012)
    if takeaway_y > 1070:
        body_font = font(SANS, 27)
        body_lines = wrap_text(draw, item["body"], body_font, 910)
        body_end = write_lines(draw, body_lines, (80, body_y), body_font, MUTED, 41)
        takeaway_y = max(body_end + 48, 1012)

    takeaway_font = font(SANS_BOLD, 25)
    takeaway_lines = wrap_text(draw, item["takeaway"], takeaway_font, 810)
    box_height = max(136, 56 + len(takeaway_lines) * 38)
    draw.rounded_rectangle(
        (76, takeaway_y, 1004, takeaway_y + box_height),
        radius=18,
        fill=PANEL,
        outline=(255, 255, 255, 34),
        width=2,
    )
    draw.rounded_rectangle((76, takeaway_y, 84, takeaway_y + box_height), radius=4, fill=ACCENT)
    draw.text((111, takeaway_y + 20), "AKLINDA OLSUN", font=font(SANS_BOLD, 15), fill=ACCENT)
    write_lines(draw, takeaway_lines, (111, takeaway_y + 52), takeaway_font, CREAM, 37)

    draw.line((76, 1241, 1004, 1241), fill=(255, 255, 255, 50), width=1)
    draw.text((76, 1270), "KENDİNE BİR ADIM DAHA YAKIN.", font=font(SANS_BOLD, 16), fill=MUTED)
    if item.get("kind") == "closing":
        draw.text((800, 1270), "YORUMA YAZ  ↗", font=font(SANS_BOLD, 16), fill=ACCENT)
    else:
        draw.text((918, 1270), f"{slide_number - 1} / 07", font=font(SANS_BOLD, 16), fill=CREAM)


def main():
    if not PHOTOS.exists():
        raise FileNotFoundError(f"Photo directory not found: {PHOTOS}")
    OUT.mkdir(parents=True, exist_ok=True)

    for slide_number, item in enumerate(SLIDES, start=1):
        canvas, draw = add_photo_and_brand(slide_number)
        if item.get("kind") == "cover":
            render_cover(canvas, draw)
        else:
            render_content(canvas, draw, slide_number, item)
        canvas.save(OUT / f"{slide_number:02d}-farkindalik.png", format="PNG", optimize=True)

    caption = """Bazen bizi yoran şey, fark etmeden tekrar ettiğimiz küçük alışkanlıklar olabilir.

Bu paylaşım bir tanı ya da kesin kural değil; kendine dönüp bakmak için bir başlangıç. Her madde herkes için geçerli olmayabilir.

7 maddeden hangisi sana en tanıdık geldi? İstersen yorumlarda paylaş; daha sonra dönmek için kaydet.

#farkindalik #kişiselgelişim #kendineiyibak #alışkanlıklar #valexirion"""
    (OUT / "paylasim-aciklamasi.txt").write_text(caption, encoding="utf-8")

    photo_ids = {
        "cover.jpg": "photo-1491438590914-bc09fcaaf77a",
        "pleasing.jpg": "photo-1536010305525-f7aa0834e2c7",
        "waiting.jpg": "photo-1550534791-2677533605ab",
        "comparison.jpg": "photo-1588058365548-9efe5acb8077",
        "overthinking.jpg": "photo-1618616191524-a9721186cbe4",
        "postponing.jpg": "photo-1601342630314-8427c38bf5e6",
        "change.jpg": "photo-1533073526757-2c8ca1df9f1c",
        "support.jpg": "photo-1604881991720-f91add269bed",
        "closing.jpg": "photo-1543269865-cbf427effbad",
    }
    sources = [
        "PHOTO SOURCES",
        "Photos are illustrative stock photographs downloaded from Unsplash.",
        "Unsplash License: https://unsplash.com/license",
        "Verify current photo page and license details before reuse.",
        "",
    ]
    sources.extend(
        f"{filename}: https://images.unsplash.com/{photo_id}"
        for filename, photo_id in photo_ids.items()
    )
    (OUT / "foto-kaynaklari.txt").write_text("\n".join(sources), encoding="utf-8")

    archive_path = OUT / "valexirion-farkindalik-carousel.zip"
    preview = Image.new("RGB", (648, 900), (235, 235, 235))
    preview_draw = ImageDraw.Draw(preview)
    preview_font = font(SANS, 14)
    for index in range(len(SLIDES)):
        slide_path = OUT / f"{index + 1:02d}-farkindalik.png"
        with Image.open(slide_path) as source:
            thumb = source.convert("RGB")
            thumb.thumbnail((216, 270), Image.Resampling.LANCZOS)
        x, y = (index % 3) * 216, (index // 3) * 300
        preview.paste(thumb, (x, y))
        preview_draw.text((x + 4, y + 274), slide_path.name, font=preview_font, fill=(20, 20, 20))
    preview.save(OUT / "carousel-onizleme.jpg", quality=90)

    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(OUT.glob("*.png")):
            archive.write(path, path.name)
        archive.write(OUT / "paylasim-aciklamasi.txt", "paylasim-aciklamasi.txt")
        archive.write(OUT / "foto-kaynaklari.txt", "foto-kaynaklari.txt")
        for filename in sorted(set(PHOTOS_BY_SLIDE.values())):
            path = PHOTOS / filename
            archive.write(path, f"photos/{path.name}")

    print(f"Created {len(SLIDES)} slides at {OUT}")
    print(f"Canvas: {W}x{H} px; format: PNG")


if __name__ == "__main__":
    main()
