const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

class PubSub {
    constructor({
        blockchain,
        transactionPool
    }) {

        this.blockchain = blockchain;
        this.transactionPool = transactionPool;


        this.publisher = redis.createClient();
        this.subcriber = redis.createClient();

        this.subcriberToChannels();

        this.subcriber.on('message', (channel, message) =>
            this.handleMessage(channel, message));
    }

    handleMessage(channel, message) {
        const parsedMessage = JSON.parse(message);

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    });
                });
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }

    subcriberToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subcriber.subscribe(channel);
        });
    }

    publish({
        channel,
        message
    }) {
        this.subcriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subcriber.subscribe(channel);
            });
        });
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
}

module.exports = PubSub;