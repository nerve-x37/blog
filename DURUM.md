# DURUM — Valexirion Ajanları (devir teslim notu)

> Yeni bir sohbette bu dosyayı okut: **"C:\Users\olkan\Desktop\çıktılar\DURUM.md dosyasını oku ve kaldığımız yerden devam et."**

Son güncelleme: 29 Ekim 2026

## 1. Ne kuruldu

İki bağımsız ajan var. **LLM çıkarımı tamamen yerel** (bulut yok, abonelik yok, API anahtarı yok).
Buna karşılık araştırma (OpenAlex / Crossref / Wikipedia / DuckDuckGo / Wikimedia Commons)
ve seslendirme (Edge nöral TTS) **ağa çıkar**. Tam offline isteniyorsa TTS'i SAPI'ye sabitlemek
gerekir (bkz. §7/8).

| Ajan | Klasör | Ne yapar |
|---|---|---|
| **Blog ajanı** | `C:\Users\olkan\Desktop\çıktılar\blog-ajani` | Günlük, kaynaklı, SEO odaklı makale üretir; `blog` klasörüne yayınlar |
| **Video ajanı** | `C:\Users\olkan\Desktop\çıktılar\video-ajani` | 1080×1920 Reels üretir (senaryo + TTS + görsel + render) |

Blog sitesi: `C:\Users\olkan\Desktop\çıktılar\blog` (henüz yayında değil, canonical `https://valexirion.com`).

## 2. Model / sunucu durumu

- **LM Studio** kurulu · model: `qwen2.5-7b-instruct` (Q4_K_S, 4.46 GB, Apache 2.0)
- Sunucu **port 1235**'te çalışıyor (1234 değil!). Her iki ajanın `ayarlar.json` dosyası 1235'e ayarlı.
- Sunucu kapalıysa (model **mutlaka tek slot** yüklenmeli — 16K bağlam 4 slota bölününce istek başına ~4K kalıyor ve kaynak paketi bağlamı taşırıyor):
  ```bash
  "C:\Users\olkan\.lmstudio\bin\lms.exe" server start
  "C:\Users\olkan\.lmstudio\bin\lms.exe" load qwen2.5-7b-instruct --gpu 0.5 --parallel 1 --context-length 16384 -y
  ```
- Kontrol: `"C:\Users\olkan\.lmstudio\bin\lms.exe" ps` → PARALLEL **1**, CONTEXT **16384** olmalı.
- **Tek komutla denetim:** `node ajan.mjs --doktor` (blog ajanı) — Node sürümü, sunucu,
  yüklü bağlam, data.json indeksi, sitemap, bekleyen taslaklar, kilit ve disk durumunu raporlar.
- Ölçülen hız (tek slot): plan ~4 dk, bölüm ~2-3 dk, editör turu ~3 dk. Bir yazı toplam ~25 dk; video senaryosu 8-10 dk.
- Embedding modeli de var: `text-embedding-nomic-embed-text-v1.5` (ajanlar kullanmıyor).
- Ollama kurulu (gemma3:4b, llama3.2) ama **kullanılmıyor**; kullanıcı silmeyi düşünüyordu.

## 3. Komutlar

### Blog ajanı
```bash
cd "C:\Users\olkan\Desktop\çıktılar\blog-ajani"
node ajan.mjs --modeller     # sunucu/model kontrolü
node ajan.mjs --onizleme     # üret, yayınlama (tarayıcıda açar)
node ajan.mjs --onay         # üret + editör + yayın izni sor
node ajan.mjs --onayla       # kuyruktaki taslağı yayınla (önce yeniden denetler)
node ajan.mjs --denetle      # taslağı SEO kapısı + denetçi katmanla ölç
node ajan.mjs --onar         # taslağı onar (tekrar/link/kelime)
node ajan.mjs --bekleyenler  # taslak listesi
node ajan.mjs --kuru         # model olmadan hat testi
node ajan.mjs --durum        # son yayın, havuz
node ajan.mjs --doktor       # kurulum/sunucu/indeks denetimi
node test.mjs                # 27 birim testi (model ve ağ gerekmez)
node sohbet.mjs              # konuşma terminali (sohbet-baslat.cmd ile çift tık)
```

### Video ajanı
```bash
cd "C:\Users\olkan\Desktop\çıktılar\video-ajani"
node ajan.mjs --demo         # model gerekmez, hazır senaryoyla video
node ajan.mjs --liste        # 18 konuluk havuz
node ajan.mjs --lisans       # izinli/engelli klasörler
node ajan.mjs --muzik        # müzik kataloğu (onaylı / onay bekleyen)
node ajan.mjs --muzik-onayla "parca.mp3" --muzik-kaynak "Pixabay" --muzik-lisans "Pixabay Content License" --muzik-url "https://..."
node ajan.mjs --muzik-reddet "parca.mp3"
node ajan.mjs --konu "okyanus asitlenmesi"
node ajan.mjs                # havuzdan rastgele
```

## 4. Mimari (kısa)

### Blog
`konu → araştırma (İngilizce terim + alaka filtresi) → plan (LLM) → 5 bölüm ayrı ayrı →
iç link tamamlama → tekrar cümle temizliği → uydurma sayı denetimi (varlık + birim/yıl bağlamı) →
editör ajanı (kaynak özetleriyle puanla + paragraf düzelt) → son tekrar/link geçişi →
SEO kapısı → denetçi katman (kaynak-alaka, atıf-kaynak eşleşmesi, veri yoğunluğu,
başlık çeşitliliği, slug) → şablon → yedek + data.json + sitemap + günlük`

Kalite kapısı: ≥1100 kelime (tekrar cümleler çıkarıldıktan sonra), ≥4 kaynak,
başlıkta anahtar kelime, ≥3 H2, ≥2 **yayında olan sayfaya** iç link,
kaynakça aralığında atıf, editör puanı ≥80, doğrulanamayan sayı oranı ≤%30,
birim uyuşmazlığı <2.

Denetçi katman (`lib/denetim.mjs`, kural tabanlı — LLM değil): kaynakların en az
%70'i konuyla kesişmeli, atıf verilen kaynağın **kendi metninde** sayı bulunmalı,
slug bağlaçla bitmemeli, iki H2 birbirinin kopyası olmamalı.

### Video
`konu → araştırma → senaryo (6-8 sahne) → sayı denetimi → TTS (Edge nöral TR) →
lisans kontrolü → görsel seçimi (yerel Pexels/Pixabay + Commons) →
**onaylı** müzik (muzik-lisanslari.json) → Remotion render → ffmpeg (-14 LUFS, faststart) →
mp4 + kapak + caption + kaynaklar + lisanslar`

## 5. Önemli kararlar / kurallar

- **Telif kalkanı:** `video-ajani/lisanslar.json` — listede olmayan klasör **engelli**.
  `blog/img` engelli (kaynağı belirsiz). Wikimedia Commons'tan sadece CC0/CC BY/CC BY-SA indirir.
- **Müzik kalkanı:** klasör beyanı yetmez; her parça `video-ajani/muzik-lisanslari.json`
  içinde tek tek onaylanır (`dogrulandi: true`). Onaysız parça videoda **kullanılmaz**.
- **Uydurma veri yasağı:** her sayı kaynak paketinde olmalı (varlık) **ve** birimi/yılı tutmalı
  (bağlam); `lib/dogrulama.mjs` iki katmanı da denetler.
- **Kaynak-alaka yasağı:** akademik sorgular `konular.json`'daki hazır İngilizce terimlerden
  seçilir; çeviri yalnızca son çare ve loglanır. Konuyla kesişmeyen kaynak elenir
  (`lib/arastirma.mjs`), karar yayın öncesi `lib/denetim.mjs` ile yeniden ölçülür.
- **Tekrar yasağı:** aynı/neredeyse aynı cümle ikinci kez geçemez. Kelime kapısı,
  tekrar cümleler çıkarıldıktan sonraki **toplam** kelimeyi ölçer (benzersiz kelime
  dağarcığını değil) — önceki sürümde bu yanlış yazılmıştı.
- **İç link disiplini:** yalnızca yayında olan sayfalara bağlantı verilir; kendi sayfasına link sayılmaz.
- **Eşzamanlılık:** blog ve video ajanı ortak kilit kullanır (`blog-ajani/cikti/.kilit.json`).
- **Yayın güvenliği:** ön kontrol → yedek (`cikti/yedek/`, son 20) → HTML → data.json;
  indeks yazılamazsa HTML eski hâline döner.
- **İnsan onayı:** `/yaz` doğrudan yayınlamaz, taslak + puan verir. **Otomasyon da yayınlamaz**:
  `gorev-kur.ps1` artık `--onay` ile çalışır, yalnızca taslak üretir.
- **Tasarım:** blog sayfaları `blog/vahsi-yasam.html` iskeletinden üretilir; video tasarımı `remotion/src` içinde.
- **Dil/üslup:** Türkçe, dergi kalitesi, sansasyon yok. Persona: `blog-ajani/agents/blog-yazari.md`.

## 6. Mevcut durum

- ✅ Video ajanı uçtan uca çalışıyor; örnek çıktı:
  `video-ajani/cikti/okyanuslar-ve-gorunmeyen-sinir-2026-10-29/` (50.4 sn, 34 MB, 5 sahne)
- ✅ **İlk gerçek blog yazısı üretildi** (29 Ekim 16:48) — onay bekliyor, yayınlanmadı:
  - *2026'da Kuantum Bilgisayarlar: Hata Düzeltme Eşiği ve Uygulama*
  - İlk hâli **kapıyı geçemiyordu**: 1117 kelimenin 191'i tekrar, 4 iç linkin yalnızca 1'i geçerli.
  - `--onar` ile düzeltildi: **1371 kelime · 0 tekrar · 2 geçerli iç link · 11 atıf · 85/100**.
  - `--denetle` → ✓ kalite kapısı geçiyor (uyarı yok). Yayın için hâlâ insan kararı bekliyor.
  - Kuyruk: `blog-ajani/cikti/bekleyen/2026-da-kuantum-bilgisayarlar-hata-duzeltme-esigi-ve.json`
  - Önizleme: `blog/_onizleme.html`
  - Yayınlamak için: `node ajan.mjs --onayla` · Reddetmek için: `node ajan.mjs --reddet`
- ⏳ İlk gerçek video hâlâ denenmedi (yalnızca `--demo` çıktısı var)
- ⏳ Günlük otomasyon (Görev Zamanlayıcı) **kurulmadı** — `gorev-kur.ps1` hazır bekliyor
  (artık taslak üretir, yayınlamaz)
- ⏳ `durum.json` hâlâ boş; yayınlanmış yazı yok
- ✅ **İkinci düzeltme turu tamamlandı** (29 Ekim): tekrar temizliği, iç link doğrulama,
  sayı bağlam denetimi, kilit, yayın yedeği, `--doktor`, müzik kataloğu, otomasyon onayı.
  `node test.mjs` → **27/27 test geçiyor**; `--kuru` ve `--doktor` uçtan uca doğrulandı.
- ⚠️ Müzik kataloğu boş: 65 parçanın **hiçbiri** henüz onaylı değil. Onaylanana kadar
  videolar müziksiz üretilir (bilinçli güvenlik davranışı).

## 7. Bilinen eksikler / sıradaki işler

1. **Taslağı yayınla veya reddet** — kuyrukta bekleyen yazı artık kapıyı geçiyor
   (`--denetle` ✓). Yayınla (`--onayla`) ya da reddet (`--reddet`). Hâlâ ilk iş.
   Not: metin mekanik olarak temiz ama 7B modelin ürettiği bazı bölümler (ör. “Kişisel Etkenler”)
   içerik olarak sığ; yayınlamadan önce bir kez okunmalı.
2. **Müzik parçalarını onayla** — 65 dosya onay bekliyor. `node ajan.mjs --muzik` ile listele,
   `--muzik-onayla` ile kaynak/lisans yaz. Onaylanana kadar videolar müziksiz üretilir.
3. **Bir sonraki gerçek üretimde ölçüm** — 27 test ve `--kuru` geçiyor; tekrar temizliğinin ve
   iç link kapısının gerçek uzun yazıda kaç cümle/link düzelttiği loglardan izlenmeli.
4. **İlk gerçek video** — demo dışında ilk konu; asıl darboğaz render süresi ve TTS kalitesi.
5. **Altyazı yakılmıyor** — kelime kelime altyazı eklenebilir (Reels'te en yüksek getirili eksik).
6. **AE / Kdenlive entegrasyonu yok** — bilinçli olarak ertelendi; Remotion işi bitiriyor.
   Marka jeneriği için `aerender`, uzun kurgu için `melt` ikinci faz olabilir.
7. **Font** — videoda Georgia (sistem fontu); marka için açık lisanslı fontlara geçilebilir.
8. **`blog/img`** — kullanıcının kendi çekimleri ayıklanıp izinli listeye alınabilir.
9. **TTS dış bağımlılığı** — Edge TTS metni Microsoft'a gönderiyor; tam offline için SAPI'ye
   geçilebilir (`ses.mjs` içinde yedek olarak zaten çalışıyor, varsayılan yapılabilir).
10. **Ollama** — kullanılmıyor, silinebilir (~8 GB kazanç).

## 8. Kullanıcı tercihleri

- Türkçe konuşur, kısa-net cevap sever, "yap" dediğinde işi bitirmeni bekler
- Instagram: **43 bin takipçili** bilim/çevre hesabı; manuel paylaşım yapıyor
- Emekli/paylaşım otomasyonu istemiyor (Graph API gerekmiyor)
- Kanal konuları: uzay, doğa, yaşam biçimi, ekonomi modelleri, spor, hayvanlar, tarih, biyografi, ülke/coğrafya
- Videolar **gerçek veri** içermeli, kaynak ekranda görünmeli

## 9. Bilgisayar

Windows 10 · 16 GB RAM · 8 çekirdek · GTX 1050 Ti (4 GB) · Node 24 · disk ~45 GB boş
Araçlar: VS Code (Claude + Remotion eklentileri), AE 2024 (`aerender`), Kdenlive (`melt`), ffmpeg (Documents), LM Studio

## 10. 29 Ekim 2026 — giderilen hatalar

Blog ajanı ilk kez gerçek üretim yaptı; çıkan hatalar düzeltildi.

| # | Hata | Düzeltme |
|---|---|---|
| 1 | `--onay` çöküyordu: `Failed to parse URL from undefined/chat/completions` — LLM fonksiyonları model bloğu beklerken tam yapılandırma geçiliyordu | `lib/llm.mjs` → `modelAyari()` normalleştirici; çağrı yerleri `ayar.model` geçiyor |
| 2 | Yanıt ~5. dakikada `fetch failed` ile düşüyordu | Yanıtlar **akış (stream)** modunda okunuyor; `zamanAsimiMs` 300000 → 900000; başarısız denemeler loglanıyor |
| 3 | 16K bağlam 4 slota bölünüyordu (istek başına ~4K) | Model `--parallel 1 --context-length 16384` ile yükleniyor |
| 4 | Editör `<p>` dışı metni siliyordu (896 → **100 kelime**) | `lib/editor.mjs` → `duzeltmeleriUygula` konum bazlı değiştirme |
| 5 | Model `<p>` etiketi yazmıyordu | `ajan.mjs` → `paragraflaraSar()` |
| 6 | SEO kapısı `[BAĞLANTI:` işaretini yasaklıyor, iç link sayısını aynı işaretten sayıyordu | `lib/seo.mjs`: geçerli işaret sayımı + bozuk işaret kontrolü |
| 7 | Onarım çağrısı başlığı 29 karaktere kısaltıp kapıyı düşürüyordu | `lib/seo.mjs` → `alanlariOnar()` + `SINIRLAR` sabitleri |
| 8 | 1100 kelime kapısı geçilemiyordu | Bölüm başına dinamik kelime hedefi + `ekBolumYaz()` genişletme geçişi |
| 9 | İç link hiç üretilmiyordu | Promptta aday listesi (önce aynı kategori) + `icLinkTamamla()` yedeği |
| 10 | Anahtar kelime virgüllü liste dönüyordu | İlk öbek alınıyor |
| 11 | Slug bozuktu (`kvantumbilgisayarlar`) | Slug başlıktan türetiliyor: `slugla(baslik)` |
| 12 | Uzun `altBaslik` `<title>` ve H1'i şişiriyordu | `lib/sablon.mjs`: 8 kelimeden uzun alt başlık title'a girmiyor |

Doğrulama: `--kuru`, `--modeller`, birim testleri (editör metin koruma, SEO işaret sayımı, alan onarımı) ve üç tam üretim koşusu.

## 11. 29 Ekim 2026 — ikinci tur (kalite sertleştirme)

| # | Sorun | Düzeltme |
|---|---|---|
| 1 | Kelime kapısı tekrar cümlelerle aşılabiliyordu; 6 uzun cümle birebir tekrar ediyordu | `lib/tekrar.mjs`: cümle düzeyinde tekrar/benzerlik temizliği; başlıklar ve HTML korunur; kapı **benzersiz** kelimeyi ölçer |
| 2 | İç link kapısı yayında olmayan hedefleri sayıyordu; şablon onları düz metne çevirince sayfada 0 link kalabiliyordu | `dogrula(..., {mevcutSluglar})` yalnızca gerçek hedefleri sayar; kendi sayfasına link sayılmaz; `icLinkTamamla` yalnızca yayındaki yazılardan seçer |
| 3 | Sayı denetimi yalnızca "sayı kaynakta geçiyor mu" bakıyordu | Varlık + **birim/yıl bağlamı** iki katman; milyon↔milyar, %↔derece karışmaları yakalanır |
| 4 | Kaynakça dışı atıf (`[9]`, 4 kaynak) kırık bağlantı üretiyordu | Atıf aralığı kapısı; aralıklı atıflar (`[2-4]`) tek tek açılır |
| 5 | `yazJson` klasör oluşturmuyordu; temiz kurulumda ilk yayın arşiv yazımında düşerdi | `yazJson` artık dizini oluşturur (testte yakalandı) |
| 6 | Yayında önce HTML yazılıyor, kayıt çakışması sonra fırlatılıyordu → yarım yayın | Ön kontrol → yedek → HTML → data.json; indeks yazılamazsa HTML geri alınır |
| 7 | İki ajan aynı model slotuna aynı anda vurabiliyordu | Ortak `lib/kilit.mjs` (PID + bayat kilit devralma); blog ve video aynı kilidi kullanır |
| 8 | `durum.json` atomik yazılmıyordu | `yazJson` ile atomik |
| 9 | Otomasyon doğrudan yayınlıyordu; "insan onayı" kuralıyla çelişiyordu | `gorev-kur.ps1` artık `--onay` ile çalışır; günde tek taslak (`sonTaslakTarihi`) |
| 10 | Müzik lisansı yalnızca klasör beyanına bağlıydı | `muzik-lisanslari.json` kataloğu + `--muzik / --muzik-onayla / --muzik-reddet`; onaysız parça kullanılmaz |
| 11 | "Tamamen yerel" iddiası yanlıştı | DURUM.md düzeltildi: LLM yerel; araştırma ve TTS ağa çıkar |
| 12 | Kurulum/indeks sorunları ancak üretim sırasında görülüyordu | `--doktor`: Node, sunucu, bağlam, data.json↔dosya tutarlılığı, sitemap, kilit, disk |
| 13 | Onay (`--onayla`) kalite kapısını atlıyordu; eski bir taslak sessizce yayına geçebilirdi | Onay öncesi yeniden doğrulama; geçmezse yayın durur, `--onar` / `--reddet` önerir |
| 14 | Model, konuyla ilgisiz iç bağlantı seçiyordu (kuantum yazısında “vahşi yaşam”) | Aday listesi başlık benzerliğine göre sıralanır; alakasız yayınlar listeye girmez; `--onar` eski alakasız linkleri çıkarır |
| 15 | Kilit dosyası süreç bittikten sonra da kalabiliyordu (sonraki çalıştırmayı kilitliyordu) | Kilit artık iş bitince açıkça bırakılır (`finally`); çıkış yakalayıcısı yalnızca yedek |
| 16 | `--kuru` çalıştırması gerçek taslağın `_onizleme.html` dosyasını eziyordu | Kuru çalıştırma artık `_kuru-onizleme.html` yazar |

Doğrulama: `node test.mjs` → **27/27** (tekrar, iç link, atıf aralığı, sayı bağlamı, kilit,
yayın güvenliği, alan onarımı); `node ajan.mjs --kuru`, `--doktor`, `--denetle`, `--onar` ve
video ajanının müzik komutları uçtan uca çalıştı. Kilit, süreç bittikten sonra dosya bırakmıyor.

Bilinçli davranış değişiklikleri:

- Müzik kataloğu boş olduğu için videolar **şimdilik müziksiz** üretilir (onaylayınca düzelir).
- `--onayla` artık varsayılan olarak üzerine yazmaz; mevcut dosya varsa `--zorla` ister.
- Günlük otomasyon yalnızca taslak üretir; yayın insan onayıyla yapılır.
