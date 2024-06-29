import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import { bytecode } from './bytecode.ts';

export const evm = z.object({ bytecode })