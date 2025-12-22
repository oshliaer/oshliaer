# curl, HTTP-методы и заголовок Host

## HTTP-методы: GET и POST

**GET** — получить данные:

```bash
curl -X GET "http://example.com/api/users"
```

**POST** — отправить данные:

```bash
curl -X POST "http://example.com/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ivan"}'
```

Основные флаги:

- `-X` — метод (GET, POST, PUT, DELETE)
- `-H` — заголовок
- `-d` — тело запроса (данные)

## Что такое заголовок Host?

Когда браузер или curl отправляет запрос, он добавляет заголовок `Host` с доменом:

```
GET /api/users HTTP/1.1
Host: example.com
```

Обычно это происходит автоматически из URL. Но можно указать вручную:

```bash
curl -H "Host: example.com" http://example.com/api/users
```

## Зачем указывать Host вручную?

### Виртуальный хостинг

На одном сервере (один IP) может работать несколько сайтов/сервисов:

```
IP: 10.145.16.60
├── mp-data.example.com
├── vk-gateway.example.com
└── api.example.com
```

Nginx (reverse proxy) смотрит на заголовок `Host` и решает куда направить запрос:

```
Host: mp-data.example.com → контейнер mp-data
Host: vk-gateway.example.com → контейнер vk-gateway
```

### Когда нужно указывать Host вручную?

**Ситуация:** Внутренняя сеть, DNS не резолвит домен, но ты знаешь IP сервера.

```bash
# Не работает — DNS не знает этот домен внутри сети
curl http://mp-data.example.com/api/jobs

# Работает — идём на IP, но говорим nginx какой сервис нужен
curl http://10.145.16.60/api/jobs \
  -H "Host: mp-data.example.com"
```

### Схема запроса

```
┌─────────────┐     IP: 10.145.16.60      ┌─────────────┐
│   Клиент    │ ───────────────────────▶  │    Nginx    │
│             │   Host: mp-data...        │             │
└─────────────┘                           └──────┬──────┘
                                                 │
                         ┌───────────────────────┼───────────────────────┐
                         ▼                       ▼                       ▼
                  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
                  │   mp-data   │         │ vk-gateway  │         │   другой    │
                  │   сервис    │         │   сервис    │         │   сервис    │
                  └─────────────┘         └─────────────┘         └─────────────┘
```

## Пример из нашего проекта

MP Data API на внутренней сети:

```bash
# Внешний запрос (через интернет) — Host подставляется автоматически
curl https://mp-data.example.com/api/jobs/batch

# Внутренний запрос (внутри сети) — нужен Host вручную
curl http://10.145.16.60/api/jobs/batch \
  -H "Host: mp-data.example.com" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_live_..." \
  -d '{"skus": ["123"]}'
```

В коде это решается через переменные:

```
MP_DATA_BASE_URL=http://10.145.16.60      # куда идёт запрос
MP_DATA_HOST=mp-data.example.com       # что в заголовке Host
```

## Резюме

| Ситуация | Host нужен вручную? |
|----------|---------------------|
| Обычный запрос по домену | Нет, подставляется автоматически |
| Запрос по IP на сервер с одним сайтом | Нет |
| Запрос по IP на сервер с несколькими сайтами (virtual hosting) | **Да** |
| Тестирование до настройки DNS | **Да** |
