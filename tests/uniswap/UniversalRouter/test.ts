import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts"
import { Solc } from "../../../Solc.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

const solcDir = fromFileUrl(import.meta.resolve('../../../.cache'))
const projDir = fromFileUrl(import.meta.resolve('./.'))
const solcJsonInputPath = `${projDir}/settings.json`
const results = await Solc.compile(solcJsonInputPath, solcDir)
const bytecode = results?.contracts?.['UniversalRouter.sol']?.['UniversalRouter']?.evm?.bytecode?.object
Deno.test('bytecode exists', () => {
    console.log(bytecode)
    assert(bytecode)
})