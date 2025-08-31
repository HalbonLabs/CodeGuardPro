/**
 * Basic Quality Hub Extension Tests
 * Simple tests to verify extension configuration and setup
 */

const path = require('path')
const fs = require('fs')

describe('Quality Hub Extension - Configuration Tests', () => {
  const projectRoot = path.join(__dirname, '..')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Package Configuration', () => {
    test('should have valid package.json structure', () => {
      const packagePath = path.join(projectRoot, 'package.json')
      const packageJson = require(packagePath)

      expect(packageJson.name).toBe('quality-hub')
      expect(packageJson.main).toBe('./out/extension.js')
      expect(packageJson.engines.vscode).toBeDefined()
      expect(Array.isArray(packageJson.contributes.commands)).toBe(true)
      expect(packageJson.contributes.commands.length).toBeGreaterThan(0)
    })

    test('should have all required dependencies', () => {
      const packagePath = path.join(projectRoot, 'package.json')
      const packageJson = require(packagePath)

      expect(packageJson.dependencies.axios).toBeDefined()
      expect(packageJson.devDependencies.typescript).toBeDefined()
      expect(packageJson.devDependencies.jest).toBeDefined()
      expect(packageJson.devDependencies['@types/jest']).toBeDefined()
      expect(packageJson.devDependencies.eslint).toBeDefined()
    })

    test('should have quality tool commands defined', () => {
      const packagePath = path.join(projectRoot, 'package.json')
      const packageJson = require(packagePath)
      const commands = packageJson.contributes.commands

      const jestCmd = commands.find((cmd) => cmd.command === 'quality-hub.jest')
      const eslintCmd = commands.find((cmd) => cmd.command === 'qualityHub.runESLint')
      const prettierCmd = commands.find((cmd) => cmd.command === 'qualityHub.runPrettier')

      expect(jestCmd).toBeDefined()
      expect(jestCmd.title).toBe('Run Jest Tests')
      expect(eslintCmd).toBeDefined()
      expect(prettierCmd).toBeDefined()
    })
  })

  describe('TypeScript Configuration', () => {
    test('should have valid tsconfig.json', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
      const tsconfig = require(tsconfigPath)

      expect(tsconfig.compilerOptions).toBeDefined()
      expect(tsconfig.compilerOptions.target).toBe('ES2020')
      expect(tsconfig.compilerOptions.module).toBe('commonjs')
      expect(tsconfig.include).toContain('src/**/*')
    })
  })

  describe('Jest Configuration', () => {
    test('should have valid Jest configuration', () => {
      const jestConfigPath = path.join(projectRoot, 'jest.config.js')
      const jestConfig = require(jestConfigPath)

      expect(jestConfig.preset).toBe('ts-jest')
      expect(jestConfig.testEnvironment).toBe('node')
      expect(Array.isArray(jestConfig.testMatch)).toBe(true)
      expect(jestConfig.testMatch.length).toBeGreaterThan(0)
    })

    test('should include proper test patterns', () => {
      const jestConfigPath = path.join(projectRoot, 'jest.config.js')
      const jestConfig = require(jestConfigPath)

      const hasTestsPattern = jestConfig.testMatch.some((pattern) =>
        pattern.includes('tests/**/*.test.')
      )
      expect(hasTestsPattern).toBe(true)
    })
  })

  describe('Quality Tools Configuration', () => {
    test('should have ESLint configuration', () => {
      const eslintConfigPath = path.join(projectRoot, '.eslintrc.json')
      const eslintConfig = require(eslintConfigPath)

      expect(eslintConfig.parser).toBe('@typescript-eslint/parser')
      expect(eslintConfig.plugins).toContain('@typescript-eslint')
      expect(eslintConfig.plugins).toContain('security')
      expect(eslintConfig.extends).toContain('@typescript-eslint/recommended')
    })

    test('should have Biome configuration', () => {
      const biomeConfigPath = path.join(projectRoot, 'biome.json')
      const biomeConfig = require(biomeConfigPath)

      expect(biomeConfig.linter.enabled).toBe(true)
      expect(biomeConfig.formatter.enabled).toBe(true)
      expect(biomeConfig.organizeImports.enabled).toBe(true)
    })

    test('should have audit-ci configuration', () => {
      const auditConfigPath = path.join(projectRoot, 'audit-ci.json')
      const auditConfig = require(auditConfigPath)

      expect(auditConfig.moderate).toBe(true)
      expect(auditConfig.high).toBe(true)
      expect(auditConfig.critical).toBe(true)
    })

    test('should have Prettier configuration', () => {
      const prettierConfigPath = path.join(projectRoot, '.prettierrc.json')
      expect(fs.existsSync(prettierConfigPath)).toBe(true)
    })
  })

  describe('File Structure Validation', () => {
    test('should have all required source files', () => {
      const requiredFiles = [
        'src/extension.ts',
        'src/services/QualityToolsService.ts',
        'src/ui/StatusBarManager.ts',
        'src/providers/QualityHubProvider.ts'
      ]

      requiredFiles.forEach((file) => {
        const filePath = path.join(projectRoot, file)
        expect(fs.existsSync(filePath)).toBe(true)
      })
    })

    test('should have configuration files', () => {
      const configFiles = [
        'package.json',
        'tsconfig.json',
        '.eslintrc.json',
        'biome.json',
        'jest.config.js',
        'jest.setup.js'
      ]

      configFiles.forEach((file) => {
        const filePath = path.join(projectRoot, file)
        expect(fs.existsSync(filePath)).toBe(true)
      })
    })

    test('should have security configuration files', () => {
      const securityFiles = ['audit-ci.json', '.retireignore', 'owasp-dependency-check.properties']

      securityFiles.forEach((file) => {
        const filePath = path.join(projectRoot, file)
        expect(fs.existsSync(filePath)).toBe(true)
      })
    })
  })

  describe('Script Validation', () => {
    test('should have Jest test scripts', () => {
      const packagePath = path.join(projectRoot, 'package.json')
      const packageJson = require(packagePath)

      expect(packageJson.scripts['test:jest']).toBeDefined()
      expect(packageJson.scripts['test:jest:watch']).toBeDefined()
      expect(packageJson.scripts['test:jest:coverage']).toBeDefined()
    })

    test('should have quality tool scripts', () => {
      const packagePath = path.join(projectRoot, 'package.json')
      const packageJson = require(packagePath)

      expect(packageJson.scripts.lint).toBeDefined()
      expect(packageJson.scripts.format).toBeDefined()
      expect(packageJson.scripts.audit).toBeDefined()
      expect(packageJson.scripts.compile).toBeDefined()
    })
  })
})
