import z from 'https://deno.land/x/zod@v3.22.4/index.ts';

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

        // build output parsing schema
        // const object = z.string()
        // const bytecode = z.object({ object })
        // const evm = z.object({ bytecode })
        // const abi = z.unknown()
        // const contract = z.record(z.string(), z.object({ abi, evm }))
        // const source = z.record(z.string(), contract)
        // const contracts = z.record(z.string(), source).optional()
        //     .transform(x => x
        //         ? Object.fromEntries(Object.entries(x.contract)
        //             .map(([k, v]) => [
        //                 k,
        //                 v.map(([k, v]) => [])
        //                 // {
        //                 //     abi: v.abi,
        //                 //     bytecode: v.evm.bytecode.object
        //                 // } as { abi: unknown, bytecode: string }|undefined
        //             ]
        //             )) : x
        //     )

        // parse output
        return JSON.parse(out)

    }

}