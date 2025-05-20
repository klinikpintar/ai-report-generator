import { ReportSchema } from '@/app/(backend)/dtos/report.dto';
import { ZodError } from 'zod';

const baseData = {
  title: 'Judul Valid',
  createdAt: new Date().toISOString(),
};

describe('ReportSchema Content Field Validation (with xss)', () => {
  test('should pass with clean content', () => {
    const data = {
      ...baseData,
      content: 'Laporan ini bersih dari tag HTML',
    };
    const result = ReportSchema.parse(data);
    expect(result.content).toBe('Laporan ini bersih dari tag HTML');
  });

  test('should fail with <script> tag', () => {
    const data = { ...baseData, content: '<script>alert("XSS")</script>' };
    expect(() => ReportSchema.parse(data)).toThrow(ZodError);
  });

  test('should fail with <b> tag', () => {
    const data = { ...baseData, content: 'Ini <b>tebal</b>' };
    expect(() => ReportSchema.parse(data)).toThrow(ZodError);
  });

  test('should fail with event handler attribute', () => {
    const data = { ...baseData, content: '<img src="x" onerror="alert(1)" />' };
    expect(() => ReportSchema.parse(data)).toThrow(ZodError);
  });

  test('should pass with escaped HTML entities', () => {
    const data = {
      ...baseData,
      content: '&lt;script&gt; not real tag &lt;/script&gt;',
    };
    const result = ReportSchema.parse(data);
    expect(result.content).toBe(data.content);
  });

  test('should pass with < and > in comparison', () => {
    const data = { ...baseData, content: '5 < 10 dan 10 > 5, ini valid' };
    const result = ReportSchema.parse(data);
    expect(result.content).toBe('5 < 10 dan 10 > 5, ini valid');
  });

  test('should fail with self-closing tag <img>', () => {
    const data = { ...baseData, content: 'Ini gambar <img src="x.png"/>' };
    expect(() => ReportSchema.parse(data)).toThrow(ZodError);
  });

  test('should fail with upper-case tag <SCRIPT>', () => {
    const data = { ...baseData, content: '<SCRIPT>alert("XSS")</SCRIPT>' };
    expect(() => ReportSchema.parse(data)).toThrow(ZodError);
  });

  test('should fail with mixed-case tag <ScRiPt>', () => {
    const data = { ...baseData, content: '<ScRiPt>alert("XSS")</ScRiPt>' };
    expect(() => ReportSchema.parse(data)).toThrow(ZodError);
  });

  test('should fail with spaced tag < script >', () => {
    const data = { ...baseData, content: '< script >alert("XSS")< / script >' };
    expect(() => ReportSchema.parse(data)).toThrow(ZodError);
  });

  test('should pass with emoji and special characters', () => {
    const data = {
      ...baseData,
      content: 'Ini laporan pakai emot 😊 dan karakter ñ, é, ç, ß',
    };
    const result = ReportSchema.parse(data);
    expect(result.content).toBe(data.content);
  });

  test('should pass with JS-like syntax (brackets)', () => {
    const data = {
      ...baseData,
      content: 'Contoh kode: if (x < 5) { console.log(">Done"); }',
    };
    const result = ReportSchema.parse(data);
    expect(result.content).toBe(data.content);
  });

  test('should fail with nested tags', () => {
    const data = {
      ...baseData,
      content: '<div><span>Teks nested</span></div>',
    };
    expect(() => ReportSchema.parse(data)).toThrow(ZodError);
  });

  test('should pass with full-width unicode <＞script＞', () => {
    const data = {
      ...baseData,
      content: '＜script＞alert("XSS")＜/script＞',
    };
    const result = ReportSchema.parse(data);
    expect(result.content).toBe(data.content);
  });

  test('should pass with URL encoded HTML', () => {
    const data = {
      ...baseData,
      content: '%3Cscript%3Ealert("XSS")%3C/script%3E',
    };
    const result = ReportSchema.parse(data);
    expect(result.content).toBe(data.content);
  });
});
