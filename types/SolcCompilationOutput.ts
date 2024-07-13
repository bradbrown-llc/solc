import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { solcCompilationOutput } from "../schemas/solcCompilationOutput.ts";

export type SolcCompilationOutput = z.infer<typeof solcCompilationOutput>