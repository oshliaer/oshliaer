---
date: 2025-04-28
title: Как работает workflow/docs-to-master
---

## Как работает workflow/docs-to-master

### Обзор

Файл `.github/workflows/docs-to-master.yml` представляет собой GitHub Action workflow, который автоматизирует процесс копирования изменений из ветки `docs` в ветку `master`. Этот подход позволяет работать над документацией в отдельной ветке, а затем автоматически синхронизировать эти изменения с основной веткой.

### Принцип работы

#### Триггеры запуска

Workflow запускается автоматически при следующих событиях:

- Push в ветку `docs`
- Pull request в ветку `docs`
- Ручной запуск через интерфейс GitHub (`workflow_dispatch`)

#### Основные шаги

1. **Checkout репозитория**
   - Скрипт клонирует репозиторий и переключается на ветку `docs`

2. **Настройка Git**
   - Устанавливаются параметры пользователя Git (имя и email) для создания коммитов

3. **Создание и переключение на новую ветку**
   - Создается временная ветка для работы, обычно с названием, включающим текущую дату и время

4. **Копирование изменений**
   - Изменения из папки `docs/` (или другой указанной директории) копируются в целевую локацию

5. **Коммит и пуш изменений**
   - Если есть изменения, они коммитятся и отправляются в ветку `master`

6. **Создание Pull Request**
   - Создается Pull Request из временной ветки в ветку `master`
   - PR автоматически назначается на указанных ревьюеров

### Преимущества подхода

- Разделение изменений кода и документации
- Автоматическая синхронизация без ручного вмешательства
- Возможность проверки изменений документации через PR перед слиянием
- Сохранение истории изменений в обеих ветках

### Настройка workflow

Для настройки workflow необходимо указать следующие параметры:

- Источник изменений (обычно папка `docs/`)
- Целевая ветка (обычно `master`)
- GitHub токен с правами на создание PR
- Список ревьюеров (если необходимо)

### Пример конфигурации

```yaml
name: Docs to Master

on:
  push:
    branches: [ docs ]
  pull_request:
    branches: [ docs ]
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          ref: docs
      
      - name: Setup Git
        run: |
          git config --global user.name "GitHub Actions"
          git config --global user.email "actions@github.com"
      
      - name: Create and switch to new branch
        run: |
          BRANCH_NAME="docs-sync-$(date +%Y%m%d%H%M%S)"
          git checkout -b $BRANCH_NAME
      
      - name: Copy docs changes and commit
        run: |
          # Копирование изменений
          if [ -d "docs/" ]; then
            git add docs/
            if ! git diff --cached --quiet; then
              git commit -m "Sync docs changes from docs branch"
              git push origin $BRANCH_NAME
            else
              echo "No changes to commit"
            fi
          fi
      
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          base: master
          title: "Sync docs changes"
          body: "Automatically generated PR to sync docs changes from docs branch"
          reviewers: "maintainer1,maintainer2"
```
