import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPricePerDayToActivities1778750000000 implements MigrationInterface {
    name = 'AddPricePerDayToActivities1778750000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "activities"
            ADD COLUMN "price_per_day" numeric(10,2) NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "activities"
            DROP COLUMN "price_per_day"
        `);
    }
}
