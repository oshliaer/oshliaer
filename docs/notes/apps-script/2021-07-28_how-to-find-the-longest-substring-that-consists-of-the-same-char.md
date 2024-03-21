---
date: 2021-07-28
title: Фильтр "Сегодня" для Gmail
---

## Как найти самую длинную подстроку, содержащую оидн и тот же символ

### Через `split()`

```js
{
  const out = 'asdfsdfffff  ffdsafrewtwwwwwt'.split('').reduce(
    (r, s, i, a) => {
      if (s === a[i - 1]) {
        r.data[r.data.length - 1] += 1;
      } else {
        if (
          r.data[r.data.length - 1] &&
          r.max[0]?.length < r.data[r.data.length - 1]
        ) {
          const item = {
            symbol: a[i - 1],
            length: r.data[r.data.length - 1],
          };
          r.max = [item];
        } else if (
          r.data[r.data.length - 1] &&
          r.max[0]?.length === r.data[r.data.length - 1]
        ) {
          const item = {
            symbol: a[i - 1],
            length: r.data[r.data.length - 1],
          };
          r.max.push(item);
        }
        r.data.push(1);
      }
      return r;
    },
    {
      data: [],
      max: [
        {
          symbol: undefined,
          length: 0,
        },
      ],
    }
  );
  console.log(JSON.stringify(out.max, null, '  '));
}
```

### Через подстроку регулярного выражения

```js
{
  const out = 'asdfsdfffff  ffdsafrewtwwwwwt'
    .match(/(.+?)\1*/g)
    .map((item) => ({
      symbol: item[0],
      length: item.length,
    }))
    .sort((a, b) => b.length - a.length)
    .filter((item, _, a) => item.length === a[0].length);
  console.log(JSON.stringify(out, null, '  '));
}
```

### Результат

```json
[
  {
    "symbol": "f",
    "length": 5
  },
  {
    "symbol": "w",
    "length": 5
  }
]
```
