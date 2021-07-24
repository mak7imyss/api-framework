import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { Cat } from '../@types/common';
import { allure } from 'allure-mocha/runtime';
import LikeApi from '../src/http/LikeApi';

const getRandomInt = (max: number) => Math.floor(Math.random() * max);
let expectedCat: Cat;
let count_dislikes: number = 7;
let current_dislikes: number;

describe('[HM] Поиск кота и добавление дислайков', async () => {
  before(() => {
    console.log('Начало тестирования');
  });
  beforeEach(() => {
    console.log('Запуск теста!');
  });
  afterEach(() => {
    console.log('Завершение теста!');
  });
  after(() => {
    console.log('Завершение тестирования, ознакомьтесь с отчетом');
  });

  it('1. Поиск случайного кота', async () => {
    console.info('Тест 1 ☑', 'Запрашиваем список котов сгруппированный по группам с 1 котом в группе');

    await allure.step('Находим случайного кота',
      async () => {
        console.warn('Тест 1 ☑', 'Выполняем GET запрос /allByLetter');
        const response = await CoreApi.getAllCarsByLetter(1);
        if (response.status === 404) {
          console.error('Тест 1 ☒', 'Ошибка выполнения GET запроса /allByLetter');
          assert.fail(`Кот не найден! Response:\n ${JSON.stringify(response.data, null, 2)}`);
        }

        console.debug('Тест 1 ☑', 'Получаем ответ на GET запрос /allByLetter');
        console.info('Тест 1 ☑', 'Случайным образом выбираем кота из списка');
        const num = getRandomInt(response.data.groups.length);
        console.info('Тест 1 ☑', 'Получаем информацию о случайно выбранном коте');
        expectedCat = response.data.groups[num].cats[0];
        allure.testAttachment(
          'Информация о коте',
          JSON.stringify(expectedCat, null, 2),
          'application/json');

        assert.ok(response.status === 200, `Текущий статус код ${response.status}`);
      },
    );
  });

  it('2. Получение и сохранение дислайков', async () => {

    await allure.step(`Получение дислайков у кота: ${expectedCat.name}`,
      async () => {
        console.warn('Тест 2 ☑', 'Выполняем извлечение количества дислайков');
        current_dislikes = expectedCat.dislikes;
          allure.testAttachment(
          'Информация о количестве дислайков',
          JSON.stringify(`dislikes: ${expectedCat.dislikes}`, null, 2),
          'application/json',
        );
        //Честно, не совсем понимаю что проверять в обычном парсе данных
        assert.ok(current_dislikes === expectedCat.dislikes, `Значения не совпадают ${current_dislikes} / ${expectedCat.dislikes}`,
        );
      });

    // // Вариант с запросом по id, но не вижу смысла, т.к. все уже есть в expectedCat
    // const status: number = 200;
    // await allure.step(`Получение дислайков у кота: ${expectedCat.name}`,
    //   async () => {
    //     console.warn('Тест 2 ☑', 'Выполняем GET запрос /getCatById');
    //     const response = await CoreApi.getCatById(expectedCat.id);
    //     console.debug('Тест 2 ☑', 'Получаем ответ на GET запрос /getCatById');
    //     console.info('Тест 2 ☑', 'Сохраняем количесво дислайков у кота');
    //     current_dislikes = response.data.cat.dislikes;
    //     assert.ok(response.status === 200, `Текущий статус код ${response.status}`);
    //   });
  });

  it('3. Добавление дислайков коту ', async () => {
    const data = { like: null, dislike: true };
    await allure.step(`Добавление дислайков коту: ${expectedCat.id}`,
      async () => {
        console.warn('Тест 3 ☑', `Выполняем POST запрос /likes ${count_dislikes} раз`);
        for (let i = 1; i < count_dislikes; i++) {
          await LikeApi.likes(expectedCat.id, data);
        }
        const response = await LikeApi.likes(expectedCat.id, data);
        console.debug('Тест 3 ☑', 'Выполнен POST запрос /likes');
        allure.testAttachment(
          'Информация о запросе',
          JSON.stringify(response.data, null, 2),
          'application/json',
        );
        assert.ok(response.status === 200, `Текущий статус код ${response.status}`);
        assert.equal(response.data.dislikes, current_dislikes + count_dislikes, `Значения не совпадают! Текущее: ${response.data.dislikes} / Ожидаемое: ${current_dislikes + count_dislikes}`);
      });
  });

  it('4. Проверка количества дислайков у кота ', async () => {
    await allure.step(` Проверка количества дислайков у кота: ${expectedCat.id}`,
      async () => {
        console.warn('Тест 4 ☑', 'Выполняем GET запрос /getCatById');
        const response = await CoreApi.getCatById(expectedCat.id);
        console.debug('Тест 4 ☑', 'Получаем ответ на GET запрос /getCatById');
        console.info('Тест 4 ☑', 'Сравниваем текущее количесво дислайков у кота и ожидаемое');
        assert.ok(response.status === 200, `Текущий статус код ${response.status}`);
        assert.equal(response.data.cat.dislikes, current_dislikes + count_dislikes, `Значения не совпадают! Текущее: ${response.data.cat.dislikes} / Ожидаемое: ${current_dislikes + count_dislikes}`);
      });
  });
});