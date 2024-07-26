import * as SV from 'https://deno.land/std@0.224.0/semver/mod.ts'
import * as Path from 'https://deno.land/std@0.224.0/path/mod.ts'
import * as schemas from './schemas/mod.ts'
import { acquireSolcRelease, solidityToSemVerRange, updateSolcVersionsList } from './lib/mod.ts'

export class Solc {



    static async compile(solcJsonInputPath:string, solcDir:string) {

        // get solcJsonInput and build a list of paths to allow later
        const solcJsonInputText = await Deno.readTextFile(solcJsonInputPath)
        const solcJsonInput = await schemas.solcJsonInput.parseAsync(JSON.parse(solcJsonInputText))
        for (const source of Object.values(solcJsonInput.sources))
            source.urls = source.urls.map(url => Path.resolve(Path.dirname(solcJsonInputPath), url))
        const allowPaths:string[] = []
        for (const source of Object.values(solcJsonInput.sources))
            allowPaths.push(source.urls.at(0)!)
    
        // get source url paths to get code and SemVers from
        const sources = Object.keys(solcJsonInput.sources)
        const sourcePaths:string[] = []
        for (const source of sources) {
            if (!solcJsonInput.sources[source].urls.at(0))
                throw new Error(`no url for source ${source}`)
            sourcePaths.push(solcJsonInput.sources[source].urls.at(0)!)
        }
    
        // get SemVer Ranges from code (and code from source urls)
        const sourceContents:string[] = []
        for (const path of sourcePaths) sourceContents.push(await Deno.readTextFile(path))
        const ranges = sourceContents.map(solidityToSemVerRange).filter(x=>x) as SV.Range[]
    
        // make sure we have a relatively up-to-date list of solc versions
        await updateSolcVersionsList(solcDir)
    
        // turn list file into object, get versions, find best version for our ranges
        // get release from best version
        const solcVersionsListText = await Deno.readTextFile(`${solcDir}/versions.json`)
        const solcVersionsList = await schemas.solcVersionsList.parseAsync(JSON.parse(solcVersionsListText))
        let versions = Object.keys(solcVersionsList.releases).map(SV.parse)
        for (const range of ranges) versions = versions.filter(v => SV.satisfies(v, range))
        if (!versions.length) throw new Error('no version satisfies ranges')
        const v = versions.reduce((p, c) => SV.greaterThan(c, p) ? c : p)
        const release = solcVersionsList.releases[`${v.major}.${v.minor}.${v.patch}`]
    
        // acquire the release if needed
        await acquireSolcRelease(solcDir, release)
    
        // compile
        const args = ['--standard-json', '--allow-paths', allowPaths.join(',')]
        const options = { args, stdin: 'piped', stdout: 'piped', stderr: 'piped', cwd: Path.dirname(solcJsonInputPath) } as const
        const proc = new Deno.Command(`${solcDir}/${release}`, options).spawn()
        const writer = proc.stdin.getWriter()
        await writer.write(new TextEncoder().encode(solcJsonInputText))
        await writer.close()
        const cmdOut = await proc.output()
        const stdout = new TextDecoder().decode(cmdOut.stdout)
        return await schemas.solcCompilationOutput.parseAsync(JSON.parse(stdout))
    
    }



    static async compileSimple(code:string, solcDir:string) {

        // get SemVer range from code
        const range = solidityToSemVerRange(code)
        if (!range) throw new Error('no solidity version detected')

        // turn list file into object, get versions, find best version for our range
        // get release
        const solcVersionsListText = await Deno.readTextFile(`${solcDir}/versions.json`)
        const solcVersionsList = await schemas.solcVersionsList.parseAsync(JSON.parse(solcVersionsListText))
        const versions = Object.keys(solcVersionsList.releases).map(SV.parse).filter(v => SV.satisfies(v, range))
        if (!versions.length) throw new Error('no version satisfies ranges')
        const v = versions.reduce((p, c) => SV.greaterThan(c, p) ? c : p)
        const release = solcVersionsList.releases[`${v.major}.${v.minor}.${v.patch}`]

        // acquire the release if needed
        await acquireSolcRelease(solcDir, release)

        // compile
        const args = ['--standard-json']
        const options = { args, stdin: 'piped', stdout: 'piped', stderr: 'piped' } as const
        const proc = new Deno.Command(`${solcDir}/${release}`, options).spawn()
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



}