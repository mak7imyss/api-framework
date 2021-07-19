import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { Cat } from '../@types/common';
import { allure } from 'allure-mocha/runtime';

const getRandomInt = (max: number) => Math.floor(Math.random() * max);
let actCat: Cat;

describe('[HM] Поиск и удаление кота', async () => {
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

  it('2. Удаление случайно найденного кота', async () => {
    const status: number = 200;

    await allure.step(`Удаление кота: ${actCat.name}`,
      async () => {
        console.warn('Тест 2 ☑', 'Выполняем DELETE запрос /remove');
        const response = await CoreApi.removeCat(actCat.id);
        console.debug('Тест 2 ☑', 'Получаем ответ на DELETE запрос /remove');
        allure.testAttachment(
          'Информация об удаленном коте',
          JSON.stringify(response.data, null, 2),
          'application/json',
        );
        assert.ok(response.status === status, `Текущий статус код ${response.status}`,
        );
      });
  });

  it('3. Проверка что кота больше нет ', async () => {
    await allure.step(`Удаление удаленного кота с id ${actCat.id}`,
      async () => {
        console.warn('Тест 3 ☑', 'Выполняем DELETE запрос /remove');
        const response = await CoreApi.removeCat(actCat.id);
        console.debug('Тест 3 ☑', 'Получаем ответ на DELETE запрос /remove');
        allure.testAttachment(
          'Информация о запросе',
          JSON.stringify(response.data, null, 2),
          'application/json',
        );
        assert.equal(response.data['output'].payload['message'], `Кот с id=${actCat.id} не найден`, 'Кот не удален');
      });
  });
});