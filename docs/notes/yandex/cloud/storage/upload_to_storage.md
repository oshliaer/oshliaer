## Upload files to storage

```bash
#!/bin/bash

aws --endpoint-url=https://storage.yandexcloud.net \
  s3 cp --recursive ./backet s3://my-backet/
```
