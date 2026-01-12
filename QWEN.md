# Qwen Code Assistant Context

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
*   For the "Список прочитанного" (e.g., `docs/lists/0read.md`), new entries should be added to the top of the list, so that earlier read books appear at the bottom.
*   When the user says "before" (перед) in the context of a list, it means the new item should be placed *lower* in the list.

## Reading Lists

### Lists for Reading

*   Lists for reading are located in the `docs/lists/` directory.
*   These can be any kind of reading lists (e.g., grade-specific, thematic, etc.).
*   Lists may have headers dividing them into required reading, additional independent reading, etc.
*   All lists are at the same level in the directory.

### List of Read Books

*   The file `docs/lists/0read.md` contains the list of completed readings.
*   Books are added to this list in reverse chronological order (newest first), which is achieved by using the `reversed` attribute in the `<ol>` tag.
*   The list is grouped by year with `## YYYY` headers.
*   Each entry has the format:

```html
<li>Author's Last Name, First Name Patronymic (original name, if pseudonym) - "Title of Work" <!-- NN --></li>
```

*   To add a book to the list, find its exact title and author in one of the reading lists in `docs/lists/`, and add it to the top of the list in `0read.md` (which means it will appear first when the list is reversed and numbered).
*   The numbering comment (e.g., `<!-- 27 -->`) should be increased to maintain correct sequence.
*   Books are added by users in a conversational style (e.g., "I read the friend Sancho, add it"), and the system should find the exact title and author in the lists and add the formatted entry to `0read.md`.

### Removing Books from Lists

*   Books can be removed from lists in `docs/lists/` if requested.

### Working with Lists

*   When updating the list of read books:
*   Always verify that the book exists in one of the reading lists before adding it to `0read.md`.
*   Use the exact title and author as they appear in the original list.
*   Maintain correct numbering sequence in the `<ol reversed>` list.
*   Place new entries at the top of the list in the file (which makes them appear first when the list is reversed).
*   When adding new entries, assign them sequential numbers starting from (highest_number_in_current_year_section + 1).
*   For example, if the highest number in 2026 section is <!-- 3 -->, then the next added book should receive <!-- 4 -->, the following <!-- 5 -->, etc.
*   Existing entries' numbers remain unchanged when new entries are added.
