import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts"
import { Solc } from "../../Solc.ts";

const solcDir = fromFileUrl(import.meta.resolve('../../.cache/'))
const projDir = fromFileUrl(import.meta.resolve('./'))
const version = '0.4.18'
const json = Deno.readTextFileSync(`${projDir}/settings.json`)
await Solc.up(solcDir, version)
const foo = await Solc.compile(solcDir, version, json)
console.log(foo.contracts!['WETH9.sol']!['WETH9']!.evm.bytecode.object)

// if (!foo.contracts) throw new Error('no contracts')
// const booSol = foo.contracts['boo.sol']
// if (!booSol) throw new Error('no boo.sol')
// const baz = foo.contracts['boo.sol']!['Baz']
// if (!baz) throw new Error('no Baz')
// console.log(baz)