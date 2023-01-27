## Отправляем данные Таблицы Гугл на локальный ПК через меню

### Создаем локальный сервер

Можно из чего угодно. Тут на [NodeJS] и [Express]

#### Файл index.js

```js
const express = require('express');
const app = express();
const port = 8081;

app.get('/', (req, res) => {
  console.log(req.query);
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

### Запускаем локальный сервер

```sh
$> node index.js
```

### Поднимаем туннель

Надо поставить [ngrok] или любую другую приблуду этого назначения:

* ngrok
* localtunnel
* pagekit
* tailscale
* and many others

Тут ngrok

```sh
$> ngrok http http://localhost:8081
```

Команда выше даст нам URL вида `https://abcd-12-456-789-000.ngrok.io`

### Часть кода из Таблицы Google

```js
function onOpen() {
  SpreadsheetApp.getUi()
    .addItem('Послать привет', 'userActionCallUrl')
    .addToUi();
}

function userActionCallUrl() {
  const param = encodeURIComponent(SpreadsheetApp.getActiveRange().getValue());
  const url = `https://d844-82-151-123-160.ngrok.io/?param=${param}`;
  UrlFetchApp.fetch(url);
}
```

### Жмем кнопку

Как жать кнопку показано тут https://t.me/googleappsscriptrc/56026

[nodejs]: https://nodejs.org/en/
[express]: https://expressjs.com/
[ngrok]: https://ngrok.com/