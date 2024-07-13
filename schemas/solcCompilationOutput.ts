import z from 'https://deno.land/x/zod@v3.22.4/index.ts';

export const solcCompilationOutput = z.object({
    contracts: z.record(
        z.string(), // sources
        z.record(
            z.string(), // contracts
            z.object({
                abi: z.unknown().array().optional(),
                evm: z.object({
                    bytecode: z.object({
                        object: z.string().optional()
                    }).optional()
                }).optional()
            }).optional()
        ).optional()
    ).optional(),
    errors: z.object({
        component: z.string(),
        errorCode: z.string().optional(),
        formattedMessage: z.string(),
        message: z.string(),
        severity: z.string(),
        sourceLocation: z.object({
            end: z.number(),
            file: z.string(),
            start: z.number()
        }).optional(),
        type: z.string()
    }).array().optional()
})