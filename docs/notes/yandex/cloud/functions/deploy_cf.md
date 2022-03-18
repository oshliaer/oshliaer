## Deploy Yandex Cloud Function

This script deploy the cf

```bash
#!/bin/bash

zip -rj ./build/test.zip src/

yc serverless function version create \
  --function-name=test \
  --runtime python38 \
  --entrypoint hello.handler \
  --memory 128m \
  --execution-timeout 3s \
  --source-path ./build/test.zip
```
