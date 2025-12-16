// script.js — фильтрация + живой поиск по названию и категориям

document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('.catalog__filter');
  const searchInput = document.querySelector('.catalog__search-input');
  const cards = document.querySelectorAll('.catalog__card');
  const catalogGrid = document.querySelector('.catalog__grid');
  const loadMoreBtn = document.querySelector('.catalog__load-more');
  const cardCounters = document.querySelectorAll('.catalog__filter sup');

  let currentCategory = 'all'; // Текущая выбранная категория
  let visibleCards = []; // Массив видимых карточек
  const cardsPerLoad = 8; // Количество карточек для загрузки по кнопке
  let currentVisibleCount = cardsPerLoad; // Сколько карточек сейчас видно

  // Создаем словарь названий категорий для поиска
  const categoryNames = {
    'marketing': ['маркетинг', 'marketing', 'маркетинг', 'продвижение', 'реклама', 'smm'],
    'management': ['менеджмент', 'management', 'управление', 'лидерство', 'руководство'],
    'hr': ['hr', 'рекрутинг', 'кадры', 'персонал', 'human resources', 'подбор'],
    'design': ['дизайн', 'design', 'ui', 'ux', 'графика', 'рисование'],
    'development': ['разработка', 'development', 'программирование', 'код', 'web', 'frontend', 'backend']
  };

  // Функция для поиска по категории (по ключевым словам)
  function searchInCategory(category, searchTerm) {
    if (!categoryNames[category]) return false;
    
    return categoryNames[category].some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Функция для подсчета карточек по категориям
  function updateCounters() {
    const counts = {};
    
    // Инициализируем счетчики для всех категорий
    filters.forEach(filter => {
      const category = filter.dataset.category || 'all';
      counts[category] = 0;
    });
    
    // Считаем карточки по категориям
    cards.forEach(card => {
      const cardCategory = card.dataset.category || 'all';
      if (cardCategory in counts) {
        counts[cardCategory]++;
      }
      
      // Также считаем для "all" - это общее количество карточек
      if ('all' in counts) {
        counts['all']++;
      }
    });
    
    // Обновляем счетчики в фильтрах
    filters.forEach(filter => {
      const category = filter.dataset.category || 'all';
      const counter = filter.querySelector('sup');
      if (counter) {
        // Для "all" показываем общее количество
        if (category === 'all') {
          counter.textContent = `(${cards.length})`;
        } else {
          counter.textContent = `(${counts[category] || 0})`;
        }
      }
    });
  }

  // Функция для обновления видимых карточек
  function updateVisibleCards() {
    visibleCards = [];
    cards.forEach(card => {
      if (!card.classList.contains('hidden') && card.style.display !== 'none') {
        visibleCards.push(card);
      }
    });
    return visibleCards;
  }

  // Функция, проверяющая, подходит ли карточка под текущие фильтры и поиск
  function filterCards() {
    const searchValue = searchInput.value.trim().toLowerCase();
    let hasVisibleCards = false;
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCategory = card.dataset.category || 'all';
      const cardTitle = card.querySelector('.catalog__card-title').textContent.toLowerCase();
      const cardDescription = card.dataset.description || '';
      const cardKeywords = card.dataset.keywords || '';

      // Условия видимости:
      // 1. Категория совпадает (или выбран "all")
      const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
      
      // 2. Поиск по названию, описанию, ключевым словам ИЛИ по названию категории
      let matchesSearch = false;
      
      if (searchValue === '') {
        matchesSearch = true; // Если поиск пустой - показываем все
      } else {
        // Поиск в заголовке
        const titleMatch = cardTitle.includes(searchValue);
        
        // Поиск в описании
        const descriptionMatch = cardDescription.toLowerCase().includes(searchValue);
        
        // Поиск в ключевых словах
        const keywordsMatch = cardKeywords.toLowerCase().includes(searchValue);
        
        // Поиск по названию категории
        const categoryMatch = searchInCategory(cardCategory, searchValue);
        
        // Карточка подходит, если хотя бы одно условие выполнено
        matchesSearch = titleMatch || descriptionMatch || keywordsMatch || categoryMatch;
      }

      if (matchesCategory && matchesSearch) {
        card.classList.remove('hidden');
        card.style.display = 'flex';
        hasVisibleCards = true;
        visibleCount++;
        
        // Подсвечиваем найденный текст в заголовке
        highlightText(card, searchValue);
      } else {
        card.classList.add('hidden');
        // Убираем подсветку
        removeHighlight(card);
        // Задержка для анимации перед скрытием
        setTimeout(() => {
          if (card.classList.contains('hidden')) {
            card.style.display = 'none';
          }
        }, 300);
      }
    });

    // Обновляем список видимых карточек
    updateVisibleCards();
    
    // Сбрасываем счетчик видимых карточек для пагинации
    currentVisibleCount = Math.min(cardsPerLoad, visibleCards.length);
    
    // Обновляем кнопку "Load More"
    updateLoadMoreButton();
    
    // Показываем/скрываем сообщение "ничего не найдено"
    showNoResultsMessage(!hasVisibleCards);
    
    // Обновляем отображение карточек (пагинация)
    updateCardVisibility();
    
    // Обновляем счетчики в реальном времени при поиске
    updateFilterCountersOnSearch(visibleCount);
    
    return hasVisibleCards;
  }

  // Функция для подсветки найденного текста
  function highlightText(card, searchTerm) {
    if (!searchTerm) return;
    
    const titleElement = card.querySelector('.catalog__card-title');
    const originalText = titleElement.textContent;
    
    // Создаем регулярное выражение для поиска (игнорируем регистр)
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    
    // Заменяем найденный текст на подсвеченную версию
    const highlightedText = originalText.replace(regex, '<mark class="search-highlight">$1</mark>');
    
    // Сохраняем оригинальный текст в data-атрибут
    if (!titleElement.dataset.originalText) {
      titleElement.dataset.originalText = originalText;
    }
    
    titleElement.innerHTML = highlightedText;
  }

  // Функция для удаления подсветки
  function removeHighlight(card) {
    const titleElement = card.querySelector('.catalog__card-title');
    if (titleElement.dataset.originalText) {
      titleElement.textContent = titleElement.dataset.originalText;
      delete titleElement.dataset.originalText;
    }
  }

  // Функция для обновления счетчиков при поиске
  function updateFilterCountersOnSearch(visibleCount) {
    const searchValue = searchInput.value.trim().toLowerCase();
    
    // Если есть поисковый запрос, обновляем все счетчики
    if (searchValue) {
      filters.forEach(filter => {
        const category = filter.dataset.category || 'all';
        const counter = filter.querySelector('sup');
        
        if (counter) {
          if (category === 'all') {
            // Для "all" показываем количество видимых карточек
            counter.textContent = `(${visibleCount})`;
          } else {
            // Для категорий подсчитываем видимые карточки этой категории
            let categoryCount = 0;
            visibleCards.forEach(card => {
              if (card.dataset.category === category) {
                categoryCount++;
              }
            });
            counter.textContent = `(${categoryCount})`;
          }
        }
      });
    } else {
      // Если поиск пустой, восстанавливаем оригинальные счетчики
      updateCounters();
    }
  }

  // Функция для показа/скрытия сообщения "ничего не найдено"
  function showNoResultsMessage(show) {
    let noResultsMsg = document.querySelector('.catalog__no-results');
    
    if (show && !noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'catalog__no-results';
      noResultsMsg.innerHTML = `
        <div class="no-results__icon">🔍</div>
        <h3 class="no-results__title">Ничего не найдено</h3>
        <p class="no-results__text">Попробуйте изменить фильтры или поисковый запрос</p>
        <button class="no-results__reset">Сбросить фильтры</button>
      `;
      catalogGrid.parentNode.insertBefore(noResultsMsg, catalogGrid.nextSibling);
      
      // Добавляем обработчик для кнопки сброса
      const resetBtn = noResultsMsg.querySelector('.no-results__reset');
      resetBtn.addEventListener('click', resetFilters);
    } else if (!show && noResultsMsg) {
      noResultsMsg.remove();
    }
  }

  // Функция для сброса фильтров
  function resetFilters() {
    // Сбрасываем активный фильтр на "all"
    filters.forEach(f => f.classList.remove('catalog__filter--active'));
    const allFilter = document.querySelector('.catalog__filter[data-category="all"]');
    if (allFilter) {
      allFilter.classList.add('catalog__filter--active');
      currentCategory = 'all';
    }
    
    // Очищаем поиск
    searchInput.value = '';
    const searchClearBtn = document.querySelector('.catalog__search-clear');
    if (searchClearBtn) {
      searchClearBtn.style.display = 'none';
    }
    
    // Сбрасываем счетчик видимых карточек
    currentVisibleCount = cardsPerLoad;
    
    // Убираем подсветку со всех карточек
    cards.forEach(card => removeHighlight(card));
    
    // Обновляем карточки
    filterCards();
    
    // Восстанавливаем оригинальные счетчики
    updateCounters();
    
    // Прокручиваем к началу
    if (catalogGrid) {
      catalogGrid.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Функция для обновления видимости карточек (пагинация)
  function updateCardVisibility() {
    visibleCards.forEach((card, index) => {
      if (index < currentVisibleCount) {
        card.style.display = 'flex';
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
        setTimeout(() => {
          if (card.classList.contains('hidden')) {
            card.style.display = 'none';
          }
        }, 300);
      }
    });
  }

  // Функция для обновления кнопки "Load More"
  function updateLoadMoreButton() {
    if (!loadMoreBtn) return;
    
    if (currentVisibleCount >= visibleCards.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'flex';
    }
  }

  // Обработчик клика по кнопке "Load More"
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentVisibleCount = Math.min(currentVisibleCount + cardsPerLoad, visibleCards.length);
      updateCardVisibility();
      updateLoadMoreButton();
      
      // Плавная прокрутка к новым карточкам
      if (visibleCards[currentVisibleCount - cardsPerLoad]) {
        visibleCards[currentVisibleCount - cardsPerLoad].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // Обработчик клика по фильтрам
  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      // Снимаем активный класс со всех
      filters.forEach(f => f.classList.remove('catalog__filter--active'));
      // Добавляем активный класс к текущему
      filter.classList.add('catalog__filter--active');

      // Обновляем текущую категорию
      currentCategory = filter.dataset.category || 'all';

      // Сбрасываем счетчик видимых карточек
      currentVisibleCount = cardsPerLoad;
      
      // Убираем подсветку со всех карточек
      cards.forEach(card => removeHighlight(card));
      
      // Обновляем карточки
      filterCards();
      
      // Восстанавливаем счетчики если поиск пустой
      if (!searchInput.value.trim()) {
        updateCounters();
      }
      
      // Прокручиваем к началу грида
      if (catalogGrid) {
        catalogGrid.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Обработчик ввода в поиск (живой поиск с дебаунсом)
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      // Сбрасываем счетчик видимых карточек
      currentVisibleCount = cardsPerLoad;
      
      // Убираем подсветку со всех карточек перед новым поиском
      cards.forEach(card => removeHighlight(card));
      
      filterCards();
    }, 300); // Задержка 300ms для дебаунса
  });

  // Обработчик для очистки поиска по кнопке
  const searchClearBtn = document.createElement('button');
  searchClearBtn.className = 'catalog__search-clear';
  searchClearBtn.innerHTML = '×';
  searchClearBtn.style.cssText = `
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 20px;
    color: #bdbdbd;
    cursor: pointer;
    display: none;
    z-index: 2;
  `;
  searchInput.parentNode.appendChild(searchClearBtn);

  searchInput.addEventListener('input', () => {
    searchClearBtn.style.display = searchInput.value ? 'block' : 'none';
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    currentVisibleCount = cardsPerLoad;
    
    // Убираем подсветку
    cards.forEach(card => removeHighlight(card));
    
    filterCards();
    searchInput.focus();
    
    // Восстанавливаем счетчики после очистки поиска
    updateCounters();
  });

  // Инициализация при загрузке страницы
  const activeFilter = document.querySelector('.catalog__filter--active');
  if (activeFilter) {
    currentCategory = activeFilter.dataset.category || 'all';
  }
  
  // Инициализация счетчиков
  updateCounters();
  
  // Инициализация фильтрации
  filterCards();
});

// Анимация появления/исчезновения карточек
const style = document.createElement('style');
style.textContent = `
  .catalog__card {
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 1;
    transform: translateY(0);
    animation: cardAppear 0.4s ease-out;
  }
  
  .catalog__card.hidden {
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
  }
  
  @keyframes cardAppear {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Стиль для подсветки найденного текста */
  .search-highlight {
    background-color: #FFF3CD;
    color: #856404;
    padding: 0 2px;
    border-radius: 2px;
    font-weight: bold;
  }
  
  .catalog__no-results {
    text-align: center;
    padding: 40px 20px;
    grid-column: 1 / -1;
    animation: fadeIn 0.5s ease;
  }
  
  .no-results__icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  .no-results__title {
    font-family: var(--font-family-secondary);
    font-size: clamp(20px, calc(20px + (24 - 20) * ((100vw - 320px) / (1920 - 320))), 24px);
    color: var(--color-dark);
    margin-bottom: 10px;
  }
  
  .no-results__text {
    font-family: var(--font-family-secondary);
    font-size: clamp(14px, calc(14px + (16 - 14) * ((100vw - 320px) / (1920 - 320))), 16px);
    color: var(--color-gray-light);
    margin-bottom: 20px;
  }
  
  .no-results__reset {
    padding: 10px 24px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-family: var(--font-family-secondary);
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .no-results__reset:hover {
    background: #e63935;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
document.head.append(style);