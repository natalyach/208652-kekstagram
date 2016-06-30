'use strict';

/** @type {HTMLElement} */
var templateElement = document.querySelector('template');

/** @type {HTMLElement} */
var elementToClone;

if ('content' in templateElement) {
  elementToClone = templateElement.content.querySelector('.picture');
} else {
  elementToClone = templateElement.querySelector('.picture');
}

module.exports = {
  /**
   * Рендер одной картинки
   * @param {Object} data
   * @param {HTMLElement} container
   * @returns {Node}
   */
  get: function(data, container) {
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
  }
};
