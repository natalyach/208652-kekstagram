'use strict';
(function() {
  var picturesContainer = document.querySelector('.pictures');
  var filtersContainer = document.querySelector('.filters');
  var templateElement = document.querySelector('template');
  var elementToClone;

  filtersContainer.classList.add('hidden');

  if ('content' in templateElement) {
    elementToClone = templateElement.content.querySelector('.picture');
  } else {
    elementToClone = templateElement.querySelector('.picture');
  }

  /** @type {Array.<Object>} */
  var pictures = [];

  /** @type {Array.<Object>} */
  var filteredPictures = [];

  /** @constant {number} */
  var XHR_LOAD_TIMEOUT = 10000;

  /** @constant {string} */
  var PICTURES_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json';

  /** @constant {number} */
  var PAGE_SIZE = 12;

  /** @type {number} */
  var pageNumber = 0;

  /** @constant {number} */
  var THROTTLE_DELAY = 100;

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

  /**
   * @param {Array.<Object>} loadedPictures
   * @param {number} page
   * @param {boolean=} replace
   */
  var renderPictures = function(loadedPictures, page, replace) {
    if (replace) {
      picturesContainer.innerHTML = '';
    }

    var from = page * PAGE_SIZE;
    var to = from + PAGE_SIZE;

    loadedPictures.slice(from, to).forEach(function(picture) {
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
      case 'new':
        // Cписок фотографий, сделанных за последние n дня, отсортированные по убыванию даты
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setDate(today.getDate() - 10);
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
    filteredPictures = getFilteredPictures(pictures, filter);
    if(filteredPictures.length <= 0) {
      picturesContainer.classList.add('pictures-empty');
    } else {
      picturesContainer.classList.remove('pictures-empty');
    }
    pageNumber = 0;

    renderPictures(filteredPictures, pageNumber, true);

    while (isBottomReached() && isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
      pageNumber++;
      renderPictures(filteredPictures, pageNumber, false);
    }
  };

  var setFiltrationEnabled = function() {
    filtersContainer.addEventListener('change', function(evt) {
      if (evt.target.classList.contains('filters-radio')) {
        setFilterEnabled(evt.target.value);
      }
    });
    var filters = filtersContainer.querySelectorAll('.filters-radio');
    for(var i = 0; i < filters.length; i++) {
      var filter = filters[i];
      // Дополнительное задание раз: выводим кол-во картинок попавших под фильтр
      var tmpFilteredPictures = getFilteredPictures(pictures, filter.value);
      var picturesCount = tmpFilteredPictures.length;
      filter.nextElementSibling.innerHTML += '<sup>(' + picturesCount + ')</sup>';
      // Дополнительное задание два: если по фильтру нет результатов, то дизаблим фильтр
      if(picturesCount <= 0) {
        filter.setAttribute('disabled', true);
        filter.nextElementSibling.style.opacity = 0.5;
      }
    }
    filtersContainer.classList.remove('hidden');
  };

  /** @return {boolean} */
  var isBottomReached = function() {
    var GAP = 100;
    var picturesPosition = picturesContainer.getBoundingClientRect();
    return picturesPosition.bottom - window.innerHeight - GAP <= 0;
  };

  /**
   * @param {Array} loadedPictures
   * @param {number} page
   * @param {number} pageSize
   * @return {boolean}
   */
  var isNextPageAvailable = function(loadedPictures, page, pageSize) {
    return page < Math.floor(loadedPictures.length / pageSize);
  };

  var setScrollEnabled = function() {
    var lastCall = Date.now();
    window.addEventListener('scroll', function() {
      if (Date.now() - lastCall >= THROTTLE_DELAY) {
        if (isBottomReached() && isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
          pageNumber++;
          renderPictures(filteredPictures, pageNumber, false);
        }
        lastCall = Date.now();
      }
    });
  };

  window.addEventListener('load', function() {
    getPictures(function(loadedPictures) {
      pictures = loadedPictures;
      setFiltrationEnabled();
      setFilterEnabled('popular');
      setScrollEnabled();
    });
  });
})();
