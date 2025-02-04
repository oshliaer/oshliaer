export type CollectionType = string | number | boolean | Date;

export interface CollectionItemValue {
  __val: CollectionType;
  __row: number;
  __col: number;
}

export interface CollectionItem {
  [key: string]: CollectionItemValue;
}

export type Collection = CollectionItem[];
