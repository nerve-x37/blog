(function () {
  var category = document.body.getAttribute('data-page-category');
  var container = document.getElementById('category-articles');
  var count = document.getElementById('category-count');
  var searchInput = document.getElementById('category-search');
  var noResults = document.getElementById('category-no-results');
  var labels = {
    bilim: 'Bilim',
    tarih: 'Tarih',
    sinema: 'Sinema',
    muzik: 'Müzik',
    felsefe: 'Felsefe',
    belgesel: 'Belgesel',
    doga: 'Doğa',
    teknoloji: 'Teknoloji'
  };

  if (!container || !count || !searchInput || !noResults || !labels[category]) return;

  function showError(error) {
    console.error('[Valexirion] Kategori yazıları yüklenemedi:', error);
    searchInput.disabled = true;
    count.textContent = 'Yazılar şu anda yüklenemiyor. Lütfen sayfayı yenileyin.';
    count.setAttribute('role', 'alert');
  }

  fetch('data.json')
    .then(function (response) {
      if (!response.ok) throw new Error('data.json yüklenemedi (' + response.status + ')');
      return response.json();
    })
    .then(function (data) {
      var articles = (data.articles || []).filter(function (article) {
        return article.category === category;
      });

      count.textContent = articles.length + ' yazı';

      if (!articles.length) {
        searchInput.disabled = true;
        count.textContent = 'Bu kategoride henüz yazı bulunmuyor.';
        return;
      }

      var cards = [];

      articles.forEach(function (article) {
        var card = document.createElement('article');
        card.className = 'documentary-card';
        card.setAttribute(
          'data-search-text',
          [
            article.title || '',
            article.excerpt || '',
            article.badge || '',
            labels[category]
          ].join(' ').toLocaleLowerCase('tr')
        );

        var link = document.createElement('a');
        link.href = article.href;

        var image = document.createElement('img');
        image.src = article.img;
        image.alt = article.title || '';
        image.loading = 'lazy';
        image.decoding = 'async';

        var body = document.createElement('div');
        body.className = 'documentary-card-body';

        var label = document.createElement('span');
        label.className = 'documentary-card-category';
        label.textContent = article.badge || labels[category];

        var title = document.createElement('h2');
        title.textContent = article.title || 'Başlıksız yazı';

        var excerpt = document.createElement('p');
        excerpt.textContent = article.excerpt || '';

        body.appendChild(label);
        body.appendChild(title);
        if (excerpt.textContent) body.appendChild(excerpt);
        link.appendChild(image);
        link.appendChild(body);
        card.appendChild(link);
        container.appendChild(card);
        cards.push(card);
      });

      function filterArticles() {
        var query = searchInput.value.trim().toLocaleLowerCase('tr');
        var visible = 0;

        cards.forEach(function (card) {
          var matches = !query || card.getAttribute('data-search-text').indexOf(query) !== -1;
          card.classList.toggle('hidden', !matches);
          if (matches) visible++;
        });

        count.textContent = query
          ? visible + ' / ' + articles.length + ' yazı'
          : articles.length + ' yazı';
        noResults.textContent = query
          ? '“' + searchInput.value.trim() + '” için sonuç bulunamadı.'
          : '';
        noResults.classList.toggle('hidden', visible > 0);
      }

      searchInput.addEventListener('input', filterArticles);
    })
    .catch(showError);
})();
