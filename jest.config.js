/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  preset: 'ts-jest',
  modulePaths: ['<rootDir>'],
};

module.exports = config;
