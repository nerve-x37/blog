(function () {
  var content = document.querySelector('.article-content');
  var filename = decodeURIComponent(window.location.pathname.split('/').pop() || '');
  if (!content || !filename || document.body.getAttribute('data-page-category') !== 'belgesel') return;

  fetch('data.json')
    .then(function (response) {
      if (!response.ok) throw new Error('data.json yüklenemedi (' + response.status + ')');
      return response.json();
    })
    .then(function (data) {
      var article = (data.articles || []).find(function (item) {
        return item.category === 'belgesel' && item.href === filename;
      });
      if (!article) throw new Error('Belgesel kaydı bulunamadı: ' + filename);

      var section = document.createElement('section');
      section.className = 'documentary-detail';

      var rating = document.createElement('p');
      rating.className = 'documentary-rating';
      var ratingLabel = document.createElement('strong');
      ratingLabel.textContent = article.imdbRating
        ? 'IMDb izleyici puanı: ' + article.imdbRating.replace('.', ',') + '/10 · '
        : 'IMDb izleyici puanı henüz listelenmiyor · ';
      rating.appendChild(ratingLabel);

      var ratingLink = document.createElement('a');
      ratingLink.href = article.imdbId
        ? 'https://www.imdb.com/title/' + article.imdbId + '/'
        : 'https://www.imdb.com/find/?q=' + encodeURIComponent(article.title);
      ratingLink.target = '_blank';
      ratingLink.rel = 'noopener noreferrer';
      ratingLink.textContent = 'güncel puanı ve oy sayısını IMDb’de gör';
      rating.appendChild(ratingLink);

      var ratingNote = document.createElement('p');
      ratingNote.className = 'documentary-rating-note';
      ratingNote.textContent = 'IMDb puanı izleyici oylarının ortalamasıdır; zamanla değişebilir ve tek başına bir kalite ölçütü değildir.';

      var meaningHeading = document.createElement('h2');
      meaningHeading.textContent = 'İzleyiciye ne düşündürüyor?';
      var meaning = document.createElement('p');
      meaning.textContent = article.meaning;

      section.appendChild(rating);
      section.appendChild(ratingNote);
      section.appendChild(meaningHeading);
      section.appendChild(meaning);
      content.appendChild(section);
    })
    .catch(function (error) {
      console.error('[Valexirion] Belgesel ayrıntıları yüklenemedi:', error);
    });
})();
