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
  this.data = data;
  this.element = pictureElement.get(data);
  this._onShow = this._onShow.bind(this);
  this.element.addEventListener('click', this._onShow);
  container.appendChild(this.element);
};

/**
 * Полноэкранный просмотр фотографии
 * @param evt
 * @private
 */
Photo.prototype._onShow = function(evt) {
  evt.preventDefault();
  gallery.saveToHash(this.data);
};

/**
 * Удаление фотографии
 */
Photo.prototype.remove = function() {
  this.element.removeEventListener('click', this._onShow);
  this.element.parentNode.removeChild(this.element);
};

module.exports = Photo;
