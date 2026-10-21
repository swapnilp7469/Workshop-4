class Network {
  constructor() { this.partitioned = false; this.droppedMessages = 0; this.deliveredMessages = 0; }
  send(message) {
    if (this.partitioned) { this.droppedMessages++; console.log(`NETWORK DROPPED: ${message}`); return false; }
    this.deliveredMessages++; console.log(`NETWORK DELIVERED: ${message}`); return true;
  }
  partition() { this.partitioned = true; console.log("NETWORK PARTITION ACTIVE"); }
  repair() { this.partitioned = false; console.log("NETWORK PARTITION REPAIRED"); }
}
module.exports = Network;
