'use strict';

var pictureElement = require('./picture-element');
var gallery = require('../gallery');

/**
 * Конструктор - фотография
 * @param {Object} data
 * @param {HTMLElement} container
 * @constructor
 */
var Photo = function(data, container) {
  var self = this;
  self.data = data;
  self.element = pictureElement.get(data);

  /**
   * Удаление фотографии
   */
  self.remove = function() {
    self.element.removeEventListener('click', _show);
    self.element.parentNode.removeChild(self.element);
  };

  self.element.addEventListener('click', _show);
  container.appendChild(self.element);

  /**
   * Полноэкранный просмотр фотографии
   * @param evt
   * @private
   */
  function _show(evt) {
    evt.preventDefault();
    gallery.saveToHash(self.data);
  }
};

module.exports = Photo;
