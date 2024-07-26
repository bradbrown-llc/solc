import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts"
import { Solc } from "../../../Solc.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

const solcDir = fromFileUrl(import.meta.resolve('../../../.cache'))
const projDir = fromFileUrl(import.meta.resolve('../WETH9'))
console.log({ solcDir, projDir })
const solcJsonInputPath = `${projDir}/settings.json`
const results = await Solc.compile(solcJsonInputPath, solcDir)
const bytecode = results?.contracts?.['WETH9.sol']?.['WETH9']?.evm?.bytecode?.object
Deno.test('bytecode exists', () => {
    console.log(bytecode)
    assert(bytecode)
})
Deno.test('bytecode length < 24576', () => {
    assert(bytecode)
    console.log(bytecode.length / 2)
    assert(bytecode.length / 2 < 24576)
})