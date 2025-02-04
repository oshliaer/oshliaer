import { Collection, CollectionItem } from './collection';

const newValues = [
  ['id', 'param', 'status', 'mark'],
  ['Заказ 4', 1, 'done', 'mark'],
  ['Заказ 2', 1, 'in proc', 'mark'],
  ['Заказ 3', 1, 'in proc', 'mark'],
];

const oldValues = [
  ['id', 'param', 'status', 'mark'],
  ['Заказ 1', 1, 'done', 'mark'],
  ['Заказ 2', 2, 'done', 'mark'],
  ['Заказ 3', 1, 'done', 'mark'],
];

const newHeaders: string[] = newValues[0].map((header, colIndex) =>
  header ? String(header).toLowerCase() : `__col${colIndex}`
);

const newData = newValues.slice(1).reduce((acc, value, rowIndex) => {
  const item = newHeaders.reduce((obj, header, colIndex) => {
    obj[header] = {
      __val: value[colIndex],
      __row: rowIndex + 2,
      __col: colIndex + 1,
    };
    return obj;
  }, {});
  acc.push(item);
  return acc;
}, [] as unknown as Collection);

const oldHeaders: string[] = oldValues[0].map((header, colIndex) =>
  header ? String(header).toLowerCase() : `__col${colIndex}`
);

const oldData = oldValues.slice(1).reduce((acc, value, rowIndex) => {
  const item = newHeaders.reduce((obj, header, colIndex) => {
    obj[header] = {
      __val: value[colIndex],
      __row: rowIndex + 2,
      __col: colIndex + 1,
    };
    return obj;
  }, {});
  acc.push(item);
  return acc;
}, [] as unknown as Collection);

const newDataMap = newData.reduce((acc, item) => {
  const key = String(item['id'].__val);
  acc[key] = item;
  return acc;
}, {} as { [key: string]: CollectionItem });

const oldDataMap = oldData.reduce((acc, item) => {
  const key = String(item['id'].__val);
  acc[key] = item;
  return acc;
}, {} as { [key: string]: CollectionItem });

const newKeys = Object.keys(newDataMap);
const oldKeys = Object.keys(oldDataMap);

// Новые
const newItems = newKeys.filter((key) => !oldKeys.includes(key)).map((key) => newDataMap[key]);

// Старые
const oldItems = oldKeys.filter((key) => !newKeys.includes(key)).map((key) => oldDataMap[key]);

// Измененные
const changedItems = newKeys
  .filter((key) => oldKeys.includes(key))
  .map((key) => {
    const _new = newDataMap[key];
    const _old = oldDataMap[key];

    const result = {
      __modified: { __status: false },
      id: key,
      new: _new,
      old: _old,
    };

    newHeaders.forEach((header) => {
      if (header === 'id') return;
      if (_new[header].__val !== _old[header].__val) {
        result.__modified[header] = {
          new: _new[header].__val,
          old: _old[header].__val,
        };
        result.__modified.__status = true;
      }
    });

    oldHeaders.forEach((header) => {
      if (header === 'id') return;
      if (_new[header].__val !== _old[header].__val && result[header] === undefined) {
        result.__modified[header] = {
          new: _new[header].__val,
          old: _old[header].__val,
        };
        result.__modified.__status = true;
      }
    });

    return result;
  })
  .filter((item) => item.__modified.__status);

console.log('newItems', newItems);
console.log('oldItems', oldItems);
console.log('changedItems', changedItems);
