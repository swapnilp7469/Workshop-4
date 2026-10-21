const Node = require("../node");
const LogEntry = require("../logEntry");
const leader = new Node("Leader"); leader.role = "LEADER"; leader.currentTerm = 2;
for (const [i, command] of ["A", "B", "C", "D", "E"].entries()) leader.log.push(new LogEntry(i + 1, 2, command));
const follower = new Node("Follower"); follower.log.push(new LogEntry(1, 2, "A"), new LogEntry(2, 2, "B"), new LogEntry(3, 2, "C"));
console.log("\nSCENARIO: LOG RECOVERY");
console.log("Leader log:", leader.log.map(e => `${e.index}:${e.command}`).join(", "));
console.log("Follower before:", follower.log.map(e => `${e.index}:${e.command}`).join(", "));
for (let i = follower.log.length; i < leader.log.length; i++) { const e = leader.log[i]; follower.log.push(new LogEntry(e.index, e.term, e.command)); console.log(`Recovered entry ${e.index}: ${e.command}`); }
const identical = JSON.stringify(leader.log) === JSON.stringify(follower.log);
console.log("Follower after:", follower.log.map(e => `${e.index}:${e.command}`).join(", "));
console.log("Logs identical:", identical);
if (!identical) process.exitCode = 1;
