export async function acquireSolcRelease(solcDir:string, release:string):Promise<void> {
    if (!await Deno.stat(`${solcDir}/${release}`).catch(()=>0)) {
        const response = await fetch(`https://binaries.soliditylang.org/linux-amd64/${release}`)
        const blob = await response.blob()
        await Deno.writeFile(`${solcDir}/${release}`, blob.stream(), { mode: 0o755 })
    }
}