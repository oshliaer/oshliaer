# Отправка сообщения Телеграм ботом при срабатывании триггера Yandex Tracker

## Настройка

- Метод: `POST`
- Адрес: `https://script.google.com/macros/s/AKfycbzKnQ33SMjtd0ZDc0NvRHRW5CYLZ3_4l-Dd-20hn9jyWIbIN3qDwlOqrhDlcJ3b91N5vw/exec`

## Советы

- Для каждого события лучше настраивать отдельный триггер, т.к. если данных для шаблона нет, то сообщение не уйдет
- Лучше иметь внешний обработчик для комплексного события

## Данные

```json
{
  "user": "{{currentUser}}",
  "issue": {
    "project": {
      "id": "{{issue.project.id}}",
      "name": "{{issue.project}}"
    },
    "id": "{{issue.id}}",
    "summary": "{{issue.summary}}",
    "description": {{issue.description.json}},
    "statusStartTime": "{{issue.statusStartTime}}",
    "status": "{{issue.status}}"
  },
  "userComment": {
    "text": "{{userComment.text}}",
    "author": "{{userComment.author}}",
    "authorLogin": "{{userComment.author.login}}",
    "id": "{{userComment.id}}"
  }
}
```
