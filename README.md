# RMRK1 Seeder script demo
Collection of seeder scripts for RMRK1

- First create `.env` file in root of this project by copying example in `.env.example` And replace values with your own

## Seed NFTs

`yarn seed:demo`


## Fetch blocks

`yarn fetch --prefixes=0x726d726b,0x524d524b --append=dumps-unconsolidated.json --ws=wss://kusama-rpc.polkadot.io`
- Fetch using rmrk-tools and save output to `dumps-unconsolidated.json`

Optionally pass block range with
`yarn fetch --prefixes=0x726d726b,0x524d524b --append=dumps-unconsolidated.json --from=8949643 --to=8950000 --ws=wss://kusama-rpc.polkadot.io`

It is recommended to first test your script on local node, therefore connect to local node wss url
`yarn fetch --prefixes=0x726d726b,0x524d524b --append=dumps-unconsolidated.json --ws=ws://localhost:9944`

## Consolidate blocks

`yarn consolidate --json=dumps-unconsolidated.json -ws=wss://kusama-rpc.polkadot.io`
- Consolidate `dumps-unconsolidated.json` using rmrk-tools
