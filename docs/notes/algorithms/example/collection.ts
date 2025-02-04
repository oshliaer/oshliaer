export type CollectionType = string | Date | number | boolean;

export interface CollectionItemValue {
  __val: unknown;
  __row: number;
  __col: number;
}

export interface CollectionItemValueModified extends CollectionItemValue {
  __oldValue: unknown;
  __modified: boolean;
}

export interface CollectionItem {
  [key: string]: CollectionItemValue;
}

export type Collection = CollectionItem[];
