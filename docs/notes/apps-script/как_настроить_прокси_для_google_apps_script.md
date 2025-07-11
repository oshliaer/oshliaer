---
date: 2025-07-11
title: 'Как настроить прокси для Google Apps Script через Yandex.Cloud: Основное руководство'
---

## Введение

При работе с `UrlFetchApp` в Google Apps Script разработчики сталкиваются с фундаментальной проблемой: исходящие запросы отправляются с динамических IP-адресов. Это становится непреодолимым препятствием, когда внешний API требует, чтобы запросы приходили только с заранее известных IP-адресов, добавленных в "белый список".

Решением является создание прокси-сервера в Yandex.Cloud. Это руководство предлагает два проверенных сценария, а также лучшие практики для безопасного и надежного развертывания.

1. **Сценарий А: Простой и быстрый доступ.** Идеален, когда целевой сервис доверяет всему диапазону IP-адресов Yandex.Cloud.
2. **Сценарий Б: Доступ по статическому IP-адресу.** Незаменимый вариант, когда целевой сервис требует один неизменяемый IP в своем списке разрешенных.

---

## Сценарий А: Быстрый старт для доверенных сервисов

**Архитектура:** `Google Apps Script → Yandex API Gateway → Yandex Cloud Function → Интернет`

### Шаг 1: Создание Cloud Function

1. **Подготовьте файлы:**
    * `package.json`:
        
        ```json
        {
          "name": "proxy-function",
          "version": "1.0.0",
          "main": "index.js",
          "dependencies": {
            "axios": "^1.7.2"
          }
        }
        ```

    * `index.js`:

        ```javascript
        const axios = require('axios');

        module.exports.handler = async (event) => {
            const body = JSON.parse(event.body);
            const { targetUrl, method, headers, body: requestBody } = body;

            if (!targetUrl) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Параметр "targetUrl" обязателен.' }) };
            }

            const headersToForward = { ...headers };
            delete headersToForward.host;

            try {
                const response = await axios({
                    method: method || 'GET',
                    url: targetUrl,
                    headers: headersToForward,
                    data: requestBody || {},
                    timeout: 10000, // Таймаут 10 сек. Увеличьте, если целевой API отвечает дольше.
                    validateStatus: () => true, // Позволяет проксировать ответы с ошибками (4xx/5xx).
                });

                return {
                    statusCode: response.status,
                    headers: response.headers,
                    body: JSON.stringify(response.data),
                };
            } catch (error) {
                // Ошибка, когда ответ от сервера не получен (сеть, DNS, таймаут).
                console.error('Ошибка при выполнении прокси-запроса:', error.message);
                return {
                    statusCode: 502, // Bad Gateway
                    body: JSON.stringify({ error: 'Ошибка прокси-шлюза', details: error.message }),
                };
            }
        };
        ```

2. **Создайте функцию** в консоли, оставив сетевые настройки по умолчанию ("публичная сеть").

### Шаг 2: Создание API Gateway

1. Создайте шлюз со спецификацией ниже.
    > **Настройка прав:** Перед созданием шлюза убедитесь, что у вас есть **сервисный аккаунт** с ролью `serverless.functions.invoker` для вашей функции. Это делается в `IAM` и на вкладке "Права доступа" вашей функции.

    ```yaml
    openapi: 3.0.0
    info:
      title: Simple Proxy API
      version: 1.0.0
    paths:
      /proxy:
        post:
          summary: Proxies a request
          x-yc-apigateway-integration:
            type: cloud_functions
            function_id: YOUR_FUNCTION_ID
            service_account_id: YOUR_SERVICE_ACCOUNT_ID_WITH_INVOKER_ROLE
    # (остальная спецификация...)
    ```

2. Сохраните шлюз и скопируйте его **служебный домен**.

### Шаг 3: Настройка Google Apps Script

```javascript
function callServiceViaYandexProxy() {
  const proxyUrl = 'https://YOUR-API-GATEWAY-URL.apigw.yandexcloud.net/proxy';

  const proxyPayload = {
    targetUrl: 'https://api.example.com/data',
    method: 'GET',
    headers: { 'Authorization': 'Bearer YOUR_SECRET_TOKEN' }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(proxyPayload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(proxyUrl, options);
  Logger.log('Статус: %s, Ответ: %s', response.getResponseCode(), response.getContentText());
}
```

---

## Сценарий Б: Доступ по статическому IP-адресу

**Архитектура:** `Apps Script → API Gateway → Cloud Function (в VPC) → NAT-инстанс (Статический IP) → Интернет`

Выполните все те же шаги, что и в Сценарии А, со следующими изменениями на уровне инфраструктуры:

1. **Создайте Сеть (VPC)**, подсеть и **зарезервируйте Статический IP**.
2. **Создайте ВМ** на основе образа **"NAT-инстанс"** из Cloud Marketplace, привязав к ней зарезервированный IP.
3. **Настройте Таблицу маршрутизации**, которая направляет весь трафик (`0.0.0.0/0`) через внутренний IP NAT-инстанса, и привяжите ее к подсети.
4. **При создании Cloud Function** в разделе "Сеть" **укажите вашу VPC**.

> **Примечание по безопасности:** Убедитесь, что для вашей сети настроены **группы безопасности (Security Groups)**, разрешающие исходящий трафик по портам 80 (HTTP) и 443 (HTTPS) от NAT-инстанса.

---

## Финализация и лучшие практики для производственной среды

Прежде чем использовать решение в реальных проектах, рекомендуется выполнить следующие шаги.

### 1. Локальное тестирование логики функции

Чтобы отлаживать функцию без развертывания в облаке, можно протестировать ее логику локально.

1. Сохраните код вашей функции в `index.js`.
2. Создайте рядом файл `test.js`:

    ```javascript
    // test.js
    const { handler } = require('./index');

    // Эмулируем объект event, который приходит от API Gateway
    const mockEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
            targetUrl: 'https://httpbin.org/get', // Используем тестовый сервис
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        })
    };

    // Вызываем хендлер и выводим результат
    handler(mockEvent).then(response => {
        console.log('Результат выполнения:', response);
    });
    ```

3. Запустите тест из терминала: `node test.js`. Это поможет быстро найти ошибки в логике, не дожидаясь развертывания.

### 2. Усиление безопасности API Gateway

Публичный URL шлюза — это открытая дверь. Чтобы ее защитить, используйте **API-ключи**.

1. **Создайте API-ключ:** В сервисе **API Gateway** создайте ключ.
2. **Обновите спецификацию**, добавив требование безопасности:

    ```yaml
    # ... (начало спецификации)
    paths:
      /proxy:
        post:
          security: # <-- Добавьте этот блок
            - ApiKeyAuth: []
          # ... (остальные параметры)

    # ... (конец спецификации)
    components:
      securitySchemes: # <-- И этот блок
        ApiKeyAuth:
          type: apiKey
          in: header
          name: X-Yc-Apigateway-Api-Key
    ```

3. **Обновите код Apps Script**, чтобы передавать ключ в заголове:

    ```javascript
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { // <-- Добавьте этот блок
        'X-Yc-Apigateway-Api-Key': 'ВАШ_API_КЛЮЧ'
      },
      payload: JSON.stringify(proxyPayload),
      muteHttpExceptions: true
    };
    ```

### 3. Мониторинг и логирование

Регулярно проверяйте журналы выполнения в Yandex.Cloud:

* **Логи Cloud Functions:** для отслеживания ошибок выполнения кода.
* **Логи API Gateway** (включив их в настройках): для анализа входящих запросов, ошибок авторизации и других проблем на уровне шлюза.

Следуя этим рекомендациям, вы построите не просто рабочее, а по-настоящему надежное, безопасное и удобное в поддержке решение.
