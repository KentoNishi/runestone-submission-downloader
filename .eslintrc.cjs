module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['@typescript-eslint',  'unused-imports', 'json-format'],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    eqeqeq: 'error',
    'max-len': [
      'error',
      {
        code: 80,
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreUrls: true,
      },
    ],
    'no-param-reassign': ['error', { props: false }],
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-trailing-spaces': [
      'error',
      {
        ignoreComments: true,
      },
    ],
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'eol-last': ['error', 'always'],
    'no-unused-vars': 'off',
    'no-undef': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
  },
  settings: {
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        ts: 'never',
        worker: 'never',
      },
    ],
  },
};