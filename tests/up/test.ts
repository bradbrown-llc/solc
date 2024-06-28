import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts"
import { Solc } from "../../Solc.ts";

await Solc.up(fromFileUrl(import.meta.resolve('../../.cache/')), '0.8.0')