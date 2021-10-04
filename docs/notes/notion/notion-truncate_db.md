## Truncate a Notion database table

```js
async function getItemsOfDatabase() {
  const pages = [];
  let cursor = undefined;
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });
    pages.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }
  return pages.map((page) => {
    return {
      pageId: page.id,
    };
  });
}

async function truncateDatabase() {
  const bulk = [];
  const currentIssues = await getItemsOfDatabase();
  for (const { pageId, issueNumber } of currentIssues) {
    const promise = notion.pages.update({
      page_id: pageId,
      archived: true,
    });
    bulk.push(promise);
  }
  return await Promise.all(bulk);
}
```
