import { Collection, CollectionItem, CollectionType } from './collection';

type DataArray = (string | number)[][];
type DataMap = { [key: string]: CollectionItem };
type ModifiedItem = {
  __modified: { 
    __status: boolean;
    [key: string]: { new: CollectionType; old: CollectionType } | boolean;
  };
  id: string;
  new: CollectionItem;
  old: CollectionItem;
};

/**
 * Класс для сравнения состояний коллекций данных
 */
class StateComparator {
  private newHeaders: string[];
  private oldHeaders: string[];
  private newDataMap: DataMap;
  private oldDataMap: DataMap;

  /**
   * @param newValues - Новый массив данных
   * @param oldValues - Старый массив данных
   */
  constructor(private newValues: DataArray, private oldValues: DataArray) {
    this.newHeaders = this.createHeaders(newValues[0]);
    this.oldHeaders = this.createHeaders(oldValues[0]);
    
    const newData = this.createCollectionData(newValues);
    const oldData = this.createCollectionData(oldValues);
    
    this.newDataMap = this.createDataMap(newData);
    this.oldDataMap = this.createDataMap(oldData);
  }

  /**
   * Создает массив заголовков из первой строки данных
   */
  private createHeaders(headerRow: (string | number)[]): string[] {
    return headerRow.map((header, colIndex) =>
      header ? String(header).toLowerCase() : `__col${colIndex}`
    );
  }

  /**
   * Преобразует массив данных в коллекцию объектов
   */
  private createCollectionData(values: DataArray): Collection {
    return values.slice(1).reduce((acc, value, rowIndex) => {
      const item = this.newHeaders.reduce((obj, header, colIndex) => {
        obj[header] = {
          __val: value[colIndex],
          __row: rowIndex + 2,
          __col: colIndex + 1,
        };
        return obj;
      }, {} as CollectionItem);
      acc.push(item);
      return acc;
    }, [] as Collection);
  }

  /**
   * Создает Map объектов по их ID
   */
  private createDataMap(data: Collection): DataMap {
    return data.reduce((acc, item) => {
      const key = String(item['id'].__val);
      acc[key] = item;
      return acc;
    }, {} as DataMap);
  }

  /**
   * Находит новые элементы, которых нет в старой коллекции
   */
  public getNewItems(): CollectionItem[] {
    const oldKeysSet = new Set(Object.keys(this.oldDataMap));
    return Object.keys(this.newDataMap)
      .filter(key => !oldKeysSet.has(key))
      .map(key => this.newDataMap[key]);
  }

  /**
   * Находит удаленные элементы, которых нет в новой коллекции
   */
  public getOldItems(): CollectionItem[] {
    const newKeysSet = new Set(Object.keys(this.newDataMap));
    return Object.keys(this.oldDataMap)
      .filter(key => !newKeysSet.has(key))
      .map(key => this.oldDataMap[key]);
  }

  /**
   * Находит измененные элементы и их различия
   */
  public getChangedItems(): ModifiedItem[] {
    const newKeysSet = new Set(Object.keys(this.newDataMap));
    const oldKeysSet = new Set(Object.keys(this.oldDataMap));

    return Array.from(newKeysSet)
      .filter(key => oldKeysSet.has(key))
      .map(key => {
        const _new = this.newDataMap[key];
        const _old = this.oldDataMap[key];
        
        const result: ModifiedItem = {
          __modified: { __status: false },
          id: key,
          new: _new,
          old: _old,
        };

        // Проверяем все заголовки за один проход
        const allHeaders = new Set([...this.newHeaders, ...this.oldHeaders]);
        allHeaders.forEach(header => {
          if (header === 'id') return;
          
          const newVal = _new[header]?.__val;
          const oldVal = _old[header]?.__val;
          
          if (newVal !== oldVal) {
            result.__modified[header] = {
              new: newVal as CollectionType,
              old: oldVal as CollectionType,
            };
            result.__modified.__status = true;
          }
        });

        return result;
      })
      .filter(item => item.__modified.__status);
  }
}

// Пример использования
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

const comparator = new StateComparator(newValues, oldValues);

console.log('newItems', comparator.getNewItems());
console.log('oldItems', comparator.getOldItems());
console.log('changedItems', comparator.getChangedItems());
