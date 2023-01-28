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

Как жать кнопку показано [тут][postlink]

[![](https://cdn4.telegram-cdn.org/file/TbeLCP0SBsCzEirbVKdb3aytLb27iq_EpK-429XByEhQPp8b53DX_DLULSt_3R_sou2ZhTSjgaDgkbmXqx_DOcV0FoGt3tN8K9JUyl0mHjoGs1qBsLvurm31F65BK_H_nz-YnR1EMdECzZN0EWgwQ58awsmwVRSotiN1m3XyA_3Da2TpQU4R30u9ssXAr90-HkZZ37ysH3l3FgA05wAvENzbCe8v-iPgdS9dD7D-Lm-Y3onzrldDs1LG8qKCaeDxLggfZEJR_YOEf0FSu1rUXCohTRoQYsJNgfwepJwfAnKgs9IGIyz0EKASOOLvlj3lFg0EZmVjjDkevYDvAnOqLQ)][postlink]

[nodejs]: https://nodejs.org/en/
[express]: https://expressjs.com/
[ngrok]: https://ngrok.com/
[postlink]: https://t.me/gasru/381