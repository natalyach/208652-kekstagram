'use strict';

/** @constant {number} */
var GAP = 100;

/** @constant {number} */
var PAGE_SIZE = 12;

/** @type {string} */
var DEFAULT_FILTER = 'popular';

module.exports = {
  /**
   * Достиг ли DOM-объект низа страницы
   * @param {HTMLElement} element
   * @return {boolean}
   */
  isBottomReached: function(element) {
    var elementPosition = element.getBoundingClientRect();
    return elementPosition.bottom - window.innerHeight - GAP <= 0;
  },

  /**
   * Проверка на доступность следующей страницы
   * @param {Array} loadedPictures
   * @param {number} page
   * @return {boolean}
   */
  isNextPageAvailable: function(loadedPictures, page) {
    return page < Math.floor(loadedPictures.length / this.getPageSize());
  },

  /**
   * Получение кол-ва элементов на странице
   * @returns {number}
   */
  getPageSize: function() {
    return PAGE_SIZE;
  },

  /**
   * Сохраняем выбранный фильтр в локальное хранилище
   * @param value
   */
  saveFilterToLocalStorage: function(value) {
    if(window.localStorage) {
      localStorage.setItem('selectedFilter', value);
    }
  },

  /**
   * Получаем фильтр по умолчанию
   * @returns {string}
   */
  getDefaultFilter: function() {
    var selectedFilter = DEFAULT_FILTER;
    if(window.localStorage) {
      selectedFilter = localStorage.getItem('selectedFilter');
    }
    return selectedFilter;
  }
};
