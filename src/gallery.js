'use strict';

var galleryOverlay = document.querySelector('.gallery-overlay');
var galleryImage = galleryOverlay.querySelector('.gallery-overlay-image');
var likesCount = galleryOverlay.querySelector('.likes-count');
var commentsCount = galleryOverlay.querySelector('.comments-count');

var Gallery = function() {
  /** @type {Array} */
  this.savedPictures = [];
  /** @type {number} */
  this.currentNumber = 0;
  /**
   * Обработчик изменения хеша страницы
   */
  window.addEventListener('hashchange', this.showPictureByHash.bind(this));
};

/**
 * Запоминаем выбранные фотографии
 * @param {Array.<Object>} pictures
 */
Gallery.prototype.savePictures = function(pictures) {
  this.savedPictures = pictures;
};

/**
 * Показ галереи
 */
Gallery.prototype.showGallery = function() {
  if(galleryOverlay.classList.contains('invisible')) {
    galleryOverlay.classList.remove('invisible');
    galleryImage.addEventListener('click', _onPhotoClick.bind(this));
    document.addEventListener('keydown', _onDocumentKeyDown.bind(this));
    galleryOverlay.addEventListener('click', this.hideGallery.bind(this));
  }
};

/**
 * Обработчик изменения хеша страницы
 */
Gallery.prototype.showPictureByHash = function() {
  var currentHash = window.location.hash;
  var match = currentHash.match(/#photo\/(\S+)/);
  if(match) {
    this.showGallery();
    this.showPicture(match[1]);
  } else {
    this.hideGallery();
  }
};

/**
 * Сохранение текущей картинки в хеш страницы
 * @param {Object} picture
 */
Gallery.prototype.saveToHash = function(picture) {
  window.location.hash = 'photo/' + picture.url;
};

/**
 * Показ одной картинки
 * @param {int|string} pictureId
 * @private
 */
Gallery.prototype.showPicture = function(pictureId) {
  var currentPicture;
  if(typeof pictureId === 'string') {
    var findPicture = this.savedPictures.filter(function(picture) {
      return picture.url === pictureId;
    });
    if(findPicture) {
      currentPicture = findPicture.pop();
      this.currentNumber = this.savedPictures.indexOf(currentPicture);
    }
  } else {
    currentPicture = this.savedPictures[pictureId];
    this.currentNumber = pictureId;
  }
  if(currentPicture) {
    galleryImage.src = currentPicture.url;
    likesCount.textContent = currentPicture.likes;
    commentsCount.textContent = currentPicture.comments;
  }
};

/**
 * Закрытие галереи
 * @private
 */
Gallery.prototype.hideGallery = function() {
  window.location.hash = '';
  galleryOverlay.classList.add('invisible');
  galleryImage.removeEventListener('click', _onPhotoClick.bind(this));
  document.removeEventListener('keydown', _onDocumentKeyDown.bind(this));
  galleryOverlay.removeEventListener('click', this.hideGallery.bind(this));
};

/**
 * Показ следующей фотографии по нажатию на галерею
 * @param evt
 * @private
 */
function _onPhotoClick(evt) {
  evt.stopPropagation();
  this.currentNumber++;
  if(this.currentNumber > (this.savedPictures.length - 1)) {
    this.currentNumber = 0;
  }
  this.saveToHash(this.savedPictures[this.currentNumber]);
}

/**
 * Закрытие галереи по Esc
 * @param evt
 * @private
 */
function _onDocumentKeyDown(evt) {
  if(evt.keyCode === 27) {
    this.hideGallery();
  }
}

module.exports = new Gallery();
