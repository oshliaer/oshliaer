---
date: 2025-06-24
title: Как добавить и настроить Redis для n8n
---

## Обзор

Для повышения производительности и надежности n8n можно настроить на использование Redis для управления очередями и кэширования. Redis обеспечивает более стабильную работу с большими объемами данных и улучшает производительность выполнения воркфлоу.

## Добавление сервиса Redis в docker-compose.yml

Добавьте следующий сервис в ваш `docker-compose.yml`:

```yaml
  redis:
    image: "redis:latest"
    container_name: redis
    hostname: redis
    restart: unless-stopped
    security_opt:
      - "no-new-privileges:true"
    networks:
      - proxy
    volumes:
      - redis_data:/data
```

Также необходимо определить том для хранения данных Redis в секции `volumes`:

```yaml
volumes:
  n8n_data:
    external: true
  redis_data:
```

## Настройка n8n для работы с Redis

В сервисе `n8n` в `docker-compose.yml` добавьте следующие переменные окружения:

```yaml
    environment:
      # ...существующие переменные...
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_DB=0
      - N8N_CACHE_TYPE=redis
      - N8N_CACHE_REDIS_HOST=redis
      - N8N_CACHE_REDIS_PORT=6379
      - N8N_CACHE_REDIS_DB=1
```

## Применение изменений

После сохранения `docker-compose.yml` выполните команду, чтобы пересоздать контейнеры с новой конфигурацией:

```bash
docker-compose up -d
```

## Проверка подключения к Redis

После перезапуска контейнеров выполните `docker inspect n8n` и проверьте секцию `Config.Env`. Если вы видите переменные `EXECUTIONS_MODE=queue`, `QUEUE_BULL_REDIS_HOST=redis` и другие, значит, n8n успешно подключился к Redis.

## Настройка пароля и внешнего доступа к Redis

По умолчанию Redis в данной конфигурации работает без пароля и недоступен извне. Это безопасно для внутреннего использования.

Если вам нужен доступ к Redis из других приложений (не из Docker), необходимо:

1. **Установить пароль**
2. **Опубликовать порт**

Для этого измените сервис `redis` в `docker-compose.yml`:

```yaml
  redis:
    image: "redis:latest"
    container_name: redis
    hostname: redis
    restart: unless-stopped
    # Устанавливаем пароль. Замените 'ВАШ_ПАРОЛЬ' на надежный пароль.
    command: redis-server --requirepass 'ВАШ_ПАРОЛЬ'
    security_opt:
      - "no-new-privileges:true"
    # Публикуем порт для внешнего доступа
    ports:
      - "6379:6379"
    networks:
      - proxy
    volumes:
      - redis_data:/data
```

И добавьте переменные с паролем в сервис `n8n`:

```yaml
    environment:
      # ...существующие переменные...
      - QUEUE_BULL_REDIS_PASSWORD='ВАШ_ПАРОЛЬ'
      - N8N_CACHE_REDIS_PASSWORD='ВАШ_ПАРОЛЬ'
```

После этого снова выполните `docker-compose up -d` для применения изменений.

## Преимущества использования Redis с n8n

- **Улучшенная производительность**: Redis обеспечивает быстрый доступ к данным и кэширование
- **Масштабируемость**: Позволяет распределить нагрузку между несколькими экземплярами n8n
- **Надежность**: Очереди в Redis более устойчивы к сбоям
- **Мониторинг**: Возможность отслеживать состояние очередей и производительность

## Дополнительные настройки

### Конфигурация Redis для production

Для production-среды рекомендуется дополнительно настроить:

```yaml
  redis:
    image: "redis:latest"
    container_name: redis
    hostname: redis
    restart: unless-stopped
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    security_opt:
      - "no-new-privileges:true"
    networks:
      - proxy
    volumes:
      - redis_data:/data
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Мониторинг Redis

Вы можете добавить Redis Commander для веб-интерфейса управления Redis:

```yaml
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: redis-commander
    restart: unless-stopped
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"
    networks:
      - proxy
    depends_on:
      - redis
```
