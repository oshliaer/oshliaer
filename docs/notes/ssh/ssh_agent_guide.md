---
date: 2025-12-16
title: "SSH-агент: От простого к сложному"
---

# SSH-агент: От простого к сложному

## Что такое SSH-агент

SSH-агент — это фоновый процесс (daemon), который хранит приватные ключи в памяти и предоставляет их по запросу SSH-клиенту. Это позволяет избежать многократного ввода паролей от ключей и упрощает работу с несколькими аккаунтами.

## Простые примеры

### 1. Базовое использование

```bash
# Запуск агента
eval $(ssh-agent)

# Добавление ключа
ssh-add ~/.ssh/id_rsa

# Проверка загруженных ключей
ssh-add -l
```

### 2. Автоматический запуск при старте сессии

Добавить в `~/.bashrc` или `~/.zshrc`:
```bash
# Запуск агента, если ещё не запущен
if [ -z "$SSH_AGENT_PID" ]; then
    eval $(ssh-agent)
fi
```

## Средний уровень

### 3. Работа с несколькими ключами

```bash
# Очистить агент и добавить конкретные ключи
ssh-add -D
ssh-add ~/.ssh/key1 ~/.ssh/key2 ~/.ssh/key3

# Загрузить только нужный ключ
ssh-add ~/.ssh/oshliaer_ed25519
```

### 4. Управление ключами через функции

```bash
# Функции для быстрого переключения
lk_osh() {
    ssh-add -D
    ssh-add ~/.ssh/oshliaer_ed25519
}

lk_con() {
    ssh-add -D
    ssh-add ~/.ssh/contributorpw_rsa
}

lk_ls() {
    ssh-add -l
}

lk_clean() {
    ssh-add -D
}
```

### 5. Настройка SSH-конфига для работы с агентом

```ssh
# ~/.ssh/config
Host github.com
  HostName github.com
  User git
  IdentitiesOnly yes  # использовать только из агента

Host *
  AddKeysToAgent yes  # добавлять ключи в агент при использовании
```

## Продвинутые примеры

### 6. Временная загрузка ключей с ограничениями

```bash
# Загрузить ключ на 1 час (3600 секунд)
ssh-add -t 3600 ~/.ssh/work_key

# Загрузить ключ на 8 часов
ssh-add -t 8h ~/.ssh/personal_key

# Проверить срок действия ключей
ssh-add -l -v
```

### 7. Управление агентом через systemd (Linux)

Создать `~/.config/systemd/user/ssh-agent.service`:
```ini
[Unit]
Description=SSH key agent

[Service]
Type=forking
Environment=SSH_AUTH_SOCK=%t/ssh-agent.socket
ExecStart=/usr/bin/ssh-agent -D -a $SSH_AUTH_SOCK

[Install]
WantedBy=default.target
```

Включить:
```bash
systemctl enable --user ssh-agent
systemctl start --user ssh-agent
```

### 8. Интеграция с GPG-агентом

Если используешь GPG-ключ как SSH-ключ:
```bash
# В ~/.gnupg/gpg-agent.conf
write-env-file
extra-socket /run/user/$(id -u)/gnupg/S.gpg-agent.extra
```

Тогда можно использовать GPG-ключ как SSH:
```bash
# Экспортировать GPG-ключ в формате SSH
gpg-connect-agent "keyinfo --list" /bye
ssh-add -L | grep gpg
```

### 9. Скрипт для автоматической загрузки ключей по времени суток

```bash
# ~/.bashrc
auto_load_keys() {
    hour=$(date +%H)
    
    if [ $hour -ge 9 ] && [ $hour -lt 18 ]; then
        # Рабочее время — загрузить рабочие ключи
        ssh-add -D
        ssh-add ~/.ssh/work_key
    else
        # Вечер/ночь — загрузить личные ключи
        ssh-add -D
        ssh-add ~/.ssh/personal_key
    fi
}

# Вызывать при старте каждой сессии
auto_load_keys
```

### 10. Умная загрузка ключей по контексту

```bash
# Проверка, находится ли пользователь в рабочей директории
smart_key_load() {
    if [[ $PWD == /work/* ]]; then
        lk_work  # функция для загрузки рабочих ключей
    elif [[ $PWD == /personal/* ]]; then
        lk_personal  # функция для загрузки личных ключей
    fi
}

# Добавить в ~/.bashrc
PROMPT_COMMAND=smart_key_load
```

### 11. Использование сокетов для межпроцессного взаимодействия

```bash
# Создание сокета в стандартном месте
export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/ssh-agent.socket"

# Проверка, существует ли сокет
if [ ! -S "$SSH_AUTH_SOCK" ]; then
    eval $(ssh-agent -a "$SSH_AUTH_SOCK")
fi
```

### 12. Мониторинг использования ключей

```bash
# Логирование использования SSH-ключа
ssh_with_log() {
    echo "$(date): SSH connection to $1" >> ~/.ssh/connection.log
    ssh "$@"
}

# Логирование загрузки ключей
ssh-add_with_log() {
    echo "$(date): Loading key $1" >> ~/.ssh/key_loading.log
    ssh-add "$@"
}
```

## Полезные хаки

### 13. Перезагрузка агента при изменениях в .ssh/

```bash
# Монитор файла
inotifywait -m ~/.ssh/ -e create -e moved_to |
    while read path action file; do
        if [[ $file == *.pub ]]; then
            echo "New key detected: $file"
            # Здесь можно выполнять действия при добавлении нового ключа
        fi
    done
```

### 14. Использование с разными Git-профилями

```bash
# В ~/.gitconfig
[includeIf "gitdir/i:~/work/"]
    path = ~/.gitconfig-work
[includeIf "gitdir/i:~/personal/"]
    path = ~/.gitconfig-personal

# В ~/.gitconfig-work
[url "ssh://git@github-enterprise.com:"]
    insteadOf = "ssh://git@github.com:"
```

### 15. Сброс агента при смене пользователя

```bash
# В ~/.bashrc
if [ "$USER" != "$LOGNAME" ]; then
    # При смене пользователя через su/sudo — сбросить агент
    SSH_AUTH_SOCK=""
    unset SSH_AUTH_SOCK
    eval $(ssh-agent)
fi
```

## Чек-лист по безопасности

- ✅ Использовать `IdentitiesOnly yes` в SSH-конфиге
- ✅ Ограничивать время жизни ключей в агенте (`ssh-add -t`)
- ✅ Очищать агент при выходе из сессии
- ✅ Проверять, какие ключи загружены (`ssh-add -l`)
- ✅ Не хранить ключи без пароля на общих машинах
- ✅ Использовать права доступа 600 для ключей

---

Эта статья охватывает базовые и продвинутые аспекты работы с SSH-агентом, начиная с простых команд и заканчивая сложными сценариями использования в реальных проектах.