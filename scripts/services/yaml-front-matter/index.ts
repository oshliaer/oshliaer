import * as jsYaml from 'js-yaml';

type TOptions = IOptions | string;

interface IOptions extends jsYaml.LoadOptions {
  contentKeyName?: string;
}

function parse(text: string, options?: TOptions): Record<string, unknown> {
  let contentKeyName: string;
  let passThroughOptions: jsYaml.LoadOptions | undefined = undefined;

  if (typeof options === 'object') {
    contentKeyName = options?.contentKeyName ?? '__content';
    passThroughOptions = options;
  } else {
    contentKeyName = options || '__content';
  }

  const re = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})?([\w\W]*)*/;
  const results = re.exec(text);

  if (!results?.length) {
    return {};
  }

  let yamlOrJson: string;

  let conf: Record<string, unknown> = {};

  if ((yamlOrJson = results[2])) {
    if (yamlOrJson.charAt(0) === '{') {
      conf = JSON.parse(yamlOrJson);
    } else {
      conf = jsYaml.load(yamlOrJson, passThroughOptions) as Record<string, unknown>;
    }
  }

  conf[contentKeyName] = results[3] || '';

  return conf;
}

export function loadFront(content: string, options?: IOptions) {
  return parse(content, options);
}
