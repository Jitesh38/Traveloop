const { execSync } = require('child_process');
const path = require('path');

const migrationName = process.argv[2];
if (!migrationName) {
    console.error(' Usage: npm run migration:create:dynamic <MigrationName>');
    console.error('   Example: npm run migration:create:dynamic AddUserAge');
    process.exit(1);
}

console.log(`🆕 Creating blank migration: ${migrationName}...`);

try {
    execSync(`typeorm-ts-node-commonjs migration:create ../shared-db/migrations/${migrationName}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
    });
    console.log(` Blank migration created: shared-db/migrations/*-${migrationName}.ts`);
} catch (error) {
    console.error(' Migration creation failed:', error.message);
    process.exit(1);
}
