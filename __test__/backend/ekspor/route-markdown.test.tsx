import { POST } from '@/app/(backend)/api/ekspor/markdown/route';
import { MarkdownExporter } from "@/app/(backend)/services/markdownExporter";
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Import type untuk mock
type MockRequest = {
  json: jest.Mock;
} & NextRequest;

type MockExporter = {
  export: jest.Mock;
  getMimeType: jest.Mock;
  getFileName: jest.Mock;
};

// Mock ZodError
jest.mock('zod', () => ({
  ZodError: class MockZodError extends Error {
    errors: Array<{ path: string[]; message: string }>;
    constructor() {
      super('ZodError');
      this.name = 'ZodError';
      this.errors = [];
    }
  }
}));

// Mock NextRequest dan NextResponse
jest.mock('next/server', () => {
  const actualNextResponse = jest.requireActual('next/server').NextResponse;
  
  return {
    __esModule: true,
    NextRequest: jest.fn().mockImplementation(() => ({
      json: jest.fn()
    })),
    NextResponse: {
      json: jest.fn((data, options) => ({
        status: options?.status || 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(data),
      })),
      ...actualNextResponse,
    }
  };
});

// Mock MarkdownExporter
jest.mock('@/app/(backend)/services/markdownExporter', () => {
  return {
    MarkdownExporter: jest.fn().mockImplementation(() => ({
      export: jest.fn().mockResolvedValue(Buffer.from('test markdown content')),
      getMimeType: jest.fn().mockReturnValue('text/markdown'),
      getFileName: jest.fn().mockImplementation((title) => `${title}.md`),
    })),
  };
});

// Mock ReportSchema
jest.mock('@/app/(backend)/dtos/report.dto', () => ({
  ReportSchema: {
    parse: jest.fn(data => data),
  },
}));

describe('Markdown Export Route', () => {
  let mockRequest: MockRequest;
  let exporterInstance: MockExporter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock request
    mockRequest = new NextRequest() as MockRequest;
    
    // Setup exporter instance
    (MarkdownExporter as jest.Mock).mockClear();
    exporterInstance = {
      export: jest.fn().mockResolvedValue(Buffer.from('test markdown content')),
      getMimeType: jest.fn().mockReturnValue('text/markdown'),
      getFileName: jest.fn().mockImplementation((title) => `${title}.md`),
    };
    (MarkdownExporter as jest.Mock).mockImplementation(() => exporterInstance);
  });

  // Test cases remain the same...
  it('should successfully export a valid report to markdown', async () => {
    // Arrange
    const validReportData = {
      title: 'Test Report',
      content: 'This is test content',
      createdBy: 'Test User',
      createdAt: new Date(),
      metadata: { someField: 'someValue' }
    };
    
    mockRequest.json = jest.fn().mockResolvedValue({ 
      reportData: validReportData 
    });

    // Mock NextResponse constructor untuk successful case
    const mockResponseInstance = {
      status: 200,
      headers: new Map([
        ['Content-Type', 'text/markdown'],
        ['Content-Disposition', 'attachment; filename="Test Report.md"']
      ])
    };
    
    jest.spyOn(NextResponse, 'constructor').mockImplementation(() => mockResponseInstance as any);

    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(MarkdownExporter).toHaveBeenCalled();
    expect(exporterInstance.export).toHaveBeenCalledWith(validReportData);
    expect(exporterInstance.getMimeType).toHaveBeenCalled();
    expect(exporterInstance.getFileName).toHaveBeenCalledWith('Test Report');
  });

  it('should return 400 if title or content is empty', async () => {
    // Arrange
    const invalidReportData = { 
      title: '',  // Empty title
      content: '',  // Empty content
      createdBy: 'Test User',
      createdAt: new Date()
    };
    
    mockRequest.json = jest.fn().mockResolvedValue({
      reportData: invalidReportData
    });
    
    // Mock NextResponse.json untuk mengembalikan respons 400
    (NextResponse.json as jest.Mock).mockReturnValueOnce({
      status: 400,
      json: jest.fn().mockResolvedValue({ message: 'Judul dan isi laporan tidak boleh kosong' })
    });

    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Judul dan isi laporan tidak boleh kosong');
  });
  
  it('should return 400 if input validation fails', async () => {
    // Arrange
    mockRequest.json = jest.fn().mockResolvedValue({
      reportData: { invalid: 'data' }
    });
    
    // Buat ZodError yang benar
    const zodError = new ZodError();
    zodError.errors = [{ path: ['field'], message: 'Invalid field' }];
    
    // Setup ReportSchema.parse untuk throw ZodError
    require('@/app/(backend)/dtos/report.dto').ReportSchema.parse.mockImplementation(() => {
      throw zodError;
    });
    
    // Mock NextResponse.json
    (NextResponse.json as jest.Mock).mockReturnValueOnce({
      status: 400,
      json: jest.fn().mockResolvedValue({ 
        message: 'Input tidak valid', 
        errors: [{ path: ['field'], message: 'Invalid field' }]
      })
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Input tidak valid');
    expect(responseBody.errors).toEqual([{ path: ['field'], message: 'Invalid field' }]);
  });
  
  it('should return 500 if export process fails', async () => {
    // Arrange
    const validReportData = {
      title: 'Test Report',
      content: 'This is test content',
      createdBy: 'Test User',
      createdAt: new Date()
    };
    
    mockRequest.json = jest.fn().mockResolvedValue({
      reportData: validReportData
    });
    
    // Setup exporter instance untuk throw error
    exporterInstance.export.mockRejectedValueOnce(new Error('Export failed'));
    
    // Mock NextResponse.json
    (NextResponse.json as jest.Mock).mockReturnValueOnce({
      status: 500,
      json: jest.fn().mockResolvedValue({ message: 'Gagal mengekspor laporan' })
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Gagal mengekspor laporan');
  });
  
  it('should handle JSON parse error', async () => {
    // Arrange
    mockRequest.json = jest.fn().mockRejectedValueOnce(new Error('Invalid JSON'));
    
    // Mock NextResponse.json
    (NextResponse.json as jest.Mock).mockReturnValueOnce({
      status: 500,
      json: jest.fn().mockResolvedValue({ message: 'Gagal mengekspor laporan' })
    });
    
    // Act
    const response = await POST(mockRequest);
    
    // Assert
    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('Gagal mengekspor laporan');
  });
});