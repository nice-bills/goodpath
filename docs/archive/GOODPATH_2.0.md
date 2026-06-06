# GoodPath 2.0 — build without contract deploy

**Hackathon:** [GoodBuilders 7-Day](https://gooddollar.notion.site/GoodBuilders-7-Day-Buildathon-366f258232f08174998ed65a323e004d)

**Narrative:** Solo-first **weekly G$ run** on Celo — move G$, earn Celoscan proofs, climb divisions. Contract is **built and tested**, deploy when you want the extra judge link.

---

## Contract (in repo, not deployed)

| Item | Location |
|------|----------|
| `GoodPathReceipt` UUPS | `packages/contracts/src/GoodPathReceipt.sol` |
| Tests | `pnpm contracts:test` |
| Deploy guide | `packages/contracts/README.md` |

App works fully **without** `GOODPATH_RECEIPT_*` env — quest proofs stay on GoodDollar / Superfluid / savings txs.

---

## Shipped in 2.0 (product)

| Feature | Notes |
|---------|--------|
| Run-first home | `RunHeroCard` — division, G$ moved, next move |
| Solo challenge | `RunChallengeCard` — beat seeded division median |
| Referrals | `?ref=0x…` → session → API `POST …/referral`; +15 pts/referrer when friend completes path |
| Receipt scorecard | G$ moved, division, proof count, fastest path |
| GoodWallet hint | Verify quest — connect/link, don’t paste two addresses |
| League API | `gMovedWei`, divisions, `nextMove` |

---

## Still to build

- [ ] Production deploy web + API + E2E video (`docs/E2E_PRODUCTION.md`)
- [ ] Optional: deploy `GoodPathReceipt` + relayer env
- [ ] Optional: squads, `@goodsdks/engagement-sdk` referral URLs
- [ ] Judge demo script emphasizing **stream or save** + support pool

Spec: `docs/artifacts/goodbuilders-winning-direction.html`
