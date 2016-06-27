'use strict';
(function() {
  var picturesContainer = document.querySelector('.pictures');
  var filtersContainer = document.querySelector('.filters');
  var templateElement = document.querySelector('template');
  var elementToClone;
  var pictures = [];

  filtersContainer.classList.add('hidden');

  if ('content' in templateElement) {
    elementToClone = templateElement.content.querySelector('.picture');
  } else {
    elementToClone = templateElement.querySelector('.picture');
  }

  /** @constant {number} */
  var XHR_LOAD_TIMEOUT = 10000;
  /** @constant {string} */
  var PICTURES_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json';

  /**
   * @param {Object} data
   * @param {HTMLElement} container
   * @return {HTMLElement}
   */
  var getPictureElement = function(data, container) {
    var element = elementToClone.cloneNode(true);
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;
    var photo = element.querySelector('img');
    var image = new Image();
    image.onload = function() {
      photo.setAttribute('src', data.url);
      photo.setAttribute('width', '182');
      photo.setAttribute('height', '182');
    };
    image.onerror = function() {
      element.classList.add('picture-load-failure');
    };
    image.src = data.url;
    container.appendChild(element);
    return element;
  };

  /** @param {function(Array.<Object>)} callback */
  var getPictures = function(callback) {
    var xhr = new XMLHttpRequest();

    picturesContainer.classList.add('pictures-loading');

    function errorHandler() {
      picturesContainer.classList.remove('pictures-loading');
      picturesContainer.classList.add('pictures-failure');
    }

    xhr.onerror = errorHandler;
    xhr.ontimeout = errorHandler;
    xhr.onload = function(evt) {
      var request = evt.target;
      picturesContainer.classList.remove('pictures-loading');
      if(request.status === 200) {
        var loadedData = JSON.parse(request.response);
        callback(loadedData);
      }
    };

    xhr.timeout = XHR_LOAD_TIMEOUT;
    xhr.open('GET', PICTURES_LOAD_URL);
    xhr.send();
  };

  /** @param {Array.<Object>} loadedPictures */
  var renderPictures = function(loadedPictures) {
    picturesContainer.innerHTML = '';
    loadedPictures.forEach(function(picture) {
      getPictureElement(picture, picturesContainer);
    });
  };

  /**
   * @param {Array.<Object>} loadedPictures
   * @param {string} filter
   */
  var getFilteredPictures = function(loadedPictures, filter) {
    var picturesToFilter = loadedPictures.slice(0);
    switch (filter) {
      case 'popular':
        // Cписок фотографий, в том виде, в котором он был загружен
        // Пока оставила кейс, вдруг дальше пригодится
        break;
      case 'new':
        // Cписок фотографий, сделанных за последние четыре дня, отсортированные по убыванию даты
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setDate(today.getDate() - 4);
        var currentDate;
        var filterPictures = picturesToFilter.filter(function(picture) {
          currentDate = new Date(picture.date);
          currentDate.setHours(0, 0, 0, 0);
          return currentDate >= today;
        });
        filterPictures.sort(function(a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        picturesToFilter = filterPictures;
        break;
      case 'discussed':
        // Cписок фотографий, отсортированные по убыванию количества комментариев
        picturesToFilter.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    return picturesToFilter;
  };

  /** @param {string} filter */
  var setFilterEnabled = function(filter) {
    var filteredPictures = getFilteredPictures(pictures, filter);
    if(filteredPictures.length <= 0) {
      picturesContainer.classList.add('pictures-empty');
    } else {
      picturesContainer.classList.remove('pictures-empty');
    }
    renderPictures(filteredPictures);
  };

  var setFiltrationEnabled = function() {
    var filters = filtersContainer.querySelectorAll('.filters-radio');
    filters.forEach(function(filter) {
      // Дополнительное задание раз
      var filteredPictures = getFilteredPictures(pictures, filter.value);
      var picturesCount = filteredPictures.length;
      filter.nextElementSibling.innerHTML += '<sup>(' + picturesCount + ')</sup>';
      // Дополнительное задание два
      if(picturesCount <= 0) {
        filter.setAttribute('disabled', true);
        filter.nextElementSibling.style.opacity = 0.5;
      }
      filter.onchange = function(evt) {
        setFilterEnabled(evt.target.value);
      };
    });
    filtersContainer.classList.remove('hidden');
  };

  getPictures(function(loadedPictures) {
    pictures = loadedPictures;
    setFiltrationEnabled();
    renderPictures(pictures);
  });
})();
