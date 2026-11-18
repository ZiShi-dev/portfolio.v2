/**
 * Audit RLS réel sur la base publiée (pas seulement les fichiers).
 * Usage : npx tsx scripts/db/audit-rls.ts
 */
import pg from "pg";
import { getDatabaseUrl, redactDatabaseUrl } from "./_shared";

const { Client } = pg;

const EXPECTED = [
  "contact_messages",
  "reviews",
  "about_stats",
  "projects",
  "site_social_links",
  "project_inquiries",
  "services",
  "service_case_studies",
  "engagements",
  "faqs",
  "faq_services",
  "admin_push_subscriptions",
  "admin_push_outbox",
] as const;

async function main() {
  const databaseUrl = getDatabaseUrl();
  console.info(`[audit] Connexion ${redactDatabaseUrl(databaseUrl)}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const rls = await client.query<{
      table_name: string;
      rls_enabled: boolean;
      rls_forced: boolean;
    }>(
      `
      SELECT c.relname AS table_name,
             c.relrowsecurity AS rls_enabled,
             c.relforcerowsecurity AS rls_forced
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname = ANY($1::text[])
      ORDER BY c.relname
      `,
      [EXPECTED]
    );

    console.info("\n=== RLS (tables applicatives attendues) ===");
    const found = new Set(rls.rows.map((r) => r.table_name));
    let failures = 0;

    for (const name of EXPECTED) {
      if (!found.has(name)) {
        console.info(`FAIL  ${name.padEnd(28)} TABLE ABSENTE`);
        failures += 1;
        continue;
      }
      const row = rls.rows.find((r) => r.table_name === name)!;
      if (!row.rls_enabled) {
        console.info(`FAIL  ${name.padEnd(28)} RLS désactivé`);
        failures += 1;
      } else {
        console.info(
          `OK    ${name.padEnd(28)} rls=${row.rls_enabled} forced=${row.rls_forced}`
        );
      }
    }

    const allPublic = await client.query<{
      table_name: string;
      rls_enabled: boolean;
    }>(`
      SELECT c.relname AS table_name,
             c.relrowsecurity AS rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname NOT LIKE 'pg_%'
      ORDER BY c.relname
    `);

    console.info("\n=== Toutes les tables public ===");
    for (const row of allPublic.rows) {
      const mark = row.rls_enabled ? "ON " : "OFF";
      if (!row.rls_enabled && row.table_name !== "schema_migrations") {
        failures += 1;
      }
      console.info(`${mark}  ${row.table_name}`);
    }

    const policies = await client.query<{
      schemaname: string;
      tablename: string;
      policyname: string;
      cmd: string;
      roles: string[];
      qual: string | null;
    }>(`
      SELECT schemaname, tablename, policyname, cmd, roles, qual
      FROM pg_policies
      WHERE schemaname IN ('public', 'storage')
      ORDER BY schemaname, tablename, policyname
    `);

    console.info("\n=== Policies (public + storage) ===");
    if (policies.rows.length === 0) {
      console.info("(aucune)");
    }
    for (const p of policies.rows) {
      console.info(
        `${p.schemaname}.${p.tablename} | ${p.policyname} | cmd=${p.cmd} | roles=${JSON.stringify(p.roles)} | using=${p.qual}`
      );
    }

    const grants = await client.query<{
      table_name: string;
      grantee: string;
      privileges: string;
    }>(
      `
      SELECT table_name,
             grantee,
             string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
        AND grantee IN ('anon', 'authenticated', 'service_role', 'PUBLIC')
      GROUP BY table_name, grantee
      ORDER BY table_name, grantee
      `,
      [EXPECTED]
    );

    console.info("\n=== Grants (anon / authenticated / service_role / PUBLIC) ===");
    const byTable = new Map<string, typeof grants.rows>();
    for (const g of grants.rows) {
      const list = byTable.get(g.table_name) ?? [];
      list.push(g);
      byTable.set(g.table_name, list);
    }

    for (const name of EXPECTED) {
      const rows = byTable.get(name) ?? [];
      if (rows.length === 0) {
        console.info(`${name.padEnd(28)} (aucun grant listé)`);
        continue;
      }
      for (const g of rows) {
        const dangerous =
          (g.grantee === "anon" ||
            g.grantee === "authenticated" ||
            g.grantee === "PUBLIC") &&
          g.privileges.length > 0;
        if (dangerous) {
          failures += 1;
          console.info(
            `FAIL  ${name.padEnd(28)} ${g.grantee.padEnd(16)} ${g.privileges}`
          );
        } else {
          console.info(
            `OK    ${name.padEnd(28)} ${g.grantee.padEnd(16)} ${g.privileges}`
          );
        }
      }
    }

    const storagePol = await client.query<{
      policyname: string;
      cmd: string;
      roles: string[];
      qual: string | null;
    }>(`
      SELECT policyname, cmd, roles, qual
      FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
      ORDER BY policyname
    `);

    console.info("\n=== storage.objects policies ===");
    const expectedStorage = storagePol.rows.find(
      (p) => p.policyname === "portfolio_projects_public_read"
    );
    if (!expectedStorage) {
      failures += 1;
      console.info("FAIL  portfolio_projects_public_read absente");
    } else {
      console.info(
        `OK    ${expectedStorage.policyname} | ${expectedStorage.cmd} | using=${expectedStorage.qual}`
      );
    }
    for (const p of storagePol.rows) {
      if (p.policyname === "portfolio_projects_public_read") continue;
      console.info(
        `INFO  ${p.policyname} | ${p.cmd} | roles=${JSON.stringify(p.roles)} | using=${p.qual}`
      );
    }

    const bucket = await client.query<{
      id: string;
      name: string;
      public: boolean;
    }>(`
      SELECT id, name, public
      FROM storage.buckets
      WHERE id = 'portfolio-projects'
    `);
    console.info("\n=== bucket portfolio-projects ===");
    if (!bucket.rows[0]) {
      failures += 1;
      console.info("FAIL  bucket absent");
    } else {
      console.info(
        `OK    id=${bucket.rows[0].id} public=${bucket.rows[0].public}`
      );
    }

    console.info("\n=== Verdict ===");
    if (failures > 0) {
      console.info(`[audit] ${failures} problème(s) détecté(s).`);
      process.exitCode = 1;
    } else {
      console.info("[audit] RLS OK sur la base publiée.");
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
