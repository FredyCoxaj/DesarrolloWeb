"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    transformIgnorePatterns: [
        'node_modules/(?!(@nestjs|passport|passport-jwt|@prisma|bcrypt|qrcode|socket\\.io)/)',
    ],
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map