from pathlib import Path
import math
import random
import zipfile

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "instagram-venus-carousel"
W, H = 1080, 1350
BG_TOP = (13, 19, 30)
BG_BOTTOM = (24, 31, 44)
CREAM = (246, 239, 222)
MUTED = (171, 180, 193)
CORAL = (245, 128, 93)
GOLD = (246, 190, 104)
BLUE = (107, 178, 205)

FONT_DIR = Path(r"C:\Windows\Fonts")
SERIF = str(FONT_DIR / "georgia.ttf")
SERIF_BOLD = str(FONT_DIR / "georgiab.ttf")
SANS = str(FONT_DIR / "segoeui.ttf")
SANS_BOLD = str(FONT_DIR / "segoeuib.ttf")


def font(path, size):
    return ImageFont.truetype(path, size)


def background(seed):
    image = Image.new("RGB", (W, H))
    pixels = image.load()
    for y in range(H):
        t = y / H
        color = tuple(round(BG_TOP[i] * (1 - t) + BG_BOTTOM[i] * t) for i in range(3))
        for x in range(W):
            pixels[x, y] = color
    draw = ImageDraw.Draw(image, "RGBA")
    random.seed(seed)
    for _ in range(80):
        x, y = random.randrange(W), random.randrange(H)
        alpha = random.randrange(25, 100)
        draw.ellipse((x, y, x + 2, y + 2), fill=(*CREAM, alpha))
    return image


def wrap(draw, text, typeface, max_width):
    lines, line = [], ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=typeface)[2] <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def paragraph(draw, text, xy, typeface, fill, max_width, leading=1.35):
    x, y = xy
    for line in wrap(draw, text, typeface, max_width):
        draw.text((x, y), line, font=typeface, fill=fill)
        y += round(typeface.size * leading)
    return y


def centered(draw, text, y, typeface, fill):
    box = draw.textbbox((0, 0), text, font=typeface)
    draw.text(((W - (box[2] - box[0])) / 2, y), text, font=typeface, fill=fill)


def centered_at(draw, text, x, y, typeface, fill):
    box = draw.textbbox((0, 0), text, font=typeface)
    draw.text((x - (box[2] - box[0]) / 2, y), text, font=typeface, fill=fill)


def planet(draw, x, y, radius, color, rings=False):
    for step in range(radius, 0, -1):
        t = step / radius
        shade = tuple(round(c * (0.65 + 0.35 * t)) for c in color)
        draw.ellipse((x - step, y - step, x + step, y + step), fill=(*shade, 255))
    draw.ellipse(
        (x - radius * 0.65, y - radius * 0.78, x - radius * 0.05, y - radius * 0.18),
        fill=(255, 239, 211, 52),
    )
    if rings:
        draw.ellipse(
            (x - radius * 1.65, y - radius * 0.52, x + radius * 1.65, y + radius * 0.52),
            outline=(*GOLD, 150),
            width=3,
        )


def sun(draw, x, y, radius):
    for angle in range(0, 360, 30):
        radians = math.radians(angle)
        inner = radius + 16
        outer = radius + 31
        draw.line(
            (
                x + math.cos(radians) * inner,
                y + math.sin(radians) * inner,
                x + math.cos(radians) * outer,
                y + math.sin(radians) * outer,
            ),
            fill=(*GOLD, 230),
            width=5,
        )
    planet(draw, x, y, radius, (245, 166, 74))


def solar_order(draw, top, bottom, compact=False):
    left, right = 105, 975
    center_y = top + (bottom - top) // 2 - 20
    positions = [165, 410, 655, 900]
    draw.text(
        (left, top + 18),
        "GÜNEŞ’TEN DIŞARI DOĞRU",
        font=font(SANS_BOLD, 17 if compact else 19),
        fill=MUTED,
    )
    draw.line(
        (positions[0] + 42, center_y, right - 12, center_y),
        fill=(246, 190, 104, 120),
        width=3,
    )
    draw.polygon(
        [(right, center_y), (right - 15, center_y - 9), (right - 15, center_y + 9)],
        fill=(*GOLD, 200),
    )
    sun(draw, positions[0], center_y, 43 if compact else 53)
    planet(draw, positions[1], center_y, 23 if compact else 29, (137, 151, 164))
    planet(draw, positions[2], center_y, 33 if compact else 42, (213, 139, 91))
    planet(draw, positions[3], center_y, 33 if compact else 42, (91, 151, 185))
    label_y = center_y + (58 if compact else 70)
    label_font = font(SANS_BOLD, 15 if compact else 18)
    for label, x, color in zip(
        ("GÜNEŞ", "MERKÜR", "VENÜS", "DÜNYA"),
        positions,
        (GOLD, MUTED, CORAL, BLUE),
    ):
        centered_at(draw, label, x, label_y, label_font, color)
    centered_at(
        draw,
        "Çizim temsili; uzaklıklar ve gezegen boyutları ölçekli değildir.",
        W // 2,
        bottom - 30,
        font(SANS, 14 if compact else 16),
        MUTED,
    )


def base(page, section, seed):
    image = background(seed)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.text((76, 54), "●  VALEXIRION", font=font(SANS_BOLD, 24), fill=CREAM)
    draw.text((76, 103), section.upper(), font=font(SANS_BOLD, 17), fill=CORAL)
    draw.line((76, 145, 1004, 145), fill=(255, 255, 255, 42), width=1)
    draw.line((76, 1252, 1004, 1252), fill=(255, 255, 255, 42), width=1)
    draw.text((76, 1280), "MERAK ET. SORGULA. KEŞFET.", font=font(SANS_BOLD, 15), fill=MUTED)
    draw.text((910, 1272), f"{page:02d} / 07", font=font(SANS_BOLD, 18), fill=CREAM)
    draw.rounded_rectangle((76, 1231, 76 + 132 * page, 1235), radius=2, fill=(*CORAL, 255))
    return image, draw


def add_slide(number, section, seed, draw_content):
    image, draw = base(number, section, seed)
    draw_content(image, draw)
    image.save(OUT / f"{number:02d}-valexirion.png", format="PNG", optimize=True)


def make_cover(image, draw):
    draw.text((80, 233), "EN SICAK GEZEGEN", font=font(SERIF_BOLD, 73), fill=CREAM)
    draw.text((80, 329), "NEDEN VENÜS?", font=font(SERIF_BOLD, 91), fill=CORAL)
    draw.text((84, 464), "Merkür Güneş’e daha yakın.", font=font(SANS_BOLD, 31), fill=CREAM)
    draw.text((84, 510), "Yanıt, gezegenlerin atmosferinde.", font=font(SANS, 28), fill=MUTED)
    draw.rounded_rectangle(
        (80, 649, 1000, 1108),
        radius=28,
        fill=(255, 255, 255, 10),
        outline=(255, 255, 255, 38),
        width=2,
    )
    solar_order(draw, 692, 1068)


def make_question(image, draw):
    draw.text((82, 220), "ÖNCE SIRALAMA", font=font(SANS_BOLD, 22), fill=GOLD)
    paragraph(
        draw,
        "Merkür, Venüs’ten daha yakında.",
        (80, 282),
        font(SERIF_BOLD, 62),
        CREAM,
        910,
        1.2,
    )
    paragraph(
        draw,
        "Buna rağmen Venüs’ün yüzeyi daha sıcak. Güneş’ten uzaklık, yanıtın yalnızca bir parçası.",
        (84, 465),
        font(SANS, 28),
        MUTED,
        870,
        1.45,
    )
    draw.rounded_rectangle(
        (82, 680, 998, 1045),
        radius=24,
        fill=(255, 255, 255, 12),
        outline=(255, 255, 255, 38),
        width=2,
    )
    solar_order(draw, 706, 1017, compact=True)
    centered(draw, "Bir sonraki slaytta: Merkür’ün sıcaklık uçurumu.", 1091, font(SANS_BOLD, 23), CREAM)


def make_mercury(image, draw):
    draw.text((80, 212), "MERKÜR", font=font(SERIF_BOLD, 74), fill=CREAM)
    draw.text((82, 312), "Güneş’e en yakın gezegen", font=font(SANS, 26), fill=MUTED)
    planet(draw, 812, 337, 116, (137, 151, 164))
    paragraph(
        draw,
        "Yoğun bir atmosferi olmadığı için ısıyı gece boyunca tutamaz.",
        (84, 421),
        font(SANS, 24),
        CREAM,
        620,
        1.4,
    )
    draw.rounded_rectangle((80, 525, 1000, 747), radius=24, fill=(255, 255, 255, 12), outline=(255, 255, 255, 35), width=2)
    draw.text((118, 562), "GÜNDÜZ", font=font(SANS_BOLD, 19), fill=MUTED)
    draw.text((345, 577), "≈ 430°C", font=font(SERIF_BOLD, 61), fill=GOLD)
    draw.rounded_rectangle((80, 779, 1000, 1001), radius=24, fill=(255, 255, 255, 12), outline=(255, 255, 255, 35), width=2)
    draw.text((118, 816), "GECE", font=font(SANS_BOLD, 19), fill=MUTED)
    draw.text((345, 831), "≈ −180°C", font=font(SERIF_BOLD, 61), fill=BLUE)
    paragraph(
        draw,
        "Aradaki büyük fark, Merkür’ün ısıyı tutacak yoğun bir atmosfere sahip olmamasından kaynaklanır.",
        (84, 1060),
        font(SANS, 25),
        CREAM,
        900,
        1.38,
    )


def make_venus(image, draw):
    draw.text((80, 212), "VENÜS", font=font(SERIF_BOLD, 74), fill=CREAM)
    draw.text((82, 312), "Güneş’e ikinci en yakın gezegen", font=font(SANS, 26), fill=MUTED)
    planet(draw, 804, 380, 156, (213, 139, 91))
    draw.rounded_rectangle((80, 625, 1000, 895), radius=28, fill=(245, 128, 93, 18), outline=(245, 128, 93, 100), width=2)
    draw.text((122, 668), "YÜZEY SICAKLIĞI", font=font(SANS_BOLD, 20), fill=MUTED)
    draw.text((115, 710), "≈ 467°C", font=font(SERIF_BOLD, 104), fill=CORAL)
    paragraph(draw, "Kalın atmosferi ısıyı hapseder. Bu güçlü sera etkisi Venüs’ü Güneş Sistemi’nin en sıcak gezegeni yapar.", (84, 982), font(SANS_BOLD, 28), CREAM, 875, 1.4)


def make_comparison(image, draw):
    draw.text((80, 214), "SAYILAR NE DİYOR?", font=font(SERIF_BOLD, 62), fill=CREAM)
    draw.text((82, 298), "Yaklaşık yüzey sıcaklıkları", font=font(SANS, 26), fill=MUTED)
    draw.text((82, 444), "VENÜS", font=font(SANS_BOLD, 20), fill=GOLD)
    draw.rounded_rectangle((82, 491, 982, 565), radius=14, fill=(255, 255, 255, 18))
    draw.rounded_rectangle((82, 491, 982, 565), radius=14, fill=(*CORAL, 220))
    draw.text((82, 586), "≈ 467°C", font=font(SERIF_BOLD, 43), fill=CREAM)
    draw.text((82, 660), "YÜZEY SICAKLIĞI · GÜNDÜZ", font=font(SANS_BOLD, 20), fill=BLUE)
    draw.rounded_rectangle((82, 707, 982, 781), radius=14, fill=(255, 255, 255, 18))
    draw.rounded_rectangle((82, 707, 912, 781), radius=14, fill=(*BLUE, 190))
    draw.text((82, 802), "≈ 430°C", font=font(SERIF_BOLD, 43), fill=CREAM)
    draw.rounded_rectangle((82, 928, 998, 1158), radius=20, fill=(255, 255, 255, 12), outline=(255, 255, 255, 35), width=2)
    centered(draw, "Venüs’ün yüzeyi, Merkür’ün gündüz", 980, font(SANS_BOLD, 24), CREAM)
    centered(draw, "yüzeyinden bile daha sıcaktır.", 1020, font(SANS_BOLD, 24), CREAM)


def make_answer(image, draw):
    draw.text((82, 216), "KISA CEVAP", font=font(SANS_BOLD, 20), fill=GOLD)
    paragraph(draw, "Belirleyici olan, atmosferin ısı üzerindeki etkisi.", (80, 278), font(SERIF_BOLD, 62), CREAM, 910, 1.24)
    draw.rounded_rectangle((82, 565, 998, 801), radius=26, fill=(245, 128, 93, 16), outline=(245, 128, 93, 78), width=2)
    paragraph(draw, "Venüs’ün yoğun atmosferi ısıyı hapseder ve yüzey sıcaklığını yaklaşık 467°C’ye çıkarır.", (126, 614), font(SANS_BOLD, 29), CREAM, 820, 1.45)
    draw.rounded_rectangle((82, 838, 998, 1074), radius=26, fill=(255, 255, 255, 12), outline=(255, 255, 255, 38), width=2)
    paragraph(draw, "Merkür Güneş’e daha yakın olsa da, gündüz yüzeyi yaklaşık 430°C’ye ulaşır.", (126, 888), font(SANS_BOLD, 29), CREAM, 820, 1.45)
    centered(draw, "Sonuç: Güneş’e yakınlık tek başına yeterli değil.", 1120, font(SANS_BOLD, 22), GOLD)


def make_sources(image, draw):
    draw.text((80, 210), "KAYNAKLAR", font=font(SERIF_BOLD, 70), fill=CREAM)
    draw.text((82, 304), "NASA Solar System Exploration", font=font(SANS, 25), fill=MUTED)
    draw.rounded_rectangle((80, 388, 1000, 600), radius=20, fill=(255, 255, 255, 12), outline=(255, 255, 255, 35), width=2)
    draw.text((116, 422), "VENÜS", font=font(SANS_BOLD, 19), fill=CORAL)
    draw.text((116, 468), "science.nasa.gov/venus/venus-facts/", font=font(SANS, 22), fill=CREAM)
    draw.rounded_rectangle((80, 630, 1000, 842), radius=20, fill=(255, 255, 255, 12), outline=(255, 255, 255, 35), width=2)
    draw.text((116, 664), "MERKÜR", font=font(SANS_BOLD, 19), fill=BLUE)
    draw.text((116, 710), "science.nasa.gov/mercury/facts/", font=font(SANS, 22), fill=CREAM)
    paragraph(draw, "Sıcaklıklar NASA’nın verdiği yaklaşık yüzey değerleridir.", (84, 899), font(SANS, 22), MUTED, 900)
    draw.line((82, 1000, 998, 1000), fill=(255, 255, 255, 48), width=1)
    centered(draw, "Başka hangi gezegen sorusunu açıklayalım?", 1040, font(SERIF_BOLD, 28), CREAM)
    centered(draw, "Yorumlara bırak.", 1091, font(SANS_BOLD, 24), CORAL)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    add_slide(1, "Uzay dosyası", 1, make_cover)
    add_slide(2, "Soru", 2, make_question)
    add_slide(3, "Merkür", 3, make_mercury)
    add_slide(4, "Venüs", 4, make_venus)
    add_slide(5, "Karşılaştırma", 5, make_comparison)
    add_slide(6, "Sonuç", 6, make_answer)
    add_slide(7, "Kaynaklar", 7, make_sources)

    caption = """Merkür, Venüs’ten daha yakında olmasına rağmen Güneş Sistemi’nin en sıcak gezegeni değildir. Bu unvan Venüs’e aittir.

NASA’nın verdiği yaklaşık değerlere göre Venüs’ün yüzey sıcaklığı 467°C’dir. Merkür’ün gündüz yüzeyi yaklaşık 430°C’ye ulaşabilir; atmosferi ısıyı tutamadığından gece sıcaklığı yaklaşık −180°C’ye kadar düşebilir. Venüs’ün yoğun atmosferi ise güçlü sera etkisiyle ısıyı hapseder.

Özetle, bir gezegenin sıcaklığını yalnızca Güneş’e uzaklığı belirlemez; atmosfer özellikleri de önemlidir.

Kaynaklar: NASA Solar System Exploration
Venüs: https://science.nasa.gov/venus/venus-facts/
Merkür: https://science.nasa.gov/mercury/facts/

Başka hangi gezegen sorusunu açıklayalım? Yorumlara bırak.

#uzay #bilim #astronomi #gezegenler #venüs #merkür #valexirion"""
    (OUT / "paylasim-aciklamasi.txt").write_text(caption, encoding="utf-8")

    with zipfile.ZipFile(OUT / "valexirion-venus-carousel.zip", "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(OUT.glob("*.png")):
            archive.write(path, path.name)
        archive.write(OUT / "paylasim-aciklamasi.txt", "paylasim-aciklamasi.txt")

    print(f"Created 7 Instagram slides at {OUT}")
    print(f"Canvas: {W}x{H} px; format: PNG")


if __name__ == "__main__":
    main()
