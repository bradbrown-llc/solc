import * as Path from 'https://deno.land/std@0.224.0/path/mod.ts'
import * as Solc from '../../../mod.ts'

const projectDirectory = '@uniswap/v3-periphery/contracts'
const contractName = 'NonfungiblePositionManager'
const solcJsonInputPath = `${projectDirectory}/${contractName}.settings.json`
const solcDir = Path.resolve(Deno.env.get('HOME')!, './solc/.cache')
const compilationResults = await Solc.compileJson(solcJsonInputPath, solcDir)
console.log(compilationResults)