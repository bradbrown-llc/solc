import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import { file } from './file.ts';

export const contracts = z.record(z.string(), file.optional())