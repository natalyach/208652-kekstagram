'use strict';

require('./upload');

/** @type {Object} */
var utils = require('./utils');

/** @type {Object} */
var pictureObj = require('./picture/picture');

/** @type {HTMLElement} */
var picturesContainer = document.querySelector('.pictures');

/** @type {HTMLElement} */
var filtersContainer = document.querySelector('.filters');

/** @type {Array.<Object>} */
var pictures = [];

/** @type {Array.<Object>} */
var filteredPictures = [];

/** @type {number} */
var pageNumber = 0;

/** @constant {number} */
var THROTTLE_DELAY = 100;

/**
 * Инициализация выбранного фильтра
 * @param {string} filter
 */
var setFilterEnabled = function(filter) {
  filteredPictures = pictureObj.getFilteredPictures(pictures, filter);
  if(filteredPictures.length <= 0) {
    picturesContainer.classList.add('pictures-empty');
  } else {
    picturesContainer.classList.remove('pictures-empty');
  }
  pageNumber = 0;
  pictureObj.renderPictures(filteredPictures, pageNumber, true);
  while (utils.isBottomReached(picturesContainer) && utils.isNextPageAvailable(pictures, pageNumber)) {
    pageNumber++;
    pictureObj.renderPictures(filteredPictures, pageNumber, false);
  }
};

/**
 * Инициализация фильтрации
 */
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
    var tmpFilteredPictures = pictureObj.getFilteredPictures(pictures, filter.value);
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

/**
 * Подгрузка фотограция при прокрутки страницы
 */
var setScrollEnabled = function() {
  var lastCall = Date.now();
  window.addEventListener('scroll', function() {
    if (Date.now() - lastCall >= THROTTLE_DELAY) {
      if (utils.isBottomReached(picturesContainer) && utils.isNextPageAvailable(pictures, pageNumber)) {
        pageNumber++;
        pictureObj.renderPictures(filteredPictures, pageNumber, false);
      }
      lastCall = Date.now();
    }
  });
};

filtersContainer.classList.add('hidden');

window.addEventListener('load', function() {
  pictureObj.getPictures(function(loadedPictures) {
    pictures = loadedPictures;
    setFiltrationEnabled();
    setFilterEnabled('popular');
    setScrollEnabled();
  });
});
