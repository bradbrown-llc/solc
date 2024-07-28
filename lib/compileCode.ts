import * as SV from 'https://deno.land/std@0.224.0/semver/mod.ts'
import * as Path from 'https://deno.land/std@0.224.0/path/mod.ts'
import * as schemas from '../schemas/mod.ts'
import { acquireSolcRelease } from './acquireSolcRelease.ts'
import { solidityToSemVerRange } from './solidityToSemVerRange.ts'
import { updateSolcVersionsList } from './updateSolcVersionsList.ts'

export async function compileCode(code:string, solcDir:string) {

    const absSolcDir = Path.resolve(solcDir)

    // get SemVer range from code
    const range = solidityToSemVerRange(code)
    if (!range) throw new Error('no solidity version detected')

    // make sure we have a relatively up-to-date list of solc versions
    await updateSolcVersionsList(absSolcDir)

    // turn list file into object, get versions, find best version for our range
    // get release
    const solcVersionsListText = await Deno.readTextFile(`${absSolcDir}/versions.json`)
    const solcVersionsList = await schemas.solcVersionsList.parseAsync(JSON.parse(solcVersionsListText))
    const versions = Object.keys(solcVersionsList.releases).map(SV.parse).filter(v => SV.satisfies(v, range))
    if (!versions.length) throw new Error('no version satisfies ranges')
    const v = versions.reduce((p, c) => SV.greaterThan(c, p) ? c : p)
    const release = solcVersionsList.releases[`${v.major}.${v.minor}.${v.patch}`]

    // acquire the release if needed
    await acquireSolcRelease(absSolcDir, release)

    // compile
    const args = ['--standard-json']
    const options = { args, stdin: 'piped', stdout: 'piped', stderr: 'piped' } as const
    const proc = new Deno.Command(`${absSolcDir}/${release}`, options).spawn()
    const writer = proc.stdin.getWriter()
    const evmVersion
        = v.minor < 5 || (v.minor == 5 && v.patch < 5) ? 'byzantium'
        : v.minor == 5 && v.patch < 14 ? 'petersburg'
        : v.minor < 8 || (v.minor == 8 && v.patch < 5) ? 'istanbul'
        : v.minor == 8 && v.patch < 7 ? 'berlin'
        : v.minor == 8 && v.patch < 18 ? 'london'
        : 'paris'
    await writer.write(new TextEncoder().encode(JSON.stringify({
        language: 'Solidity',
        sources: { '<stdin>': { content: code } },
        settings: {
            outputSelection: { '*': { '*': ['evm.bytecode.object'] } },
            evmVersion
        }
    })))
    await writer.close()
    const cmdOut = await proc.output()
    const stdout = new TextDecoder().decode(cmdOut.stdout)
    return await schemas.solcCompilationOutput.parseAsync(JSON.parse(stdout))
    
}