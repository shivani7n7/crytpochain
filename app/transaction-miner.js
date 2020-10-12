const Transaction = require('../wallet/transaction');

class TransactionMiner {
    constructor({
        blockchain,
        transactionPool,
        wallet,
        pubsub
    }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransaction() {
        // get the transaction's pool valid txs
        const validTransactions = this.transactionPool.validTransactions();

        // generate the niner's reward
        validTransactions.push(
            Transaction.rewardTransaction({
                minerWallet: this.wallet
            })
        );

        // add a block consisting of these txs to the blockchain
        this.blockchain.addBlock({
            data: validTransactions
        });

        // broadcast the update bc
        this.pubsub.broadcastChain();

        // clear the pool
        this.transactionPool.clear();
    }
}


module.exports = TransactionMiner;