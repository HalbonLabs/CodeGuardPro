const { describe, it, before, after } = require('mocha')
const { expect } = require('chai')
const fs = require('fs')
const path = require('path')

describe('CodeGuard Pro Extension - Mocha Configuration Tests', function () {
  this.timeout(10000)

  const projectRoot = path.resolve(__dirname, '..')

  before(function () {
    console.log('Starting Mocha configuration tests...')
  })

  after(function () {
    console.log('Completed Mocha configuration tests')
  })

  describe('Package Configuration', function () {
    let packageJson

    before(function () {
      const packagePath = path.join(projectRoot, 'package.json')
      expect(fs.existsSync(packagePath), 'package.json should exist').to.be.true
      packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    })

    it('should have valid package.json structure', function () {
      expect(packageJson).to.be.an('object')
      expect(packageJson.name).to.equal('codeguard-pro')
      expect(packageJson.displayName).to.equal('CodeGuard Pro')
      expect(packageJson.main).to.equal('./out/simple-extension.js')
    })

    it('should have VS Code engine specified', function () {
      expect(packageJson.engines).to.be.an('object')
      expect(packageJson.engines.vscode).to.be.a('string')
      expect(packageJson.engines.vscode).to.match(/^\^?\d+\.\d+\.\d+$/)
    })

    it('should have Mocha command defined', function () {
      expect(packageJson.contributes).to.be.an('object')
      expect(packageJson.contributes.commands).to.be.an('array')

      const mochaCommand = packageJson.contributes.commands.find(
        (cmd) => cmd.command === 'quality-hub.mocha'
      )
      expect(mochaCommand, 'Mocha command should be defined').to.exist
      expect(mochaCommand.title).to.equal('Run Mocha Tests')
    })

    it('should have Mocha types dependency', function () {
      expect(packageJson.devDependencies).to.be.an('object')
      expect(packageJson.devDependencies['@types/mocha']).to.be.a('string')
    })

    it('should have required testing dependencies', function () {
      const requiredDeps = ['mocha', '@types/mocha', 'ts-node']

      // Check if dependencies exist in either devDependencies or regular dependencies
      requiredDeps.forEach((dep) => {
        const exists =
          (packageJson.devDependencies && packageJson.devDependencies[dep]) ||
          (packageJson.dependencies && packageJson.dependencies[dep])
        expect(exists, `${dep} should be installed`).to.exist
      })
    })
  })

  describe('Mocha Configuration', function () {
    it('should have Mocha config file', function () {
      const mochaConfigPath = path.join(projectRoot, '.mocharc.json')
      expect(fs.existsSync(mochaConfigPath), '.mocharc.json should exist').to.be.true
    })

    it('should load Mocha config successfully', function () {
      const mochaConfigPath = path.join(projectRoot, '.mocharc.json')
      const config = JSON.parse(fs.readFileSync(mochaConfigPath, 'utf8'))

      expect(config).to.be.an('object')
      expect(config.timeout).to.be.a('number')
      expect(config.spec).to.be.an('array')
      expect(config.require).to.include('./mocha.setup.js')
    })

    it('should have Mocha setup file', function () {
      const setupPath = path.join(projectRoot, 'mocha.setup.js')
      expect(fs.existsSync(setupPath), 'mocha.setup.js should exist').to.be.true
    })

    it('should have correct test patterns', function () {
      const mochaConfigPath = path.join(projectRoot, '.mocharc.json')
      const config = JSON.parse(fs.readFileSync(mochaConfigPath, 'utf8'))

      expect(config.spec).to.include.members([
        'tests/**/*.mocha.test.ts',
        'tests/**/*.mocha.test.js',
        'src/**/*.test.ts',
        'src/**/*.test.js'
      ])
    })
  })

  describe('TypeScript Configuration', function () {
    it('should have valid tsconfig.json', function () {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
      expect(fs.existsSync(tsconfigPath), 'tsconfig.json should exist').to.be.true

      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
      expect(tsconfig).to.be.an('object')
      expect(tsconfig.compilerOptions).to.be.an('object')
    })

    it('should have correct compiler options for Mocha', function () {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))

      expect(tsconfig.compilerOptions.module).to.be.oneOf(['commonjs', 'CommonJS'])
      expect(tsconfig.compilerOptions.target).to.exist
      expect(tsconfig.compilerOptions.lib).to.be.an('array')
    })
  })

  describe('File Structure', function () {
    it('should have src directory', function () {
      const srcPath = path.join(projectRoot, 'src')
      expect(fs.existsSync(srcPath), 'src directory should exist').to.be.true
      expect(fs.statSync(srcPath).isDirectory(), 'src should be a directory').to.be.true
    })

    it('should have tests directory', function () {
      const testsPath = path.join(projectRoot, 'tests')
      expect(fs.existsSync(testsPath), 'tests directory should exist').to.be.true
      expect(fs.statSync(testsPath).isDirectory(), 'tests should be a directory').to.be.true
    })

    it('should have main extension file', function () {
      const extensionPath = path.join(projectRoot, 'src/extension.ts')
      expect(fs.existsSync(extensionPath), 'src/extension.ts should exist').to.be.true
    })

    it('should have compiled output', function () {
      const outPath = path.join(projectRoot, 'out')
      expect(fs.existsSync(outPath), 'out directory should exist').to.be.true

      const compiledExtension = path.join(outPath, 'extension.js')
      expect(fs.existsSync(compiledExtension), 'compiled extension.js should exist').to.be.true
    })
  })

  describe('Quality Tools Configuration', function () {
    it('should have ESLint configuration', function () {
      const eslintPath = path.join(projectRoot, '.eslintrc.json')
      expect(fs.existsSync(eslintPath), '.eslintrc.json should exist').to.be.true

      const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, 'utf8'))
      expect(eslintConfig).to.be.an('object')
    })

    it('should have Biome configuration', function () {
      const biomePath = path.join(projectRoot, 'biome.json')
      expect(fs.existsSync(biomePath), 'biome.json should exist').to.be.true

      const biomeConfig = JSON.parse(fs.readFileSync(biomePath, 'utf8'))
      expect(biomeConfig).to.be.an('object')
    })

    it('should have audit-ci configuration', function () {
      const auditCiPath = path.join(projectRoot, 'audit-ci.json')
      expect(fs.existsSync(auditCiPath), 'audit-ci.json should exist').to.be.true
    })
  })
})
