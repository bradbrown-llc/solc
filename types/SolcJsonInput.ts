import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { solcJsonInput } from "../schemas/solcJsonInput.ts";

export type SolcJsonInput = z.infer<typeof solcJsonInput>