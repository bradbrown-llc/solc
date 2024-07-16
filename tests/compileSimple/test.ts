import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";
import { fromFileUrl } from "https://deno.land/std@0.224.0/path/from_file_url.ts";
import { Solc } from "../../Solc.ts";

const solcDir = fromFileUrl(import.meta.resolve('../../.cache'))
const code = Deno.readTextFileSync(fromFileUrl(import.meta.resolve('./Resolver.sol')))
    .replace(/\?I\?+/, ''.padEnd(40, '0'))
    .replace(/\?D\?+/, ''.padEnd(40, '1'))
    .replace(/\?W\?+/, ''.padEnd(40, '2'))

const results = await Solc.compileSimple(code, solcDir)
const bytecode = results?.contracts?.['<stdin>']?.['Resolver']?.evm?.bytecode?.object
Deno.test('bytecode exists', () => {
    console.log(bytecode)
    assert(bytecode)
})