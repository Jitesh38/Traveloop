import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBudgetDescriptionToMyTrips1778850000000 implements MigrationInterface {
    name = 'AddBudgetDescriptionToMyTrips1778850000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "my_trips"
            ADD COLUMN "budget"      numeric(10,2),
            ADD COLUMN "description" text
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "my_trips"
            DROP COLUMN "budget",
            DROP COLUMN "description"
        `);
    }
}
