import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleAndIsActiveToUsers1778950000000 implements MigrationInterface {
    name = 'AddRoleAndIsActiveToUsers1778950000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM ('user', 'admin')`);

        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "role"      "users_role_enum" NOT NULL DEFAULT 'user',
            ADD COLUMN "is_active" boolean           NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role", DROP COLUMN "is_active"`);
        await queryRunner.query(`DROP TYPE "users_role_enum"`);
    }
}
