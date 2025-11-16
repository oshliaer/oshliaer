# Gemini Code Assistant Context

## Project Overview

This project is a personal knowledge base and digital garden. It consists of a collection of Markdown files in the `docs` directory, which are processed by a Node.js script to generate a dynamic `README.md` file. The `README.md` file serves as a table of contents, listing the most recent entries.

The project uses the following technologies:

*   **Node.js:** For scripting and file processing.
*   **TypeScript:** For type safety and improved developer experience.
*   **Mustache:** For templating the `README.md` file.
*   **js-yaml:** For parsing YAML front-matter from the Markdown files.
*   **luxon:** For handling dates and times.

## Building and Running

The primary script in this project is the `docs` script, which generates the `README.md` file. To run the script, use the following command:

```bash
npm run docs
```

This will execute the `scripts/index.ts` file, which reads all the Markdown files in the `docs` directory, extracts their front-matter, sorts them by date, and then generates a new `README.md` file based on the `scripts/templates/README.md` template.

There are no other build or run commands for this project.

## Development Conventions

*   All new entries should be created as `.md` files in the `docs` directory.
*   Each new entry should have a YAML front-matter block at the beginning of the file, with at least a `date` field. For example:

```yaml
---
date: 2025-08-25
---
```

*   The `title` of the entry is automatically inferred from the file path.
*   After adding or updating a file in the `docs` directory, run the `npm run docs` command to update the `README.md` file.
