import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { Cat } from '../@types/common';
import { allure } from 'allure-mocha/runtime';

const getRandomInt = (max: number) => Math.floor(Math.random() * max);
let expectedCat: Cat;

describe('[HM] Поиск и удаление кота', async () => {
  before(() => {
    console.log('Начало тестирования');
  });
  beforeEach(() => {
    console.log('Запуск теста!');
  });
  afterEach(() => {
    console.log('Завершение теста!');
    console.info('♺', 'Убираем за собой, возвращая кота');
    CoreApi.addCat([{ name: expectedCat.name, description: expectedCat.description, gender: expectedCat.gender }]);
  });
  after(() => {
    console.log('Завершение тестирования, ознакомьтесь с отчетом');
  });

  it('1. Поиск случайного кота', async () => {
    const status: number = 200;
    console.info('Тест 1 ☑', 'Запрашиваем список котов сгруппированный по группам с 1 котом в группе');

    await allure.step('Находим случайного кота',
      async () => {
        console.warn('Тест 1 ☑', 'Выполняем GET запрос /allByLetter для поиска группы котов');
        const response = await CoreApi.getAllCarsByLetter(1);
        if (response.status === 404) {
          console.error('Тест 1 ☒', 'Ошибка выполнения GET запроса /allByLetter');
          assert.fail(`Кот не найден! Response:\n ${JSON.stringify(response.data, null, 2)}`);
        }
        console.debug('Тест 1 ☑', 'Получаем ответ на GET запрос /allByLetter');
        console.info('Тест 1 ☑', 'Случайным образом выбираем кота из полученного списка');
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
    await allure.step(`Удаление кота: ${expectedCat.name}`,
      async () => {
        console.warn('Тест 2 ☑', 'Выполняем DELETE запрос /remove для удаления кота');
        const response = await CoreApi.removeCat(expectedCat.id);
        console.debug('Тест 2 ☑', 'Получаем ответ на DELETE запрос /remove');
        allure.testAttachment(
          'Информация об удаленном коте',
          JSON.stringify(response.data, null, 2),
          'application/json',
        );
        assert.ok(response.status === status, `Текущий статус код ${response.status}`,
        );
      },
    );
    await allure.step(`Проверка что кот: ${expectedCat.id} удален`,
      async () => {
        console.warn('Тест 3 ☑', 'Выполняем GET запрос /get-by-id с данными удаленного кота');
        const response = await CoreApi.getCatById(expectedCat.id);
        console.debug('Тест 3 ☑', 'Получаем ответ на GET запрос /get-by-id');
        allure.testAttachment(
          'Информация о запросе',
          JSON.stringify(response.data, null, 2),
          'application/json',
        );
        assert.equal(response.data['output'].payload['message'], `Кот с id=${expectedCat.id} не найден`, 'Кот не удален');
      });

  });
});