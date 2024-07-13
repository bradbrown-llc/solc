import z from "https://deno.land/x/zod@v3.22.4/index.ts";
import { solcVersionsList } from "../schemas/solcVersionsList.ts";

export type SolcVersionsList = z.infer<typeof solcVersionsList>