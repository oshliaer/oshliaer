---
date: 2024-02-07
title: Простое веб-приложение
---

## Простое веб-приложение на Google Apps Script

### Минимальный код

Реагирует на GET-зпросы. При вызове возвращает страницу с перечнем переданных параметров в строке запроса

```js
function doGet(e) {
  return HtmlService.createHtmlOutput(JSON.stringify(e.parameter));
}
```

### Запись в Таблицу

Пишет в первый лист заданной Таблицы. В теле POST-запроса требует два параметра `name` и `value`

```js
function doPost(e) {
  const res = {
    success: undefined,
  };
  try {
    const { name, value } = JSON.parse(e.postData.contents);
    const date = new Date();
    const book = SpreadsheetApp.openById('10U5LKQUiektqliOXmBpl4oD1RXaRo_XbZGKWb01dR84');
    const sheet = book.getSheets()[0];
    sheet.appendRow([date, name, value]);
    res.success = true;
  } catch (error) {
    res.success = false;
    res.error = error.message;
  }
  return ContentService.createTextOutput(JSON.stringify(res));
}
```

```shell
$> curl -H 'Content-Type: application/json' -d '{"name":"iam","value":2}' -L https://script.google.com/macros/s/AKfycbxbJArNzRl3IdBZgYkfwz0-y8AdPzOh68d7X4hKIDGKTuwBG2ZtO04_GZkGdq0EdZ8L/exec
$< {"success":true}
```
