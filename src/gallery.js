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
   */
  self.showGallery = function() {
    if(galleryOverlay.classList.contains('invisible')) {
      galleryOverlay.classList.remove('invisible');
      galleryImage.addEventListener('click', _onPhotoClick);
      document.addEventListener('keydown', _onDocumentKeyDown);
      galleryOverlay.addEventListener('click', _hideGallery);
    }
  };

  /**
   * Обработчик изменения хеша страницы
   */
  self.showPictureByHash = function() {
    var currentHash = window.location.hash;
    var match = currentHash.match(/#photo\/(\S+)/);
    if(match) {
      self.showGallery();
      _showPicture(match[1]);
    } else {
      _hideGallery();
    }
  };

  /**
   * Сохранение текущей картинки в хеш страницы
   * @param {Object} picture
   */
  self.saveToHash = function(picture) {
    window.location.hash = 'photo/' + picture.url;
  };

  /**
   * Показ одной картинки
   * @param {int|string} pictureId
   * @private
   */
  function _showPicture(pictureId) {
    var currentPicture;
    if(typeof pictureId === 'string') {
      var findPicture = self.savedPictures.filter(function(picture) {
        return picture.url === pictureId;
      });
      if(findPicture) {
        currentPicture = findPicture.pop();
        self.currentNumber = self.savedPictures.indexOf(currentPicture);
      }
    } else {
      currentPicture = self.savedPictures[pictureId];
      self.currentNumber = pictureId;
    }
    if(currentPicture) {
      galleryImage.src = currentPicture.url;
      likesCount.textContent = currentPicture.likes;
      commentsCount.textContent = currentPicture.comments;
    }
  }

  /**
   * Закрытие галереи
   * @private
   */
  function _hideGallery() {
    window.location.hash = '';
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
    self.saveToHash(self.savedPictures[self.currentNumber]);
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

  /**
   * Обработчик изменения хеша страницы
   */
  window.addEventListener('hashchange', self.showPictureByHash);
};

module.exports = new Gallery();
