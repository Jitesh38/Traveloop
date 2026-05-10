import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPaidToMyTrips1778900000000 implements MigrationInterface {
    name = 'AddIsPaidToMyTrips1778900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "my_trips"
            ADD COLUMN "is_paid" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "my_trips" DROP COLUMN "is_paid"`);
    }
}
