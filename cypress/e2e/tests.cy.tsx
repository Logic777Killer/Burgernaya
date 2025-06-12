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
    orderDetails: 'Детали ингредиента',
    addIngredient: 'Добавить',
    bunsText: 'Булки',
    fillingsText: 'Начинки',
    saucesText: 'Соусы',
    orderIdText: 'идентификатор заказа',
    escapeKey: '{esc}',
    address: 'http://localhost:4000/',
};

const TEST_DATA = {
    fixtures: {
        ingredients: 'ingredients.json',
        user: 'user.json',
        orderResponse: 'makeOrder.json',
    },
};

describe('Авторизация и профиль', () => {
    it('После логина происходит редирект в профиль и отображаются данные пользователя', function () {
        cy.fixture(TEST_DATA.fixtures.user).as('userData');
        cy.intercept('GET', '/api/auth/user', {fixture: TEST_DATA.fixtures.user}).as('getUser');
    	cy.loginByApi();
	cy.visit('/');
        cy.contains(SELECTORS.profileMenuText).should('be.visible');
    	cy.contains(SELECTORS.profileMenuText).click();
    	cy.wait('@getUser');
        cy.get('@userData').then((user) => {
            cy.contains(user.user.name).click();
            cy.get(SELECTORS.nameInput).should('have.value', user.user.name);
        });
    });
});

describe('Сборка бургера в конструкторе и заказ', () => {
    beforeEach(() => {
        cy.fixture(TEST_DATA.fixtures.ingredients).as('ingredientsData');
        cy.fixture(TEST_DATA.fixtures.user).as('userData');
        cy.intercept('GET', ENDPOINTS.getIngredients, {fixture: TEST_DATA.fixtures.ingredients}).as('mockIngredients');
        cy.intercept('GET', ENDPOINTS.authUser, {fixture: TEST_DATA.fixtures.user}).as('mockUserData');
        cy.intercept('POST', ENDPOINTS.postOrder, {fixture: TEST_DATA.fixtures.orderResponse, statusCode: 200}).as('mockCreateOrder');
    	cy.visit('/');
    });

    it('Текстовые подсказки', () => {
        cy.contains(SELECTORS.bunPlaceholderText).should('be.visible');
        cy.contains(SELECTORS.fillingPlaceholderText).should('be.visible');
        cy.contains(SELECTORS.constructorTitleText).should('be.visible');
    });

    it('Добавляем булку в конструктор', function () {
        cy.contains(SELECTORS.addIngredient).should('be.visible');
        cy.get('@ingredientsData').then((data) => {
            const bun = data.data.find((item) => item.type === 'bun');
            cy.contains(bun.name).parent().find('button').click();
            cy.contains(bun.name, { timeout: 10000 }).should('exist');
        });
    });

    it('Добавляем начинку в конструктор', function () {
        cy.contains(SELECTORS.addIngredient).should('be.visible');
        cy.get('@ingredientsData').then((data) => {
            const filling = data.data.find((item) => item.type === 'main');
            cy.contains('Начинки').scrollIntoView().click({ force: true });
            cy.contains(filling.name).parent().find('button').click();
            cy.contains(filling.name).should('exist');
        });
    });

    it('Создаем заказ', function () {
    	cy.setCookie('accessToken', 'Token');
    	cy.window().then(w => {
      	   w.localStorage.setItem('refreshToken', 'Token');
    	});
        cy.contains(SELECTORS.constructorTitleText).should('be.visible');
        cy.contains(SELECTORS.bunsText).should('be.visible');
        cy.contains(SELECTORS.fillingsText).should('be.visible');
        cy.contains(SELECTORS.saucesText).should('be.visible');
        cy.contains(SELECTORS.addIngredient).should('be.visible');
        cy.get('@ingredientsData').then((data) => {
            const bun = data.data.find((item) => item.type === 'bun');
            const filling = data.data.find((item) => item.type === 'main');

            cy.contains(bun.name).parent().find('button').click();
            cy.contains('Начинки').scrollIntoView();
            cy.contains(filling.name).parent().find('button').click();

            cy.contains(SELECTORS.orderButtonText).should('not.be.disabled').click();
            cy.wait('@mockCreateOrder', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
	    cy.contains(SELECTORS.orderIdText).should('be.visible');

            cy.fixture(TEST_DATA.fixtures.orderResponse).then((orderData) => {
                cy.contains(orderData.order.number.toString(), { timeout: 10000 }).should('be.visible');
            });
        });
    });

    it('Проверяем сброс конструктора после закрытия модалки', function () {
        cy.get('body').click(10, 10);
        cy.contains(SELECTORS.bunPlaceholderText).should('exist');
        cy.contains(SELECTORS.fillingPlaceholderText).should('exist');
        cy.contains(SELECTORS.constructorTitleText).should('exist');
    });
});


describe('Закрытие модалок', () => {
    beforeEach(() => {
        cy.fixture(TEST_DATA.fixtures.ingredients).as('ingredientsData');
        cy.fixture(TEST_DATA.fixtures.user).as('userData');
        cy.intercept('GET', ENDPOINTS.getIngredients, {fixture: TEST_DATA.fixtures.ingredients}).as('mockIngredients');
        cy.intercept('GET', ENDPOINTS.authUser, {fixture: TEST_DATA.fixtures.user}).as('mockUserData');
    	cy.visit('/');
        cy.get('@ingredientsData').then((data) => {
            const ingredient = data.data.find((item) => item.type === 'bun');
            cy.contains(ingredient.name).click();
        });
    });

    it('Закрытие деталей ингредиента через ESC', function () {
        cy.get('body').type(SELECTORS.escapeKey);
        cy.url().should('eq', SELECTORS.address);
    });

    it('Закрытие деталей ингредиента через клик по оверлею', function () {
        cy.get('body').click(10, 10);
        cy.url().should('eq', SELECTORS.address);
    });
});

