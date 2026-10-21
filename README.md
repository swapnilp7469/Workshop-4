
## Requirements

- Node.js 18 or newer
- npm (included with Node.js)

No third-party dependencies are required.

## Run it

From this directory:

```sh
npm install
npm start
npm run election
npm run heartbeats
npm run leader-failure
npm run replication
npm run follower-failure
npm run majority-lost
npm run partition
npm run recovery
npm run hardening
npm run all
```

`npm run all` runs the scenario suite and returns a non-zero exit code if a scenario fails.

## Project layout

- `node.js` — node role, term, vote, online status, log and commit index.
- `term.js` — simple logical-term counter supplied in the starter material.
- `logEntry.js` — indexed, term-stamped command entries.
- `cluster.js` — majority calculation, online-node health and leader lookup.
- `network.js` — observable message delivery and a simple global partition switch.
- `simulator.js` — simplified election, heartbeat and replication flows; blocks election/replication progress without a majority and emits audit events.
- `scenarios/` — the workshop's required scenarios.
- `test/run-all.js` — smoke test for each scenario.
- `docs/REFLECTIONS.md` — concise draft notes to support the workshop reflection questions; verify observations against your own run before using them.

## Implemented defensive checks (Part 10)

1. Election-timeout validation rejects non-numeric or too-small values (100 ms is a teaching threshold, not a production recommendation).
2. Leadership-churn monitoring warns after more than five elections.
3. Majority-health checks prevent new simulated proposals from being committed when the cluster cannot form a quorum.
4. Follower-lag monitoring warns when a follower is more than two entries behind.
5. Persistent-state validation warns when a node expected to have prior state appears freshly reset.
6. Audit events record elections, leader changes, heartbeats, replication attempts, blocked operations, and commits.




