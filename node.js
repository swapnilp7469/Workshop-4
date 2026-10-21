class Node {
  constructor(id) {
    this.id = id;
    this.role = "FOLLOWER";
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];
    this.online = true;
    this.commitIndex = 0;
    this.lastHeartbeatTerm = null;
  }
  becomeFollower(term = this.currentTerm) {
    this.role = "FOLLOWER";
    this.currentTerm = Math.max(this.currentTerm, term);
    this.votedFor = null;
    console.log(`${this.id} -> FOLLOWER (TERM ${this.currentTerm})`);
  }
  becomeCandidate() {
    this.role = "CANDIDATE";
    this.currentTerm += 1;
    this.votedFor = this.id;
    console.log(`${this.id} -> CANDIDATE (TERM ${this.currentTerm})`);
  }
  becomeLeader() {
    if (!this.online) throw new Error(`Offline node ${this.id} cannot become leader`);
    this.role = "LEADER";
    console.log(`${this.id} -> LEADER (TERM ${this.currentTerm})`);
  }
  fail() { this.online = false; this.role = "FOLLOWER"; console.log(`${this.id} OFFLINE`); }
  recover() { this.online = true; console.log(`${this.id} ONLINE`); }
}
module.exports = Node;
