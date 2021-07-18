import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { Cat } from '../@types/common';
import { allure } from 'allure-mocha/runtime';

const getRandomInt = (max: number) => Math.floor(Math.random() * max);
let actCat: Cat;

describe('[HM] Поиск и удаление кота', async () => {
  it('1. Поиск случайного кота', async () => {
    const response = await CoreApi.allByLetter(1);
    const num = getRandomInt(response.data.groups.length);

    if (response.status === 404) {
      assert.fail(`Кот не найден! Response:\n ${JSON.stringify(response.data, null, 2)}`);
    }
    actCat = response.data.groups[num].cats[0];

    allure.logStep(`Найден случайный кот: ${actCat.name}`);
    allure.testAttachment(
      'Информация о коте',
      JSON.stringify(actCat, null, 2),
      'application/json'
    );


    assert.ok(response.status === 200, `Имя случайного кота: [${actCat.name}]`);

  });

  it('2. Удаление случайно найденного кота', async () => {

    const status: number = 200;

    const response = await CoreApi.removeCat(actCat.id);

    allure.logStep(`Удаление кота: ${actCat.name}`);
    allure.testAttachment(
      'Информация об удаленном коте',
      JSON.stringify(response.data, null, 2),
      'application/json'
    );

    assert.ok(response.status === status, `Актуальный статус код ${response.status}`
    );
  });

  it('3. Проверка что кота больше нет ', async () => {

    const response = await CoreApi.removeCat(actCat.id);

    allure.logStep(`Запрос на удаление удаленного кота: ${actCat.name}`);
    allure.testAttachment(
      'Информация о запросе',
      JSON.stringify(response.data, null, 2),
      'application/json'
    );
    assert.equal(response.data['output'].payload['message'], `Кот с id=${actCat.id} не найден`, 'Кот не удален');

  });
});