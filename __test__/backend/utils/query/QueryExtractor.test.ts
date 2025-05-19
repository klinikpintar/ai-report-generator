import { QueryExtractor } from '@backend/utils/query/QueryExtractor';
import { IQuery } from '@backend/interfaces/query/IQuery'; 

describe('QueryExtractor', () => {
  let extractor: QueryExtractor;

  beforeEach(() => {
    extractor = new QueryExtractor();
  });

  it('should return an empty array if the report contains no code blocks', () => {
    const report = "This is a report with no code blocks.";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([]);
  });

  it('should extract a single code block with language and id', () => {
    const report = "Here is a query:\n```sql id=query1\nSELECT * FROM users;\n```";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([
      { language: 'sql', id: 'query1', code: 'SELECT * FROM users;' },
    ]);
  });

  it('should extract a single code block with language only', () => {
    const report = "```javascript\nconsole.log('Hello');\n```";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([
      { language: 'javascript', id: '', code: "console.log('Hello');" },
    ]);
  });

  it('should extract a single code block with id only (language becomes unknown)', () => {
    const report = "``` id=my-query\nSHOW TABLES;\n```";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([
      { language: 'unknown', id: 'my-query', code: 'SHOW TABLES;' },
    ]);
  });


  it('should extract a single code block with no language or id (defaults)', () => {
    const report = "```\n{\n  \"key\": \"value\"\n}\n```";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([
      { language: 'unknown', id: '', code: '{\n  "key": "value"\n}' },
    ]);
  });


  it('should handle multiple code blocks', () => {
    const report = "```lang1 id=id1\ncode1\n``````lang2\ncode2\n```";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([
      { language: 'lang1', id: 'id1', code: 'code1' },
      { language: 'lang2', id: '', code: 'code2' },
    ]);
  });

  it('should handle language and id with allowed special characters', () => {
    const report = "```language_with_underscore id=id-with-hyphen_and_underscore\ncontent\n```";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([
      { language: 'language_with_underscore', id: 'id-with-hyphen_and_underscore', code: 'content' },
    ]);
  });

  it('should correctly handle a language specified but no ID', () => {
    const report = "```my_lang\nSELECT 1;\n```";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([
      { language: 'my_lang', id: '', code: 'SELECT 1;' },
    ]);
  });


  it('should not extract anything if code block is not properly closed', () => {
    const report = "```sql id=unclosed\nSELECT * FROM test_table;\n``"; // Missing one backtick
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([]);
  });


  it('should handle code content with backticks inside if they are not at the start of a line or part of the block fence', () => {
    const report = "```javascript\nconst msg = `Hello, ${name}!`;\nconsole.log(msg);\n```";
    const result: IQuery[] = extractor.extract(report);
    expect(result).toEqual([
      { language: 'javascript', id: '', code: "const msg = `Hello, ${name}!`;\nconsole.log(msg);" },
    ]);
  });
});