// __mocks__/@prisma/client.ts

const createPrismaModelMock = () => ({
  findUnique: jest.fn().mockResolvedValue(null),
  findUniqueOrThrow: jest.fn().mockResolvedValue({}),
  findFirst: jest.fn().mockResolvedValue(null),
  findFirstOrThrow: jest.fn().mockResolvedValue({}),
  findMany: jest.fn().mockResolvedValue([]),
  create: jest.fn(async (args: { data: any }) => ({
    id: args.data?.id || `mock-id-${Math.random().toString(36).substring(7)}`,
    ...args.data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  createMany: jest.fn(async (args: { data: any[] | any }) => ({
    count: Array.isArray(args.data) ? args.data.length : 1,
  })),
  update: jest.fn(async (args: { data: any; where: any }) => ({
    id: args.where?.id || `mock-id-${Math.random().toString(36).substring(7)}`,
    ...args.data,
    updatedAt: new Date(),
  })),
  updateMany: jest.fn(async () => ({ count: 1 })),
  upsert: jest.fn(async (args: { create: any; where: any }) => ({
    id: args.where?.id || `mock-id-${Math.random().toString(36).substring(7)}`,
    ...args.create,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  delete: jest.fn(async (args: { where: any }) => ({
    id: args.where?.id || `mock-id-${Math.random().toString(36).substring(7)}`,
  })),
  deleteMany: jest.fn(async () => ({ count: 1 })),
  count: jest.fn().mockResolvedValue(0),
  aggregate: jest.fn().mockResolvedValue({ _count: { _all: 0 }, _avg: null, _sum: null, _min: null, _max: null }),
  groupBy: jest.fn().mockResolvedValue([]),
});

export const PrismaClient = jest.fn().mockImplementation(() => ({
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $on: jest.fn(),
  $use: jest.fn(),
  $executeRaw: jest.fn().mockResolvedValue(0),
  $executeRawUnsafe: jest.fn().mockResolvedValue(0),
  $queryRaw: jest.fn().mockResolvedValue([]),
  $queryRawUnsafe: jest.fn().mockResolvedValue([]),
  $transaction: jest.fn(async (arg: any) => {
    if (typeof arg === 'function') {
      // For interactive transactions, pass a new instance of the mocked client
      // This is a simplified mock; real interactive transactions are more complex.
      return arg(new PrismaClient());
    }
    // For sequential operations array
    const results = [];
    for (const promise of arg) {
      results.push(await promise);
    }
    return results;
  }),

  // Models from your schema
  user: createPrismaModelMock(),
  refreshToken: createPrismaModelMock(),
  schema: createPrismaModelMock(),
  schemaEmbedding: {
    ...createPrismaModelMock(),
  },
  service: createPrismaModelMock(),
  provider: createPrismaModelMock(),
  aiModel: createPrismaModelMock(),
  chatSession: createPrismaModelMock(),
  chatMessage: createPrismaModelMock(),
}));

// Mock Enums and other specific exports from Prisma
export const Role = {
  ADMIN: 'ADMIN',
  BUSINESS_ANALYST: 'BUSINESS_ANALYST',
};

// It's common to also export the `Prisma` namespace if your code uses it for types or errors.
export const Prisma = {
  PrismaClientKnownRequestError: jest.fn((message: string, options: { code: string; clientVersion: string; meta?: any }) => {
    const error = new Error(message) as any;
    error.name = 'PrismaClientKnownRequestError';
    error.code = options.code;
    error.clientVersion = options.clientVersion;
    error.meta = options.meta;
    return error;
  }),
  PrismaClientInitializationError: jest.fn((message: string, options: { clientVersion: string; errorCode?: string }) => {
    const error = new Error(message) as any;
    error.name = 'PrismaClientInitializationError';
    error.clientVersion = options.clientVersion;
    error.errorCode = options.errorCode;
    return error;
  }),
  // Add other Prisma specific exports if your application code uses them (e.g., Prisma.DbNull)
  Role: Role, // Re-exporting the enum under Prisma namespace as Prisma often does
  // If you use specific types like `Prisma.validator` or `Prisma.getExtensionContext`
  // those would be harder to mock statically and usually aren't needed for basic operation mocking.
};

// Default export for compatibility if some imports might expect it
const defaultExport = {
  PrismaClient,
  Role,
  Prisma,
};

export default defaultExport;