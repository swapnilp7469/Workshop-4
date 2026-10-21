const { spawnSync } = require("node:child_process");
const path = require("node:path");
const scenarios = [
  "leader_election.js", "heartbeats.js", "leader_failure.js", "log_replication.js",
  "follower_failure.js", "majority_lost.js", "network_partition.js", "log_recovery.js", "hardening.js"
];
let failures = 0;
for (const scenario of scenarios) {
  const result = spawnSync(process.execPath, [path.join(__dirname, "..", "scenarios", scenario)], { encoding: "utf8" });
  const passed = result.status === 0;
  console.log(`${passed ? "PASS" : "FAIL"} ${scenario}`);
  if (!passed) { failures++; if (result.stdout) process.stdout.write(result.stdout); if (result.stderr) process.stderr.write(result.stderr); }
}
console.log(`\nScenario smoke tests: ${scenarios.length - failures}/${scenarios.length} passed.`);
if (failures) process.exitCode = 1;
