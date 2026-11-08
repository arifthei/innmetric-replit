# Shared planning and delivery

Status: founder confirmed “Agent builds, lead reviews” on 2026-11-08. No implementation is authorized yet. Detailed review arrangements below guide that split; no independent confirmation from the lead has been received.

## Ownership

| Area | Accountable owner | Other participant |
| --- | --- | --- |
| Product scope, programme policies, demo claims | Founder | Lead advises on feasibility |
| Architecture, data model, API, security, ledger | Software lead | Founder accepts product consequences |
| Bounded implementation and test evidence | Agent | Lead reviews technical changes |
| Business acceptance | Founder | Lead presents verified results and limits |
| Release readiness | Lead | Founder confirms publication |

These are team responsibilities, not the simulated in-app approval roles.

## Working separately in one project

Invite the software lead as a collaborator using Replit's invite flow. Both people should use their own accounts; do not share passwords or credentials.

Use one shared task board. Keep product-policy discussion and technical implementation in separate named conversations, but write approved decisions here so neither conversation is the only record.

Separate conversations alone are not an isolation boundary for direct edits in the main project. For overlapping implementation work, use isolated task environments and review before applying changes. Otherwise use one writer per affected module at a time.

Before work starts, record task owner, acceptance criteria, affected modules, dependencies and reviewer in the task. The lead coordinates shared schema/API changes; dependent screens start only after the contract is agreed. Do not run competing agents against the same shared files.

## Practical parallel split

- Founder: resolve pending policy questions, refine the three-minute demo narrative and review visible acceptance criteria.
- Lead: review state transitions, financial invariants, permissions and API contracts.
- Once implementation is approved: Agent implements a bounded milestone while the founder reviews demo content and the lead reviews technical decisions. The lead supplies review findings rather than running a competing implementation against the same files.
- Keep discovery, approvals and ledger milestones sequential where they share records. Do not split tasks simply to appear parallel.

## Change and review loop

1. Propose a change with its reason, affected requirement and test consequence.
2. Founder confirms business decisions; lead confirms technical approach. Record the outcome in the decision log and update the relevant SSOT document without erasing source provenance.
3. Implement only the assigned scope. Report blockers rather than inventing policy.
4. Lead reviews changes and meaningful test results before integration. After integration, check the combined journey.
5. Founder accepts the user-visible result. Publication is a separate explicit decision.

Handoff template: owner; completed behavior; tests actually run and results; unresolved issues; changed contract; next action; reviewer.

## Two accounts, two laptops, two-hour demo

1. Founder opens this project's Invite control and invites the lead's account by email or sends a private join link.
2. Lead signs into their own Replit account and accepts/opens the invitation to this same project. Do not fork or create a duplicate project for review.
3. Collaborators can access project files, project chat history/memories and the shared task board, and can start their own Agent threads. This grants project collaboration access, not access to the founder's unrelated projects.
4. Founder owns this product/presentation conversation. Lead uses a separate review conversation and sends findings rather than editing the active implementation.
5. Start the fallback task with a task agent. It runs in isolation; its changes are not in the main project until reviewed and applied. Lead checks the Ready task preview and approves integration only after reviewing the demo.

Suggested timeboxes, not a delivery guarantee:

| Time from kickoff | Founder | Software lead | Fallback task agent |
| --- | --- | --- | --- |
| 0–10 minutes | Invite lead, approve fallback, freeze scope | Accept invite, read confirmed decisions | Start independent prototype |
| 10–60 minutes | Prepare three-minute narration | Review rules and inspect available progress | Build complete clickable story |
| 60–90 minutes | Rehearse with available preview | Review balances, denied actions, all confirmations | Fix only presentation blockers |
| 90–110 minutes | Freeze story and prepare backup recording | Review/apply task changes; check demo on both laptops | Finish essential fixes and handoff |
| 110–120 minutes | Rehearse final pitch | Keep known-working preview open | No new features |

If a full build is also explicitly started, keep it separate from the fallback and do not wait on it. One person—the lead—coordinates application of changes. Do not change dependencies, shared API or schema from the fallback task.

## Platform references

- https://docs.replit.com/build/invite-teammates
- https://docs.replit.com/core-concepts/agent/task-system
- https://docs.replit.com/learn/build-in-parallel

Collaboration and task isolation are supported platform workflows; confirm account access and available controls in the actual project. No account entitlement or billing allowance has been verified.
