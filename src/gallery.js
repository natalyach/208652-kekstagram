'use strict';

var Gallery = function() {
  var self = this;
  var galleryOverlay = document.querySelector('.gallery-overlay');
  var galleryImage = galleryOverlay.querySelector('.gallery-overlay-image');
  var likesCount = galleryOverlay.querySelector('.likes-count');
  var commentsCount = galleryOverlay.querySelector('.comments-count');

  /** @type {Array} */
  self.savedPictures = [];
  /** @type {number} */
  self.currentNumber = 0;

  /**
   * Запоминаем выбранные фотографии
   * @param {Array.<Object>} pictures
   */
  self.savePictures = function(pictures) {
    self.savedPictures = pictures;
  };

  /**
   * Показ галереи
   * @param {Object}picture
   */
  self.showGallery = function(picture) {
    var number = self.savedPictures.indexOf(picture);
    self.currentNumber = number;
    galleryOverlay.classList.remove('invisible');
    _showPicture(number);
    galleryImage.addEventListener('click', _onPhotoClick);
    document.addEventListener('keydown', _onDocumentKeyDown);
    galleryOverlay.addEventListener('click', _hideGallery);
  };

  /**
   * Показ одной картинки
   * @param {int} number
   */
  function _showPicture(number) {
    var currentPicture = self.savedPictures[number];
    galleryImage.src = currentPicture.url;
    likesCount.textContent = currentPicture.likes;
    commentsCount.textContent = currentPicture.comments;
  }

  /**
   * Закрытие галереи
   */
  function _hideGallery() {
    galleryOverlay.classList.add('invisible');
    galleryImage.removeEventListener('click', _onPhotoClick);
    document.removeEventListener('keydown', _onDocumentKeyDown);
    galleryOverlay.removeEventListener('click', _hideGallery);
  }

  /**
   * Показ следующей фотографии по нажатию на галерею
   * @param evt
   * @private
   */
  function _onPhotoClick(evt) {
    evt.stopPropagation();
    self.currentNumber++;
    if(self.currentNumber > (self.savedPictures.length - 1)) {
      self.currentNumber = 0;
    }
    _showPicture(self.currentNumber);
  }

  /**
   * Закрытие галереи по Esc
   * @param evt
   * @private
   */
  function _onDocumentKeyDown(evt) {
    if(evt.keyCode === 27) {
      _hideGallery();
    }
  }
};

module.exports = new Gallery();
