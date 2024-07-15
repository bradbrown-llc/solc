import * as SV from 'https://deno.land/std@0.224.0/semver/mod.ts'

export function solidityToSemVerRange(code:string):SV.Range {
    const versionPragmaText = code.match(/pragma solidity (.+?);/)?.[1]
    if (!versionPragmaText) throw new Error('no solidity version detected')
    return SV.parseRange(versionPragmaText)
}