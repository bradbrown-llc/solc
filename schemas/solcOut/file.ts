import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import { contract } from './contracts/contract.ts';

export const file = z.record(z.string(), contract.optional())