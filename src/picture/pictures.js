'use strict';

var utils = require('../utils');
var Picture = require('./picture');

/** @type {Array.<Photo>} */
var renderedPictures = [];

/** @type {HTMLElement} */
var picturesContainer = document.querySelector('.pictures');

/** @constant {number} */
var XHR_LOAD_TIMEOUT = 10000;

/** @constant {string} */
var PICTURES_LOAD_URL = 'https://o0.github.io/assets/json/pictures.json';

module.exports = {
  /**
   * Получение списка картинок с сервера
   * @param {function(Array.<Object>)} callback
   */
  getPictures: function(callback) {
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
  },

  /**
   * Рендер картинок на странице
   * @param {Array.<Object>} loadedPictures
   * @param {number} page
   * @param {boolean=} replace
   */
  renderPictures: function(loadedPictures, page, replace) {
    if (replace) {
      renderedPictures.forEach(function(picture) {
        picture.remove();
      });
      renderedPictures = [];
    }

    var from = page * utils.getPageSize();
    var to = from + utils.getPageSize();

    loadedPictures.slice(from, to).forEach(function(picture) {
      renderedPictures.push(new Picture(picture, picturesContainer));
    });
  },

  /**
   * Фильтрация картинок
   * @param {Array.<Object>} loadedPictures
   * @param {string} filter
   */
  getFilteredPictures: function(loadedPictures, filter) {
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
  }
};
