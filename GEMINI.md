# Gemini Code Assistant Context

## Project Overview

This project is a personal knowledge base and digital garden. It consists of a collection of Markdown files in the `docs` directory, which are processed by a Node.js script to generate a dynamic `README.md` file. The `README.md` file serves as a table of contents, listing the most recent entries.

The project uses the following technologies:

*   **Node.js:** For scripting and file processing.
*   **TypeScript:** For type safety and improved developer experience.
*   **Mustache:** For templating the `README.md` file.
*   **js-yaml:** For parsing YAML front-matter from the Markdown files.
*   **luxon:** For handling dates and times.

## Automation

The `README.md` file is generated automatically by a GitHub Actions workflow defined in `.github/workflows/docs-to-master.yml`. This workflow runs whenever changes are pushed to the `docs` branch.

**DO NOT run the `npm run docs` command manually.** The automated workflow handles the generation and deployment of the `README.md` file.

## Development Conventions

*   All new entries should be created as `.md` files in the `docs` directory.
*   Each new entry should have a YAML front-matter block at the beginning of the file, with at least a `date` field. For example:

```yaml
---
date: 2025-08-25
---
```

*   The `title` of the entry is automatically inferred from the file path.
*   For the "Список прочитанного" (e.g., `docs/lists/_read.md`), new entries should be added to the top of the list, so that earlier read books appear at the bottom.
*   When the user says "before" (перед) in the context of a list, it means the new item should be placed *lower* in the list.
