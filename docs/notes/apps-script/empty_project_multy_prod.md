## Multiple builds for an apps script project

This script is specific to the project https://github.com/hedgehogsburrows/empty-google-apps-script-project and it's based on https://github.com/google/zx.

The next settings allow to build multiple project out of box.

```sh
$> tree ./settings
.
├── dev
│   └── assets
│       └── settings.js
└── prod
    ├── assets
    │   └── settings.js
    ├── assets.01
    │   └── settings.js
    └── assets.02
        └── settings.js
```

```sh
$> npx zx ./tools/index.mjs

```

### zx script

`./tools/index.mjs`

```js
#!/usr/bin/env zx

const { fs } = require('zx');

const PATH_PREFIX = './settings/prod';

const files = await fs.readdir(path.join(PATH_PREFIX));

for (const file of files) {
  const pFile = path.join(PATH_PREFIX, file);
  const match = file.match(/^\.clasp\.json\.(\d+)$/);
  if ((await fs.lstat(pFile)).isFile() && match) {
    await fs.copyFile(
      path.join(PATH_PREFIX, file),
      path.join(PATH_PREFIX, '.clasp.json')
    );
    await fs.rmdir(path.join(PATH_PREFIX, 'assets'), {
      recursive: true,
      force: true,
    });
    await fs.copyFile(
      path.join(PATH_PREFIX, file),
      path.join(PATH_PREFIX, '.clasp.json')
    );
    await fs.copy(
      path.join(PATH_PREFIX, `assets.${match[1]}`),
      path.join(PATH_PREFIX, 'assets')
    );
    await $`npm run prod`;
  }
}
```