import * as bip32 from 'bip32';
import { Network, networks } from 'bitcoinjs-lib';
import { BIP32Interface } from 'bip32';
import { Wallet, ScriptType, BIP44CoinTypeNode } from "../interface";


const HIGHEST_BIT = 0x80000000;



export async function extractAccoutPrivateKey(wallet: Wallet, network: Network): Promise<BIP32Interface> {

    let coinType: number = 0;
    if (network != networks.bitcoin) {
        coinType = 1
    }

    const methodName = `snap_getBip44Entropy_${coinType}`
    const bitcoin44node = await wallet.request({
        method: methodName
    }) as BIP44CoinTypeNode
    const keyBuffer = Buffer.from(bitcoin44node.key, "base64")
    const privateKeyBuffer = keyBuffer.slice(0, 32)
    const chainCodeBuffer = keyBuffer.slice(32, 64)
    let node: BIP32Interface = bip32.fromPrivateKey(privateKeyBuffer, chainCodeBuffer, network)
    //@ts-ignore 
    // ignore checking since no function to set depth for node
    node.__DEPTH = 2;
    //@ts-ignore
    // ignore checking since no function to set index for node
    node.__INDEX = HIGHEST_BIT + 0;
    return node.deriveHardened(0);
}


export async function getExtendedPublicKey(wallet: Wallet, scriptType: ScriptType, network: Network): Promise<string> {
    switch (scriptType) {
        case ScriptType.P2PKH:
            let accountNode = await extractAccoutPrivateKey(wallet, network)
            let accountPublicKey = accountNode.neutered();
            return accountPublicKey.toBase58();
        default:
            throw new Error('ScriptType is not supported.');
    }
}