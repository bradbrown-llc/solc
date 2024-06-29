import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import { contracts } from './contracts.ts';
import { errors } from './errors.ts';

export const solcOut = z.object({
    contracts: contracts.optional(),
    errors: errors.optional()
})