import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts"
import * as Solc from "../../../mod.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

const solcDir = fromFileUrl(import.meta.resolve('../../../.cache'))
const projDir = fromFileUrl(import.meta.resolve('./.'))
const solcJsonInputPath = `${projDir}/settings.json`
const results = await Solc.compileJson(solcJsonInputPath, solcDir)
const contract = results.contracts!['NonfungiblePositionManager.sol']!['NonfungiblePositionManager']!
const bytecode = contract.evm!.bytecode!.object!
const abi = contract.abi!
Deno.test('bytecode exists', () => {
    assert(bytecode)
})
Deno.test('bytecode length < 24576', () => {
    assert(bytecode)
    assert(bytecode.length / 2 < 24576)
})
Deno.test('abi exists', () => {
    assert(abi && abi.length > 0)
})