import * as SV from 'https://deno.land/std@0.224.0/semver/mod.ts'
import * as schemas from './schemas/mod.ts'

export class Solc {

    static async compile(solcJsonInputPath:string, solcDir:string) {

        // get solcJsonInput and build a list of paths to allow later
        const solcJsonInputText = await Deno.readTextFile(solcJsonInputPath)
        const solcJsonInput = await schemas.solcJsonInput.parseAsync(JSON.parse(solcJsonInputText))
        const allowPaths:string[] = []
        for (const source of Object.values(solcJsonInput.sources))
            allowPaths.push(source.urls.at(0)!)
    
        // get source url paths to build --allow-paths
        const outputSelectionSources = Object.keys(solcJsonInput.settings.outputSelection)
        const sourcePaths:string[] = []
        for (const source of outputSelectionSources) {
            if (!solcJsonInput.sources[source])
                throw new Error(`outputSelection source ${source} not in sources`)
            if (!solcJsonInput.sources[source].urls.at(0))
                throw new Error(`no url for source ${source}`)
            sourcePaths.push(solcJsonInput.sources[source].urls.at(0)!)
        }
    
        // get SemVer Ranges from code (and code from source urls)
        const sourceContents:string[] = []
        for (const path of sourcePaths) sourceContents.push(await Deno.readTextFile(path))
        const ranges:SV.Range[] = []
        for (const code of sourceContents) {
            const versionPragmaText = code.match(/pragma solidity (.+?);/)?.[1]
            if (!versionPragmaText) throw new Error('no solidity version detected')
            const range = SV.parseRange(versionPragmaText)
            ranges.push(range)
        }
    
        // make sure we have a relatively up-to-date list of solc versions
        const solcVersionsListPath = `${solcDir}/versions.json`
        const solcVersionsListUrl = 'https://binaries.soliditylang.org/linux-amd64/list.json'
        const solcVersionsListExists = await Deno.stat(solcVersionsListPath)
            .catch<false>(() => false)
        const solcVersionsListMTime = solcVersionsListExists
            ? solcVersionsListExists.mtime!.getTime()!
            : -Infinity
        const solcVersionsListOutdated = Date.now() - solcVersionsListMTime > 86400000
        if (!solcVersionsListExists || solcVersionsListOutdated) {
            const response = await fetch(solcVersionsListUrl)
            await Deno.writeTextFile(solcVersionsListPath, await response.text())
        }
    
        // turn list file into object, get versions, find best version for our ranges
        // get release from best version
        const solcVersionsListText = await Deno.readTextFile(solcVersionsListPath)
        const solcVersionsList = await schemas.solcVersionsList.parseAsync(JSON.parse(solcVersionsListText))
        let versions = Object.keys(solcVersionsList.releases).map(SV.parse)
        for (const range of ranges) versions = versions.filter(v => SV.satisfies(v, range))
        if (!versions.length) throw new Error('no version satisfies ranges')
        const v = versions.reduce((p, c) => SV.greaterThan(c, p) ? c : p)
        const release = solcVersionsList.releases[`${v.major}.${v.minor}.${v.patch}`]
    
        // acquire the release if needed
        if (!await Deno.stat(`${solcDir}/${release}`).catch(()=>0)) {
            const response = await fetch(`https://binaries.soliditylang.org/linux-amd64/${release}`)
            const blob = await response.blob()
            await Deno.writeFile(`${solcDir}/${release}`, blob.stream(), { mode: 0o755 })
        }
    
        // compile
        const args = ['--standard-json', '--allow-paths', allowPaths.join(',')]
        const options = { args, stdin: 'piped', stdout: 'piped', stderr: 'piped' } as const
        const proc = new Deno.Command(`${solcDir}/${release}`, options).spawn()
        const writer = proc.stdin.getWriter()
        await writer.write(new TextEncoder().encode(solcJsonInputText))
        await writer.close()
        const cmdOut = await proc.output()
        const stdout = new TextDecoder().decode(cmdOut.stdout)
        return await schemas.solcCompilationOutput.parseAsync(JSON.parse(stdout))
    
    }

}