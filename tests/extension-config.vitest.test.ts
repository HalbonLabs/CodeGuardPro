// Vitest configuration tests for Quality Hub extension
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Quality Hub Extension - Vitest Configuration Tests', () => {
  const projectRoot = path.resolve(__dirname, '..')
  
  beforeAll(() => {
    console.log('Starting Vitest configuration tests...')
  })

  afterAll(() => {
    console.log('Completed Vitest configuration tests')
  })

  describe('Package Configuration', () => {
    let packageJson: any

    beforeAll(() => {
      const packagePath = path.join(projectRoot, 'package.json')
      expect(fs.existsSync(packagePath), 'package.json should exist').toBe(true)
      packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    })

    it('should have valid package.json structure', () => {
      expect(packageJson).toBeTypeOf('object')
      expect(packageJson.name).toBe('quality-hub')
      expect(packageJson.displayName).toBe('Quality Hub')
      expect(packageJson.description).toBeTypeOf('string')
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/)
    })

    it('should have VS Code engine specified', () => {
      expect(packageJson.engines).toBeTypeOf('object')
      expect(packageJson.engines.vscode).toBeTypeOf('string')
      expect(packageJson.engines.vscode).toMatch(/^\^?\d+\.\d+\.\d+/)
    })

    it('should have Vitest command defined', () => {
      expect(packageJson.contributes).toBeTypeOf('object')
      expect(packageJson.contributes.commands).toBeInstanceOf(Array)
      
      const vitestCommand = packageJson.contributes.commands.find(
        (cmd: any) => cmd.command === 'quality-hub.vitest'
      )
      expect(vitestCommand).toBeDefined()
      expect(vitestCommand.title).toBe('Run Vitest Tests')
    })

    it('should have Vitest dependency', () => {
      expect(packageJson.devDependencies).toBeTypeOf('object')
      expect(packageJson.devDependencies.vitest).toBeTypeOf('string')
    })

    it('should have required testing dependencies', () => {
      const requiredDeps = ['vitest', '@vitest/ui']
      
      requiredDeps.forEach(dep => {
        const exists = (packageJson.devDependencies && packageJson.devDependencies[dep]) ||
                      (packageJson.dependencies && packageJson.dependencies[dep])
        expect(exists, `${dep} should be installed`).toBeDefined()
      })
    })

    it('should have Vitest scripts defined', () => {
      expect(packageJson.scripts).toBeTypeOf('object')
      expect(packageJson.scripts['test:vitest']).toBeDefined()
      expect(packageJson.scripts['test:vitest:watch']).toBeDefined()
      expect(packageJson.scripts['test:vitest:ui']).toBeDefined()
      expect(packageJson.scripts['test:vitest:coverage']).toBeDefined()
    })
  })

  describe('Vitest Configuration', () => {
    it('should have Vitest config file', () => {
      const vitestConfigPath = path.join(projectRoot, 'vitest.config.ts')
      expect(fs.existsSync(vitestConfigPath), 'vitest.config.ts should exist').toBe(true)
    })

    it('should have Vitest setup file', () => {
      const setupPath = path.join(projectRoot, 'vitest.setup.ts')
      expect(fs.existsSync(setupPath), 'vitest.setup.ts should exist').toBe(true)
    })

    it('should load Vitest config successfully', () => {
      const vitestConfigPath = path.join(projectRoot, 'vitest.config.ts')
      const content = fs.readFileSync(vitestConfigPath, 'utf8')
      
      expect(content).toContain('defineConfig')
      expect(content).toContain('vitest/config')
      expect(content).toContain('environment: \'node\'')
    })
  })

  describe('TypeScript Configuration', () => {
    it('should have valid tsconfig.json', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
      expect(fs.existsSync(tsconfigPath), 'tsconfig.json should exist').toBe(true)
      
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
      expect(tsconfig).toBeTypeOf('object')
      expect(tsconfig.compilerOptions).toBeTypeOf('object')
    })

    it('should have correct compiler options for Vitest', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
      
      expect(['commonjs', 'CommonJS']).toContain(tsconfig.compilerOptions.module)
      expect(tsconfig.compilerOptions.target).toBeDefined()
      expect(tsconfig.compilerOptions.lib).toBeInstanceOf(Array)
    })
  })

  describe('File Structure', () => {
    it('should have src directory', () => {
      const srcPath = path.join(projectRoot, 'src')
      expect(fs.existsSync(srcPath), 'src directory should exist').toBe(true)
      expect(fs.statSync(srcPath).isDirectory(), 'src should be a directory').toBe(true)
    })

    it('should have tests directory', () => {
      const testsPath = path.join(projectRoot, 'tests')
      expect(fs.existsSync(testsPath), 'tests directory should exist').toBe(true)
      expect(fs.statSync(testsPath).isDirectory(), 'tests should be a directory').toBe(true)
    })

    it('should have main extension file', () => {
      const extensionPath = path.join(projectRoot, 'src/extension.ts')
      expect(fs.existsSync(extensionPath), 'src/extension.ts should exist').toBe(true)
    })

    it('should have compiled output', () => {
      const outPath = path.join(projectRoot, 'out')
      if (fs.existsSync(outPath)) {
        const compiledExtension = path.join(outPath, 'extension.js')
        expect(fs.existsSync(compiledExtension), 'compiled extension.js should exist').toBe(true)
      }
    })
  })

  describe('Quality Tools Configuration', () => {
    it('should have ESLint configuration', () => {
      const eslintPath = path.join(projectRoot, '.eslintrc.json')
      expect(fs.existsSync(eslintPath), '.eslintrc.json should exist').toBe(true)
      
      const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, 'utf8'))
      expect(eslintConfig).toBeTypeOf('object')
    })

    it('should have Biome configuration', () => {
      const biomePath = path.join(projectRoot, 'biome.json')
      expect(fs.existsSync(biomePath), 'biome.json should exist').toBe(true)
      
      const biomeConfig = JSON.parse(fs.readFileSync(biomePath, 'utf8'))
      expect(biomeConfig).toBeTypeOf('object')
    })

    it('should have audit-ci configuration', () => {
      const auditPath = path.join(projectRoot, 'audit-ci.json')
      expect(fs.existsSync(auditPath), 'audit-ci.json should exist').toBe(true)
      
      const auditConfig = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
      expect(auditConfig).toBeTypeOf('object')
    })
  })
})
