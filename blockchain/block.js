const hexToBinary = require('hex-to-binary');
const {
    GENESIS_DATA,
    MINE_RATE
} = require('../config');
const {cryptoHash} = require('../util');
// create a Block class with its parameters

class Block {
    constructor({
        timestamp,
        lastHash,
        hash,
        data,
        nonce,
        difficulty
    }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }
    //  factory methods
    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({
        lastBlock,
        data
    }) {
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        let {
            difficulty
        } = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({
                originalBlock: lastBlock,
                timestamp
            });
            hash = cryptoHash(timestamp, data, lastHash, difficulty, nonce);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash: cryptoHash(timestamp, data, lastHash, difficulty, nonce)
        });
    }
    static adjustDifficulty({
        originalBlock,
        timestamp
    }) {
        const {
            difficulty
        } = originalBlock;
        // lower bound is 1
        if (difficulty < 1) return 1;

        const difference = timestamp - originalBlock.timestamp;
        // when block was mined too slowly, lowers the difficulty
        if (difference > MINE_RATE) return difficulty - 1;

        return difficulty + 1;
    }
}

module.exports = Block;