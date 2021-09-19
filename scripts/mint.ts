import { cryptoWaitReady, encodeAddress } from '@polkadot/util-crypto';
import { chunkArray, getApi, getKeyringFromUri, getKeys, sendAndFinalize } from './utils';
import { pinMetadata, pinSingleMetadataFromDir } from './pin-metadatas';
import { Collection, NFT } from 'rmrk-tools';
import { u8aToHex } from '@polkadot/util';
import { WS_URL } from './constants';

const NFT_COLLECTION_SYMBOL = 'RMRK-TEST-NFT';

export const mint = async () => {
  try {
    console.log('MINT KANARIA GENESIS BIRDS START -------');
    await cryptoWaitReady();
    const accounts = getKeys();
    const phrase = process.env.MNEMONIC_PHRASE;
    const kp = getKeyringFromUri(phrase);

    const metadatas = await pinMetadata();

    const collectionId = Collection.generateId(
      u8aToHex(accounts[0].publicKey),
      NFT_COLLECTION_SYMBOL,
    );

    const collectionMetadataCid = await pinSingleMetadataFromDir(
      '/data',
      'collection_image.jpeg',
      'RMRK1 demo collection',
    );

    const MyCollection = new Collection(
      0,
      'RMRK1 demo collection',
      0,
      encodeAddress(accounts[0].address, 2),
      NFT_COLLECTION_SYMBOL,
      collectionId,
      collectionMetadataCid,
    );
    const remarks = [MyCollection.mint()];

    metadatas.forEach((metadataCid, index) => {
      const sn = index + 1;
      const nft = new NFT(
        0,
        collectionId,
        `Demo NFT #${sn}`,
        `demo_nft_${sn}`,
        1,
        `${sn.toString()}`.padStart(16, '0'),
        metadataCid,
      );
      remarks.push(nft.mintnft());
    });

    const ws = WS_URL;
    const api = await getApi(ws);
    console.log('Connected to polkadot api');

    const txs = remarks.map((remark) => api.tx.system.remark(remark));

    // If you have a lot of NFTs better break them down into chunks to not exhaust block size
    let rmrksChunked = chunkArray(txs, 777);

    console.log(remarks);

    for (const rmrkChunk of rmrksChunked) {
      console.log(`Chunk size: ${rmrkChunk.length}`);

      const tx = api.tx.utility.batch(rmrkChunk);
      const { block } = await sendAndFinalize(tx, kp);
      console.log('Demo NFTs minted at block: ', block);

      process.exit(0);
    }
  } catch (error: any) {
    console.error(error);
  }
};
