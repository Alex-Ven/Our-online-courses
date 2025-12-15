// script.js — фильтрация + живой поиск

document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('.catalog__filter');
  const searchInput = document.querySelector('.catalog__search-input');
  const cards = document.querySelectorAll('.catalog__card');

  let currentCategory = 'all'; // Текущая выбранная категория

  // Функция, проверяющая, подходит ли карточка под текущие фильтры и поиск
  function updateCards() {
    const searchValue = searchInput.value.trim().toLowerCase();

    cards.forEach(card => {
      const cardCategory = card.dataset.category || 'all';
      const cardTitle = card.querySelector('.catalog__card-title').textContent.toLowerCase();

      // Условие видимости:
      // 1. Категория совпадает (или выбран "all")
      // 2. Название содержит введённый текст (или поле поиска пустое)
      const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
      const matchesSearch = (searchValue === '' || cardTitle.includes(searchValue));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
        setTimeout(() => {
          if (card.classList.contains('hidden')) {
            card.style.display = 'none';
          }
        }, 300); // Время на анимацию скрытия
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

      // Обновляем карточки
      updateCards();
    });
  });

  // Обработчик ввода в поиск (живой поиск)
  searchInput.addEventListener('input', () => {
    updateCards();
  });

  // Инициализация при загрузке страницы
  const activeFilter = document.querySelector('.catalog__filter--active');
  if (activeFilter) {
    currentCategory = activeFilter.dataset.category || 'all';
  }
  updateCards(); // Показать все или по умолчанию
});

// Анимация появления/исчезновения карточек
const style = document.createElement('style');
style.textContent = `
  .catalog__card {
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 1;
    transform: translateY(0);
  }
  .catalog__card.hidden {
    opacity: 0;
    transform: translateY(20px);
  }
`;
document.head.append(style);