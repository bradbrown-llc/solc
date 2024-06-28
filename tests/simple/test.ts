import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts"
import { Solc } from "../../Solc.ts";

const solcDir = fromFileUrl(import.meta.resolve('../../.cache/'))
const projDir = fromFileUrl(import.meta.resolve('./foo/'))
const version = '0.8.18'
const json = Deno.readTextFileSync(`${projDir}/settings.json`)

await Solc.up(solcDir, version)
const foo = await Solc.compile(solcDir, version, json)

console.log(foo)