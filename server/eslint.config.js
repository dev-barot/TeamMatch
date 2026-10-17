import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/domain/**/*.js', 'src/application/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'mongoose',
                'express',
                'socket.io',
                'bcrypt',
                'bcryptjs',
                'nodemailer',
                '**/infrastructure/**',
                '**/http/**',
              ],
              message: 'Architecture violation: Domain and Application layers cannot import from external frameworks, database, or I/O infrastructure.',
            },
          ],
        },
      ],
    },
  },
];
