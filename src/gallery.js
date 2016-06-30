'use strict';

var galleryOverlay = document.querySelector('.gallery-overlay');
var galleryImage = galleryOverlay.querySelector('.gallery-overlay-image');
var likesCount = galleryOverlay.querySelector('.likes-count');
var commentsCount = galleryOverlay.querySelector('.comments-count');

/** @type {Array} */
var savedPictures = [];
/** @type {number} */
var currentNumber = 0;

/**
 * Запоминаем выбранные фотографии
 * @param {Array.<Object>} pictures
 */
var savePictures = function(pictures) {
  savedPictures = pictures;
};

/**
 * Показ одной картинки
 * @param {int} number
 */
var showPicture = function(number) {
  var currentPicture = savedPictures[number];
  galleryImage.src = currentPicture.url;
  likesCount.textContent = currentPicture.likes;
  commentsCount.textContent = currentPicture.comments;
};

/**
 * Показ галереи
 * @param {Object}picture
 */
var showGallery = function(picture) {
  var number = savedPictures.indexOf(picture);
  currentNumber = number;
  galleryOverlay.classList.remove('invisible');
  showPicture(number);
  galleryImage.addEventListener('click', _onPhotoClick);
  document.addEventListener('keydown', _onDocumentKeyDown);
  galleryOverlay.addEventListener('click', hideGallery);
};

var hideGallery = function() {
  galleryOverlay.classList.add('invisible');
  galleryImage.removeEventListener('click', _onPhotoClick);
  document.removeEventListener('keydown', _onDocumentKeyDown);
  galleryOverlay.removeEventListener('click', hideGallery);
};

/**
 * Показ следующей фотографии по нажатию на галерею
 * @param evt
 * @private
 */
var _onPhotoClick = function(evt) {
  evt.stopPropagation();
  currentNumber++;
  if(currentNumber > (savedPictures.length - 1)) {
    currentNumber = 0;
  }
  showPicture(currentNumber);
};

/**
 * Закрытие галереи по Esc
 * @param evt
 * @private
 */
var _onDocumentKeyDown = function(evt) {
  if(evt.keyCode === 27) {
    hideGallery();
  }
};

module.exports = {
  savePictures: savePictures,
  showGallery: showGallery
};
