'use strict';

(function() {
  var Resizer = require('./resizer');

  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Объект для работы с сookie
   * @type {Object}
   */
  var browserCookies = require('browser-cookies');

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * Инпут "Слева" в форме ресайза.
   * @type {HTMLElement}
   */
  var resizeX = resizeForm.elements.x;

  /**
   * Инпут "Сверху" в форме ресайза.
   * @type {HTMLElement}
   */
  var resizeY = resizeForm.elements.y;

  /**
   * Инпут "Сторона" в форме ресайза.
   * @type {HTMLElement}
   */
  var resizeSize = resizeForm.elements.size;

  /**
   * Кнопка отправки формы резайса.
   * @type {HTMLElement}
   */
  var resizeFwd = resizeForm.elements.fwd;

  /**
   * Возвращает кол-во дней, прошедшее с моего ближайшего дня рождения.
   * Мой день рождения: 15.06.1982
   * @return {number}
   */
  function getNumberOfDaysAfterBirthday() {
    // Берем текущий день
    var now = new Date();
    // Поумолчанию объявляем мой день рождения в ткущем году
    var birthday = new Date(now.getFullYear(), 5, 15);
    // Обнуляем часы, минуты, секунды и милисекунды у текущего дня, т.к. они дадут дробный результат и может быть погрешность
    now.setHours(0, 0, 0, 0);
    if ((now - birthday) < 0) {
      // Если в этом году мой день рождения еще не прошел, то мой блищайший день рождения равен прошлогоднему
      birthday.setFullYear(now.getFullYear() - 1);
    }
    // Возвращем кол-во дней, прошедшее с моего ближайшего дня рождения
    return ((now - birthday) / 1000 / 60 / 60 / 24);
  }

  /**
   * Отмечаем выбранный фильтр на основании cookie
   */
  function setSelectedFilter() {
    var selectedFilter = browserCookies.get('selectedFilter');
    if(selectedFilter) {
      filterForm['upload-filter'].forEach(function(item) {
        item.checked = (item.value === selectedFilter);
      });
      changeFilterForm();
    }
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    resizeFwd.disabled = false;
    resizeX.setCustomValidity('');
    // Для преобразования чисел я использую объект-обертку Number, а не parseInt,
    // так как parseInt пустой строки равен NaN, а Number пустой строки вернет 0
    // Убрать приведение типа нельзя, так как тогда будет не сложение, а конкатенация строк
    if ((Number(resizeX.value) < 0) || (Number(resizeY.value) < 0)) {
      resizeX.setCustomValidity('Поля «сверху» и «слева» не могут быть отрицательными.');
    } else if ((Number(resizeX.value) + Number(resizeSize.value)) > currentResizer._image.naturalWidth) {
      resizeX.setCustomValidity('Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.');
    } else if ((Number(resizeY.value) + Number(resizeSize.value)) > currentResizer._image.naturalHeight) {
      resizeX.setCustomValidity('Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.');
    }
    document.getElementById('resize-error').innerHTML = resizeX.validationMessage;
    if(!resizeForm.checkValidity()) {
      resizeFwd.disabled = true;
      return false;
    }
    return true;
  }

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  window.addEventListener('resizerchange', function() {
    var square = currentResizer.getConstraint();
    resizeX.value = square.x;
    resizeY.value = square.y;
    resizeSize.value = square.side;
    resizeFormIsValid();
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Обработка изменения элементов в формы кадрирования.
   * @param {Event} evt
   */
  resizeForm.addEventListener('input', function(evt) {
    evt.preventDefault();
    // Нельзя убрать Number, так как parseInt пустой строки = NaN
    // Ошибка в консоле: The specified value "NaN" is not a valid number. The value must match to the following
    // regular expression: -?(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?
    resizeX.value = parseInt(Number(resizeX.value), 10);
    resizeY.value = parseInt(Number(resizeY.value), 10);
    resizeSize.value = parseInt(Number(resizeSize.value), 10);
    if(resizeFormIsValid()) {
      // Нельзя убрать Number так как setConstraint требует тип - число
      currentResizer.setConstraint(Number(resizeX.value), Number(resizeY.value), Number(resizeSize.value));
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    browserCookies.set('selectedFilter', selectedFilter, {expires: getNumberOfDaysAfterBirthday()});

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  function changeFilterForm() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  }

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    changeFilterForm();
  });

  cleanupResizer();
  updateBackground();
  setSelectedFilter();
})();
