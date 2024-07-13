import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts"
import { Solc } from "../../Solc.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

const solcDir = fromFileUrl(import.meta.resolve('../../.cache'))
const projDir = fromFileUrl(import.meta.resolve('./.'))
const solcJsonInputPath = `${projDir}/settings.json`
const results = await Solc.compile(solcJsonInputPath, solcDir)
const bytecode0 = results?.contracts?.['UniswapV2Factory.sol']?.['UniswapV2Factory']?.evm?.bytecode?.object
const bytecode1 = results?.contracts?.['UniswapV2Factory.sol']?.['UniswapV2Pair']?.evm?.bytecode?.object
Deno.test('bytecode0 exists', () => {
    console.log(bytecode0)
    assert(bytecode0)
})
Deno.test('bytecode1 exists', () => {
    console.log(bytecode1)
    assert(bytecode1)
})