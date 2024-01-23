import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://gql.hashnode.com',
  documents: './**/*.graphql',
  generates: {
    './generated/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
    './generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        scalars: {
          Date: 'string',
          DateTime: 'string',
          ObjectId: 'string',
          JSONObject: 'Record<string, unknown>',
          Decimal: 'string',
          CurrencyCode: 'string',
          ImageContentType: 'string',
          ImageUrl: 'string',
        },
      },
    },
  },
};

export default config;
