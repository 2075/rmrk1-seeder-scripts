import walkSync from 'walk-sync';
import pLimit from 'p-limit';
import { NFTMetadata } from 'rmrk-tools/dist/rmrk1.0.0/classes/nft';
import { pinata, sleep, uploadAndPinIpfsMetadata } from './utils';
import fs from 'fs';
import { Readable } from 'stream';
import { PinataPinOptions } from '@pinata/sdk';

const defaultOptions: Partial<PinataPinOptions> = {
  pinataOptions: {
    cidVersion: 1,
  },
};

const fsPromises = fs.promises;
export type StreamPinata = Readable & {
  path?: string;
};
const limit = pLimit(1);

const metadataBase: NFTMetadata = {
  name: 'Landscape NFT',
  description: 'This is example of Landscape NFT',
  external_url: 'https://rmrk.app',
  attributes: [],
};

const pinFileStreamToIpfs = async (file: StreamPinata, name?: string) => {
  const options = { ...defaultOptions, pinataMetadata: { name } };
  const result = await pinata.pinFileToIPFS(file, options);
  return result.IpfsHash;
};

export const pinSingleMetadataFromDir = async (dir: string, path: string, name: string) => {
  try {
    const imageFile = await fsPromises.readFile(`${process.cwd()}${dir}/${path}`);
    if (!imageFile) {
      throw new Error('No image file');
    }

    const stream: StreamPinata = Readable.from(imageFile);
    stream.path = path;

    const imageCid = await pinFileStreamToIpfs(stream, name);
    console.log(`NFT ${path} IMAGE CID: `, imageCid);
    const metadata: NFTMetadata = { ...metadataBase, name, image: `ipfs://ipfs/${imageCid}` };
    const metadataCid = await uploadAndPinIpfsMetadata(metadata);
    await sleep(500);
    console.log(`NFT ${name} METADATA: `, metadataCid);
    return metadataCid;
  } catch (error) {
    console.log(error);
    console.log(JSON.stringify(error));
    return '';
  }
};

export const pinMetadata = async () => {
  try {
    const paths = walkSync(`${process.cwd()}/data/demo-nft-images`, {
      directories: false,
    });

    const promises = paths.map((path, index) =>
      limit(async () => {
        const name = `${metadataBase.name} #${index + 1}`;
        try {
          const metadataCid = await pinSingleMetadataFromDir('/data/demo-nft-images', path, name);
          return metadataCid;
        } catch (error) {
          console.log(error);
          console.log(JSON.stringify(error));
          return '';
        }
      }),
    );

    const pinnedMetadata = await Promise.all(promises);

    return pinnedMetadata;
  } catch (error: any) {
    console.error(error);
  }
};
