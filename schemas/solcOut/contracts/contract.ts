import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import { abi } from './abi.ts';
import { evm } from './evm.ts';

export const contract = z.object({ abi, evm })