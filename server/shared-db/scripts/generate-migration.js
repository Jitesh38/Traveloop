const { execSync } = require('child_process');

const migrationName = process.argv[2];
if (!migrationName) {
    console.error('Usage: npm run migration:generate-dynamic <MigrationName>');
    process.exit(1);
}

console.log(`Generating migration: ${migrationName}...`);
execSync('npm run build', { stdio: 'inherit' });
execSync(
    `npx typeorm-ts-node-commonjs migration:generate shared-db/migrations/${migrationName} -d shared-db/migration.config.ts`,
    { stdio: 'inherit' },
);
console.log(` Migration generated: shared-db/migrations/*-${migrationName}.ts`);
