export async function updateSolcVersionsList(solcDir:string):Promise<void> {
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
}