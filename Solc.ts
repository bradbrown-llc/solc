import { solcOut } from "./schemas/solcOut/solcOut.ts";


export class Solc {

    static async up(solcDir:string, version:string) {

        // if already cached, return
        const solcCached = (version:string, solcDir:string) =>
            Deno.stat(`${solcDir}/${version}`).then(_=>1).catch(_=>0)
        if (await solcCached(version, solcDir)) return

        // download solc binary
        const solcRepo = 'https://github.com/ethereum/solidity'
        const dl = `releases/download/v${version}/solc-static-linux`
        const response = await fetch(`${solcRepo}/${dl}`)
        const blob = await response.blob()
        const arrbuf = await blob.arrayBuffer()
        const uints = new Uint8Array(arrbuf)

        // write to cache
        await Deno.mkdir(solcDir, { recursive: true })
        const path = `${solcDir}/${version}`
        const options = { mode: 0o755 }
        await Deno.writeFile(path, uints, options)

    }

    static async compile(
        solcDir:string, version:string, json:string
    ) {

        // compile
        const stdin = 'piped', stderr = 'piped', stdout = 'piped'
        const bin = `${solcDir}/${version}`
        const args = ['--standard-json']
        const options = { args, stdin, stdout, stderr } as const
        const proc = new Deno.Command(bin, options).spawn()
        const writer = proc.stdin.getWriter()
        const chunk = new TextEncoder().encode(json)
        await writer.write(chunk)
        await writer.close()
        const cmdOut = await proc.output()
        const out = new TextDecoder().decode(cmdOut.stdout)

        console.log(out)
        // parse output
        return solcOut.parse(JSON.parse(out))

    }

}