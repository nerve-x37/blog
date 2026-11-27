(function () {
  var container = document.getElementById('documentary-list');
  var subcategory = document.body.getAttribute('data-documentary-subcategory');
  if (!container || !subcategory) return;

  fetch('data.json')
    .then(function (response) {
      if (!response.ok) throw new Error('data.json yüklenemedi (' + response.status + ')');
      return response.json();
    })
    .then(function (data) {
      var articles = (data.articles || []).filter(function (article) {
        return article.category === 'belgesel' && article.subcategory === subcategory;
      });

      if (!articles.length) {
        var empty = document.createElement('p');
        empty.className = 'documentary-empty';
        empty.textContent = 'Bu kategoride henüz belgesel bulunmuyor.';
        container.appendChild(empty);
        return;
      }

      articles.forEach(function (article) {
        var card = document.createElement('article');
        card.className = 'documentary-card';

        var link = document.createElement('a');
        link.href = article.href;

        var image = document.createElement('img');
        setConsentAwareImageSource(image, article.img);
        image.alt = article.title;
        image.loading = 'lazy';
        if (article.imgWidth > 0 && article.imgHeight > 0) {
          image.width = article.imgWidth;
          image.height = article.imgHeight;
        }

        var body = document.createElement('div');
        body.className = 'documentary-card-body';

        var category = document.createElement('span');
        category.className = 'documentary-card-category';
        category.textContent = article.badge || 'Belgesel';

        var title = document.createElement('h2');
        title.textContent = article.title;

        var excerpt = document.createElement('p');
        excerpt.textContent = article.excerpt;

        var rating = document.createElement('p');
        rating.className = 'documentary-card-rating';
        rating.textContent = article.year + ' · ';
        if (article.imdbRating) {
          rating.appendChild(document.createTextNode('IMDb: ' + article.imdbRating.replace('.', ',') + '/10 · '));
        } else {
          rating.appendChild(document.createTextNode('IMDb puanı henüz listelenmiyor · '));
        }

        var ratingLink = document.createElement('a');
        ratingLink.href = article.imdbId
          ? 'https://www.imdb.com/title/' + article.imdbId + '/'
          : 'https://www.imdb.com/find/?q=' + encodeURIComponent(article.title);
        ratingLink.target = '_blank';
        ratingLink.rel = 'noopener noreferrer';
        ratingLink.textContent = 'IMDb’de gör';
        rating.appendChild(ratingLink);

        body.appendChild(category);
        body.appendChild(title);
        body.appendChild(excerpt);
        body.appendChild(rating);
        link.appendChild(image);
        link.appendChild(body);
        card.appendChild(link);
        container.appendChild(card);
      });
    })
    .catch(function (error) {
      console.error('[Valexirion] Belgesel kategorisi yüklenemedi:', error);
    });
})();
