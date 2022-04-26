## Upload a file via an HTML form (Yandex Cloud, nodejs)

[Upload a file via an HTML form | Yandex.Cloud - Documentation](https://cloud.yandex.com/en-ru/docs/storage/concepts/presigned-post-forms)

Here is another solution using `aws-sdk` instead of `boto3` to make it work on nodejs.

There is also a mismatch between the code in the local environment and the Yandex. If you do not specify `credentials`, then an error will occur in the Yandex environment. Maybe something with security.

### For Cloud Functions

```js
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');
const { S3Client } = require('@aws-sdk/client-s3');

const { accessKeyId, secretAccessKey } = process.env;

const client = new S3Client({
  region: 'ru-central1',
  endpoint: 'https://storage.yandexcloud.net',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const Conditions = [{ acl: 'public-read' }, ['starts-with', '$key', 'folder']];

const Bucket = 'MyBucket';
const Key = 'folder/${filename}';
const Fields = {
  success_action_redirect: 'https://cloud.yandex.ru/docs/storage/concepts/presigned-post-forms',
};

module.exports.handler = async function (event, context) {
  const { url, fields } = await createPresignedPost(client, {
    Bucket,
    Key,
    Conditions,
    Fields,
    Expires: 3600,
  });
  return {
    statusCode: 200,
    body: { url, fields },
  };
};
```
