import { Parser } from 'htmlparser2';

export function isContentSafe(content: string): boolean {
  content = content.replace(/\s+/g, "");
  let foundTag = false;

  const parser = new Parser({
    onopentag(name) {
      foundTag = true;
      parser.pause();
    },
  }, { decodeEntities: true });

  parser.write(content);
  parser.end();

  return !foundTag;
}
