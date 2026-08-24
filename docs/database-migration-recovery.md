# Production migration and recovery evidence

## Observed production history

On 23 August 2026, the Supabase migration API reported these applied versions for project `vbbhlpgsbfxfeqrxhily`:

```text
20260723072925 activation_codes_init
20260723073135 redeem_code_rpc
20260723075840 peek_unused_code_rpc
20260723081117 app_users_init
20260723083314 app_users_premium_recovery
20260723085015 activation_log_init
20260822080736 el_comptabli_security_foundation
20260822080843 el_comptabli_legacy_cleanup
20260823061317 add_secure_scanned_invoice_workflow
20260823063931 invoice_hardening
20260823070125 documents_private_bucket
20260823085224 v1_backend_foundation
20260823085235 v1_accounting_invariants
20260823085245 v1_backend_workflows
20260823085526 v1_rls_and_indexes_hardening
20260823093629 beta_ready_authoritative_state
20260823094133 beta_ready_advisor_hardening
20260823112732 prevent_cross_payment_overallocation
20260823130000 invoice_accounting_posting_pipeline
```

All 19 entries above are the authoritative production record. The repository does not contain the original SQL files for the nine historical entries before the V1 files. Those exact historical files cannot be reconstructed safely from names alone; no fabricated replacements are used. Their resulting legacy schema is captured by `server/lib/schema.sql`, which is now explicitly treated as an empty-database baseline only. The accounting pipeline migration is present in the repository and was applied successfully to production with the version above.

## Replay evidence

`server/lib/migrations.test.js` applies the checked-in empty-database baseline and every repository migration in lexical order in an isolated PGlite database, including `invoice_accounting_posting_pipeline`. It verifies RLS, tenant boundaries, balanced posting, human mapping validation, idempotent confirmation, dashboard totals and VAT lineage. This proves deterministic repository replay from the captured baseline. It does not claim byte-for-byte recovery of the nine unavailable historical migration files or a provider-level Supabase restore.

To close the remaining provider-parity gate, replay the captured baseline plus every checked-in migration in a disposable Supabase branch/project, then compare tables, constraints, policies, functions, views and indexes with production. Do not merge the branch or run destructive reset commands against production.

## Recovery runbook

1. Confirm the Supabase project backup and point-in-time recovery retention in the Supabase dashboard. Retention is provider configuration and is not inferred from application data.
2. For a database restore, create a disposable branch/project, restore the selected backup there, and compare table counts, primary/foreign-key checks, RLS policies and the migration list before considering any production action.
3. The `documents` Storage bucket is private. Verify object keys remain under the organization/user path, then restore a copy into an isolated private bucket and verify object size/hash plus a signed URL. Never make the production bucket public for testing.
4. Run the repository migration and integrity tests against the isolated restore. Production recovery is only complete after those checks pass and the operator records the backup timestamp, restore target and verification output.

No isolated Supabase restore was executed in this run: creating a branch requires an explicit provider cost confirmation, and no backup export credentials were available. The application does not claim restore verification from the local PGlite test.
