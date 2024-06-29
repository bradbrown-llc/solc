import z from 'https://deno.land/x/zod@v3.22.4/index.ts';

export const error = z.object({
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
})