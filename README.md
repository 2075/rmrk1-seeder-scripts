# RMRK1 Seeder script demo
Collection of seeder scripts for RMRK1

- First create `.env` file in root of this project by copying example in `.env.example` 

## Seed NFTs

`yarn seed:demo`


## Fetch blocks

`yarn fetch --prefixes=0x726d726b,0x524d524b --append=dumps-unconsolidated.json`
- Fetch using rmrk-tools and save output to `dumps-unconsolidated.json`


## Consolidate blocks

`yarn consolidate --json=dumps-unconsolidated.json`
- Consolidate `dumps-unconsolidated.json` using rmrk-tools
