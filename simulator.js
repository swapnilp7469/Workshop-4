const LogEntry = require("./logEntry");

class Simulator {
  constructor(cluster, network) { this.cluster = cluster; this.network = network; this.electionCount = 0; this.audit = []; }
  record(event, details = {}) { const row = { event, ...details }; this.audit.push(row); console.log(`AUDIT ${JSON.stringify(row)}`); }
  electLeader(node) {
    if (!node || !node.online) { console.log("ELECTION ABORTED: candidate is offline"); return false; }
    if (!this.cluster.hasMajority()) { console.log("ELECTION ABORTED: no majority available"); this.record("election_blocked_no_majority"); return false; }
    for (const oldLeader of this.cluster.leaders()) if (oldLeader !== node) oldLeader.becomeFollower(oldLeader.currentTerm);
    node.becomeCandidate();
    this.electionCount++;
    let votes = 1;
    for (const peer of this.cluster.nodes) {
      if (peer.id === node.id || !peer.online) continue;
      const delivered = this.network.send(`${node.id} -> ${peer.id} REQUESTVOTE term=${node.currentTerm}`);
      if (delivered && peer.currentTerm <= node.currentTerm) { votes++; peer.currentTerm = node.currentTerm; }
    }
    console.log(`Votes = ${votes}/${this.cluster.nodes.length}; majority = ${this.cluster.majority()}`);
    this.record("election", { candidate: node.id, term: node.currentTerm, votes, majority: this.cluster.majority() });
    if (votes >= this.cluster.majority()) { node.becomeLeader(); this.record("leader_elected", { leader: node.id, term: node.currentTerm }); return true; }
    node.becomeFollower(node.currentTerm);
    console.log("ELECTION FAILED: majority not reached");
    return false;
  }
  heartbeat() {
    const leader = this.cluster.leader();
    if (!leader) { console.log("NO LEADER: heartbeat unavailable"); return 0; }
    if (!this.cluster.hasMajority()) { console.log("NO MAJORITY: leader cannot establish quorum health"); return 0; }
    let acknowledgements = 1;
    for (const peer of this.cluster.nodes) {
      if (peer.id === leader.id || !peer.online) continue;
      if (this.network.send(`${leader.id} -> ${peer.id} AppendEntries(term=${leader.currentTerm}, entries=[])`)) {
        peer.currentTerm = Math.max(peer.currentTerm, leader.currentTerm); peer.lastHeartbeatTerm = leader.currentTerm; acknowledgements++;
      }
    }
    console.log(`Heartbeat acknowledgements: ${acknowledgements}/${this.cluster.nodes.length}`);
    this.record("heartbeat", { leader: leader.id, term: leader.currentTerm, acknowledgements });
    return acknowledgements;
  }
  replicate(command) {
    const leader = this.cluster.leader();
    if (!leader) { console.log("NO LEADER: request rejected"); this.record("replication_rejected_no_leader", { command }); return false; }
    if (!this.cluster.hasMajority()) { console.log("NO MAJORITY: request not committed"); this.record("replication_rejected_no_majority", { command }); return false; }
    const entry = new LogEntry(leader.log.length + 1, leader.currentTerm, command);
    leader.log.push(entry);
    console.log(`Leader created entry ${entry.index}: ${command}`);
    let acknowledgements = 1;
    for (const peer of this.cluster.nodes) {
      if (peer.id === leader.id || !peer.online) continue;
      if (this.network.send(`${leader.id} -> ${peer.id} AppendEntries(index=${entry.index}, term=${entry.term}, command=${command})`)) {
        peer.log.push(new LogEntry(entry.index, entry.term, entry.command)); acknowledgements++;
      }
    }
    this.record("replication", { index: entry.index, term: entry.term, command, acknowledgements, majority: this.cluster.majority() });
    if (acknowledgements >= this.cluster.majority()) {
      for (const node of this.cluster.onlineNodes()) node.commitIndex = Math.max(node.commitIndex, entry.index);
      console.log(`ENTRY COMMITTED (acks ${acknowledgements}; majority ${this.cluster.majority()})`);
      this.record("entry_committed", { index: entry.index, command });
      return true;
    }
    console.log("ENTRY NOT COMMITTED: majority acknowledgements not reached");
    return false;
  }
}
module.exports = Simulator;
