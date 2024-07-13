import z from 'https://deno.land/x/zod@v3.22.4/index.ts';

export const solcJsonInput = z.object({
    language: z.literal('Solidity'),
    sources: z.record(z.string(), z.object({
        urls: z.string().array()
    })),
    settings: z.object({
        optimizer: z.object({
            enabled: z.boolean(),
            runs: z.number()
        }).optional(),
        outputSelection: z.record(z.string(), z.record(z.string(), z.string().array())),
        evmVersion: z.string()
    })
})