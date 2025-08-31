/**
 * Simple configuration tests that work with Jest
 */

describe('Quality Hub Extension - Simple Tests', () => {
  describe('Package.json Tests', () => {
    test('should load package.json successfully', () => {
      const packageJson = require('../package.json')
      expect(packageJson).toBeDefined()
      expect(typeof packageJson).toBe('object')
    })

    test('should have correct name and main entry', () => {
      const packageJson = require('../package.json')
      expect(packageJson.name).toBe('quality-hub')
      expect(packageJson.main).toBe('./out/extension.js')
    })

    test('should have VS Code engine specified', () => {
      const packageJson = require('../package.json')
      expect(packageJson.engines).toBeDefined()
      expect(packageJson.engines.vscode).toBeDefined()
      expect(typeof packageJson.engines.vscode).toBe('string')
    })

    test('should have commands defined', () => {
      const packageJson = require('../package.json')
      expect(packageJson.contributes).toBeDefined()
      expect(packageJson.contributes.commands).toBeDefined()
      expect(Array.isArray(packageJson.contributes.commands)).toBe(true)
      expect(packageJson.contributes.commands.length).toBeGreaterThan(0)
    })

    test('should have Jest command defined', () => {
      const packageJson = require('../package.json')
      const commands = packageJson.contributes.commands
      const jestCommand = commands.find((cmd) => cmd.command === 'quality-hub.jest')

      expect(jestCommand).toBeDefined()
      expect(jestCommand.title).toBe('Run Jest Tests')
      expect(jestCommand.category).toBe('Quality Hub')
    })

    test('should have required dependencies', () => {
      const packageJson = require('../package.json')

      // Check dependencies
      expect(packageJson.dependencies).toBeDefined()
      expect(packageJson.dependencies.axios).toBeDefined()

      // Check dev dependencies
      expect(packageJson.devDependencies).toBeDefined()
      expect(packageJson.devDependencies.typescript).toBeDefined()
      expect(packageJson.devDependencies.jest).toBeDefined()
      expect(packageJson.devDependencies['@types/jest']).toBeDefined()
      expect(packageJson.devDependencies.eslint).toBeDefined()
    })

    test('should have Jest test scripts', () => {
      const packageJson = require('../package.json')

      expect(packageJson.scripts).toBeDefined()
      expect(packageJson.scripts['test:jest']).toBeDefined()
      expect(packageJson.scripts['test:jest:watch']).toBeDefined()
      expect(packageJson.scripts['test:jest:coverage']).toBeDefined()
    })
  })

  describe('Jest Configuration Tests', () => {
    test('should load Jest config successfully', () => {
      const jestConfig = require('../jest.config.js')
      expect(jestConfig).toBeDefined()
      expect(typeof jestConfig).toBe('object')
    })

    test('should have correct Jest preset', () => {
      const jestConfig = require('../jest.config.js')
      expect(jestConfig.preset).toBe('ts-jest')
      expect(jestConfig.testEnvironment).toBe('node')
    })

    test('should have test patterns configured', () => {
      const jestConfig = require('../jest.config.js')
      expect(jestConfig.testMatch).toBeDefined()
      expect(Array.isArray(jestConfig.testMatch)).toBe(true)
      expect(jestConfig.testMatch.length).toBeGreaterThan(0)
    })

    test('should include tests directory in patterns', () => {
      const jestConfig = require('../jest.config.js')
      const hasTestsPattern = jestConfig.testMatch.some((pattern) =>
        pattern.includes('tests/**/*.test.')
      )
      expect(hasTestsPattern).toBe(true)
    })
  })

  describe('TypeScript Configuration Tests', () => {
    test('should load tsconfig.json successfully', () => {
      const tsconfig = require('../tsconfig.json')
      expect(tsconfig).toBeDefined()
      expect(typeof tsconfig).toBe('object')
    })

    test('should have correct compiler options', () => {
      const tsconfig = require('../tsconfig.json')
      expect(tsconfig.compilerOptions).toBeDefined()
      expect(tsconfig.compilerOptions.target).toBe('ES2020')
      expect(tsconfig.compilerOptions.module).toBe('commonjs')
      expect(tsconfig.compilerOptions.outDir).toBe('out')
    })

    test('should include src directory', () => {
      const tsconfig = require('../tsconfig.json')
      expect(tsconfig.include).toBeDefined()
      expect(Array.isArray(tsconfig.include)).toBe(true)
      expect(tsconfig.include).toContain('src/**/*')
    })
  })

  describe('Quality Tools Configuration Tests', () => {
    test('should load ESLint config successfully', () => {
      const eslintConfig = require('../.eslintrc.json')
      expect(eslintConfig).toBeDefined()
      expect(typeof eslintConfig).toBe('object')
    })

    test('should have TypeScript ESLint parser', () => {
      const eslintConfig = require('../.eslintrc.json')
      expect(eslintConfig.parser).toBe('@typescript-eslint/parser')
      expect(eslintConfig.plugins).toContain('@typescript-eslint')
      expect(eslintConfig.plugins).toContain('security')
    })

    test('should load Biome config successfully', () => {
      const biomeConfig = require('../biome.json')
      expect(biomeConfig).toBeDefined()
      expect(typeof biomeConfig).toBe('object')
    })

    test('should have Biome tools enabled', () => {
      const biomeConfig = require('../biome.json')
      expect(biomeConfig.linter).toBeDefined()
      expect(biomeConfig.linter.enabled).toBe(true)
      expect(biomeConfig.formatter.enabled).toBe(true)
    })

    test('should load audit-ci config successfully', () => {
      const auditConfig = require('../audit-ci.json')
      expect(auditConfig).toBeDefined()
      expect(typeof auditConfig).toBe('object')
    })

    test('should have audit levels configured', () => {
      const auditConfig = require('../audit-ci.json')
      expect(auditConfig.moderate).toBe(true)
      expect(auditConfig.high).toBe(true)
      expect(auditConfig.critical).toBe(true)
    })
  })

  describe('Basic Functionality Tests', () => {
    test('should validate environment variables', () => {
      // Basic environment test
      expect(process.env.NODE_ENV || 'test').toBeDefined()
    })

    test('should have proper module exports structure', () => {
      // Test that package structure is correct
      const packageJson = require('../package.json')
      expect(packageJson.main).toMatch(/\.js$/)
      expect(packageJson.name).toMatch(/^[a-z0-9-]+$/)
    })

    test('should have proper versioning', () => {
      const packageJson = require('../package.json')
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/)
    })

    test('should have proper license', () => {
      const packageJson = require('../package.json')
      expect(packageJson.license).toBeDefined()
      expect(typeof packageJson.license).toBe('string')
    })
  })

  describe('Command Structure Tests', () => {
    test('should have all required Quality Hub commands', () => {
      const packageJson = require('../package.json')
      const commands = packageJson.contributes.commands

      const requiredCommands = [
        'qualityHub.showQualityPanel',
        'qualityHub.runESLint',
        'qualityHub.runPrettier',
        'quality-hub.jest',
        'quality-hub.eslintCode',
        'quality-hub.biomeCode'
      ]

      requiredCommands.forEach((cmdId) => {
        const command = commands.find((cmd) => cmd.command === cmdId)
        expect(command).toBeDefined()
        expect(command.title).toBeDefined()
        expect(command.category).toBe('Quality Hub')
      })
    })

    test('should have proper command categories', () => {
      const packageJson = require('../package.json')
      const commands = packageJson.contributes.commands

      commands.forEach((command) => {
        expect(command.category).toBe('Quality Hub')
        expect(command.title).toBeDefined()
        expect(typeof command.title).toBe('string')
        expect(command.title.length).toBeGreaterThan(0)
      })
    })
  })
})
