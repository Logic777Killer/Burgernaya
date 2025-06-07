const ENDPOINTS = {
  authUser: '**/api/auth/user',
  getIngredients: '**/api/ingredients',
  postOrder: '**/api/orders',
};

const SELECTORS = {
  nameInput: 'input[name="name"]',
  profileMenuText: 'Личный кабинет',
  constructorTitleText: 'Соберите бургер',
  bunPlaceholderText: 'Выберите булки',
  fillingPlaceholderText: 'Выберите начинку',
  orderButtonText: 'Оформить заказ',
  orderIdModalText: 'идентификатор заказа',
  escapeKey: '{esc}',
};

const TEST_DATA = {
  mockUser: {
    success: true,
    user: {
      email: 'qa_user@example.com',
      name: 'QA Test User',
    },
  },
  fixtures: {
    ingredients: 'ingredients.json',
    user: 'user.json',
    orderResponse: 'makeOrder.json',
  },
  bunName: 'Флюоресцентная булка R2-D3',
  fillingName: 'Биокотлета из марсианской Магнолии',
  alternativeBun: 'Краторная булка',
};

describe('Авторизация и профиль', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          email: 'testuser@example.com',
          name: 'Test User',
        },
      },
    }).as('getUser');
  });

  it('После логина происходит редирект в профиль и отображаются данные пользователя', () => {
    cy.loginByApi();
    cy.visit('/');

    cy.contains('Личный кабинет').click();
    cy.wait('@getUser');

    cy.contains('Test User').click();
    cy.url().should('include', '/profile');
    cy.get('form', { timeout: 10000 }).should('exist');
    cy.get('input[name="name"]').should('have.value', 'Test User');
  });
});


describe('Конструктор бургеров: базовые сценарии', () => {
  beforeEach(() => {
    cy.fixture(TEST_DATA.fixtures.ingredients).as('ingredientsData');
    cy.fixture(TEST_DATA.fixtures.user).as('userData');

    cy.intercept('GET', ENDPOINTS.getIngredients, {
      fixture: TEST_DATA.fixtures.ingredients,
    }).as('mockIngredients');

    cy.intercept('GET', ENDPOINTS.authUser, {
      fixture: TEST_DATA.fixtures.user,
    }).as('mockUserData');

    cy.setCookie('accessToken', 'mockToken');
    cy.window().then((win) => {
      win.localStorage.setItem('refreshToken', 'mockToken');
    });

    cy.visit('/');
    cy.wait('@mockIngredients');
    cy.contains(SELECTORS.constructorTitleText, { timeout: 10000 }).should('be.visible');
  });

  it('Проверка наличия плейсхолдеров при пустом конструкторе', () => {
    cy.contains(SELECTORS.bunPlaceholderText).should('be.visible');
    cy.contains(SELECTORS.fillingPlaceholderText).should('be.visible');
  });

  it('Добавляем булку в конструктор', () => {
    cy.contains(TEST_DATA.bunName).parent().find('button').click();
    cy.contains(TEST_DATA.bunName, { timeout: 10000 }).should('exist');
  });

  it('Добавляем начинку в конструктор', () => {
    cy.contains('Начинки').scrollIntoView().click({ force: true });
    cy.contains(TEST_DATA.fillingName).parent().find('button').click();
    cy.contains(TEST_DATA.fillingName).should('exist');
  });

  it('Создаем заказ и проверяем сброс конструктора после закрытия модалки', () => {
    cy.intercept('POST', ENDPOINTS.postOrder, {
      fixture: TEST_DATA.fixtures.orderResponse,
      statusCode: 200,
    }).as('mockCreateOrder');

    cy.contains(TEST_DATA.bunName).parent().find('button').click();
    cy.contains('Начинки').scrollIntoView();
    cy.contains(TEST_DATA.fillingName).parent().find('button').click();

    cy.contains(SELECTORS.orderButtonText).should('not.be.disabled').click();
    cy.wait('@mockCreateOrder', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
    cy.contains(SELECTORS.orderIdModalText).should('be.visible');
    cy.get('body').type(SELECTORS.escapeKey);
    cy.contains(SELECTORS.bunPlaceholderText).should('exist');
    cy.contains(SELECTORS.fillingPlaceholderText).should('exist');
  });

  it('Просмотр и закрытие деталей ингредиента через ESC', () => {
    cy.contains(TEST_DATA.alternativeBun).click();
    cy.url().should('include', '/ingredients/');
    cy.get('body').type(SELECTORS.escapeKey);
    cy.url().should('eq', 'http://localhost:4000/');
  });

  it('Просмотр и закрытие деталей ингредиента через клик по оверлею', () => {
    cy.contains(TEST_DATA.alternativeBun).click();
    cy.contains('Детали ингредиента').should('be.visible');
    cy.get('body').click(10, 10);
    cy.url().should('eq', 'http://localhost:4000/');
  });
});
