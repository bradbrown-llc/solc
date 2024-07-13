import z from "https://deno.land/x/zod@v3.22.4/index.ts";

export const solcVersionsList = z.object({
    builds: z.object({
        path: z.string(),
        version: z.string(),
        build: z.string(),
        keccak256: z.string(),
        sha256: z.string(),
        urls: z.string().array()
    }).array(),
    releases: z.record(z.string(), z.string())
})