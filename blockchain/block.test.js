// This file is used to generate tests for Block Class
const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const {
    GENESIS_DATA,
    MINE_RATE
} = require('../config');
const {cryptoHash} = require('../util');

describe('Block', () => {
    // generating some dummy data
    const timestamp = 2000;
    const hash = 'foo-hash';
    const lastHash = 'foo-lashHash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    // when our key and values are same, we can pass the arguments just with the key name
    const block = new Block({
        timestamp,
        hash,
        lastHash,
        data,
        nonce,
        difficulty
    });
    // write some tests here
    // test that all the args should be present at the time of block creation
    it('has a timestamp,lastHash, hash, data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    // describe a test for genesis function
    describe('genesis()', () => {
        // calling a static function from Block class
        const genesisBlock = Block.genesis();

        // create a test for genesisBlock to be instance of Block class
        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        // create a test
        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    // test for mine block function
    describe('mineBlock()', () => {
        // lastblock can be anything, so lets consider it as genesisBlock
        const lastBlock = Block.genesis();
        const data = 'mined-data';
        const minedBlock = Block.mineBlock({
            lastBlock,
            data
        });

        // creating tests for mineBlock()
        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a SHA-256 `hash` based on proper inputs', () => {
            expect(minedBlock.hash)
                .toEqual(
                    cryptoHash(minedBlock.timestamp, minedBlock.nonce, minedBlock.difficulty, data, lastBlock.hash));
        });

        it('sets a `hash` that matches the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResult = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];
            expect(possibleResult.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('raises the difficulty of quickly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it('lowers the difficulty of slowly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('has lower limit of 1', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({
                originalBlock: block
            })).toEqual(1);

        });
    });
});