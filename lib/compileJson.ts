import * as SV from 'https://deno.land/std@0.224.0/semver/mod.ts'
import * as Path from 'https://deno.land/std@0.224.0/path/mod.ts'
import * as schemas from '../schemas/mod.ts'
import { acquireSolcRelease } from './acquireSolcRelease.ts'
import { solidityToSemVerRange } from './solidityToSemVerRange.ts'
import { updateSolcVersionsList } from './updateSolcVersionsList.ts'

export async function compileJson(solcJsonInputPath:string, solcDir:string) {

    const absSolcDir = Path.resolve(solcDir)
    const absSolcJsonInputPath = Path.resolve(solcJsonInputPath)

    // get solcJsonInput and build a list of paths to allow later
    const solcJsonInputText = await Deno.readTextFile(absSolcJsonInputPath)
    const solcJsonInput = await schemas.solcJsonInput.parseAsync(JSON.parse(solcJsonInputText))

    // get source paths
    const sourcePaths = await Promise.all(Object.values(solcJsonInput.sources).map(source =>
        Deno.realPath(Path.resolve(Path.dirname(absSolcJsonInputPath), source.urls.at(0)!))))

    // get SemVer Ranges from code (and code from source urls)
    const sourceContents:string[] = []
    for (const path of sourcePaths) sourceContents.push(await Deno.readTextFile(path))
    const ranges = sourceContents.map(solidityToSemVerRange).filter(x=>x) as SV.Range[]

    // make sure we have a relatively up-to-date list of solc versions
    await updateSolcVersionsList(absSolcDir)

    // turn list file into object, get versions, find best version for our ranges
    // get release from best version
    const solcVersionsListText = await Deno.readTextFile(`${absSolcDir}/versions.json`)
    const solcVersionsList = await schemas.solcVersionsList.parseAsync(JSON.parse(solcVersionsListText))
    let versions = Object.keys(solcVersionsList.releases).map(SV.parse)
    for (const range of ranges) versions = versions.filter(v => SV.satisfies(v, range))
    if (!versions.length) throw new Error('no version satisfies ranges')
    const v = versions.reduce((p, c) => SV.greaterThan(c, p) ? c : p)
    const release = solcVersionsList.releases[`${v.major}.${v.minor}.${v.patch}`]

    // acquire the release if needed
    await acquireSolcRelease(absSolcDir, release)

    // compile
    const args = ['--standard-json', '--allow-paths', sourcePaths.join(',')]
    const options = { args, stdin: 'piped', stdout: 'piped', stderr: 'piped', cwd: Path.dirname(absSolcJsonInputPath) } as const
    const proc = new Deno.Command(`${absSolcDir}/${release}`, options).spawn()
    const writer = proc.stdin.getWriter()
    await writer.write(new TextEncoder().encode(solcJsonInputText))
    await writer.close()
    const cmdOut = await proc.output()
    const stdout = new TextDecoder().decode(cmdOut.stdout)
    return await schemas.solcCompilationOutput.parseAsync(JSON.parse(stdout))

}