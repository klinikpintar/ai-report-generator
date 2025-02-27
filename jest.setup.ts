import '@testing-library/jest-dom'
class MockRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
  
    constructor(url: string, options: any = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = options.headers || {};
      this.body = options.body || '';
    }
  
    async json() {
      return JSON.parse(this.body);
    }
  }
  
  class MockResponse {
    status: number;
    body: string;
  
    constructor(body: string, options: any = {}) {
      this.body = body;
      this.status = options.status || 200;
    }
  
    async json() {
      return JSON.parse(this.body);
    }
  }
  
  global.Request = MockRequest as any;
  global.Response = MockResponse as any;
  global.Headers = class Headers {} as any;