import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { Cat } from '../@types/common';
import { allure } from 'allure-mocha/runtime';
import LikeApi from '../src/http/LikeApi';

const getRandomInt = (max: number) => Math.floor(Math.random() * max);
let actCat: Cat;
let count_likes: number = 12;
let current_likes: number;

describe('[HM] Поиск кота и добавление лайков', async () => {
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
        const response = await CoreApi.allByLetter(1);
        if (response.status === 404) {
          console.error('Тест 1 ☒', 'Ошибка выполнения GET запроса /allByLetter');
          assert.fail(`Кот не найден! Response:\n ${JSON.stringify(response.data, null, 2)}`);
        }

        console.debug('Тест 1 ☑', 'Получаем ответ на GET запрос /allByLetter');
        console.info('Тест 1 ☑', 'Случайным образом выбираем кота из списка');
        const num = getRandomInt(response.data.groups.length);
        console.info('Тест 1 ☑', 'Получаем информацию о случайно выбранном коте');
        actCat = response.data.groups[num].cats[0];
        allure.testAttachment(
          'Информация о коте',
          JSON.stringify(actCat, null, 2),
          'application/json');

        assert.ok(response.status === 200, `Текущий статус код ${response.status}`);
      },
    );
  });

  it('2. Получение и сохранение лайков', async () => {

    await allure.step(`Получение лайков у кота: ${actCat.name}`,
      async () => {
        console.warn('Тест 2 ☑', 'Выполняем извлечение количества лайков');
        current_likes = actCat.likes;
        console.debug('Тест 2 ☑', 'Сохраняем количество лайков у кота');
        allure.testAttachment(
          'Информация о количестве лайков',
          JSON.stringify(`likes: ${actCat.likes}`, null, 2),
          'application/json',
        );
        //Честно, не совсем понимаю что проверять в обычном парсе данных
        assert.ok(current_likes === actCat.likes, `Значения не совпадают ${current_likes} / ${actCat.likes}`,
        );
      });

    // // Вариант с запросом по id, но не вижу смысла, т.к. все уже есть в actCat
    // const status: number = 200;
    // await allure.step(`Получение лайков у кота: ${actCat.name}`,
    //   async () => {
    //     console.warn('Тест 2 ☑', 'Выполняем GET запрос /getCatById');
    //     const response = await CoreApi.getCatById(actCat.id);
    //     console.debug('Тест 2 ☑', 'Получаем ответ на GET запрос /getCatById');
    //     console.info('Тест 2 ☑', 'Сохраняем количесво лайков у кота');
    //     current_likes = response.data.cat.likes;
    //     assert.ok(response.status === 200, `Текущий статус код ${response.status}`);
    //   });
  });

  it('3. Добавление лайков коту ', async () => {
    const data = { like: true, dislike: null };
    await allure.step(`Добавление лайков коту: ${actCat.id}`,
      async () => {
        console.warn('Тест 3 ☑', `Выполняем POST запрос /likes ${count_likes} раз`);
        for (let i = 1; i < count_likes; i++) {
          await LikeApi.likes(actCat.id, data);
        }
        const response = await LikeApi.likes(actCat.id, data);
        console.debug('Тест 3 ☑', 'Выполнен POST запрос /likes');
        allure.testAttachment(
          'Информация о запросе',
          JSON.stringify(response.data, null, 2),
          'application/json',
        );
        assert.ok(response.status === 200, `Текущий статус код ${response.status}`);
        assert.equal(response.data.likes, current_likes + count_likes, `Значения не совпадают! Текущее: ${response.data.likes} / Ожидаемое: ${current_likes + count_likes}`);
      });
  });

  it('4. Проверка количества лайков у кота ', async () => {
    await allure.step(` Проверка количества лайков у кота: ${actCat.id}`,
      async () => {
        console.warn('Тест 4 ☑', 'Выполняем GET запрос /getCatById');
        const response = await CoreApi.getCatById(actCat.id);
        console.debug('Тест 4 ☑', 'Получаем ответ на GET запрос /getCatById');
        console.info('Тест 4 ☑', 'Сравниваем текущее количесво лайков у кота и ожидаемое');
        assert.ok(response.status === 200, `Текущий статус код ${response.status}`);
        assert.equal(response.data.cat.likes, current_likes + count_likes, `Значения не совпадают! Текущее: ${response.data.cat.likes} / Ожидаемое: ${current_likes + count_likes}`);
      });
  });
});