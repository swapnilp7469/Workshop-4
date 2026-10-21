const Node = require("../node");
const Cluster = require("../cluster");
const Simulator = require("../simulator");
const Network = require("../network");

function validateElectionTimeout(timeout) {
  if (!Number.isFinite(timeout) || timeout < 100) throw new Error("Unsafe election timeout: expected a number >= 100 ms in this teaching model");
  return true;
}
function detectLeaderChurn(elections, threshold = 5) {
  if (elections > threshold) { console.log(`WARNING: LEADERSHIP CHURN (${elections} elections; threshold ${threshold})`); return true; }
  console.log(`Leadership churn within threshold (${elections}/${threshold})`); return false;
}
function validateMajority(total, online) {
  if (!Number.isInteger(total) || total < 1 || !Number.isInteger(online) || online < 0 || online > total) throw new Error("Invalid cluster health counts");
  return online >= Math.floor(total / 2) + 1;
}
function detectFollowerLag(leaderLogLength, followerLogLength, threshold = 2) {
  const lag = leaderLogLength - followerLogLength;
  if (lag > threshold) console.log(`WARNING: FOLLOWER LAG (${lag} entries behind)`);
  else console.log(`Follower lag acceptable (${Math.max(0, lag)} entries)`);
  return lag > threshold;
}
function validatePersistentState(node, previouslyHadState) {
  const suspicious = previouslyHadState && (node.currentTerm === 0 || (node.votedFor === null && node.log.length === 0));
  if (suspicious) console.log(`WARNING: POSSIBLE STATE LOSS on ${node.id}`);
  else console.log(`Persistent-state check passed for ${node.id}`);
  return !suspicious;
}
console.log("\n====================\nHARDENING RAFT\n====================");
try { validateElectionTimeout(50); } catch (error) { console.log(error.message); }
console.log("Valid timeout accepted:", validateElectionTimeout(150));
detectLeaderChurn(10);
console.log("Majority available (3/5):", validateMajority(5, 3));
console.log("Majority available (2/5):", validateMajority(5, 2));
detectFollowerLag(8, 4);
const recoveredNode = new Node("F");
validatePersistentState(recoveredNode, true);
console.log("\nIntegrated quorum guard demonstration:");
const a = new Node("A"), b = new Node("B"), c = new Node("C");
const cluster = new Cluster([a, b, c]);
const simulator = new Simulator(cluster, new Network());
simulator.electLeader(a);
b.fail(); c.fail();
console.log("Attempting replication without majority:");
const committed = simulator.replicate("must-not-commit-without-majority");
console.log("Commit prevented:", !committed);
console.log("\nDefences demonstrated: timeout validation, churn monitoring, majority health, follower lag, state-loss warning, audit records.");
