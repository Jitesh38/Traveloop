import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionsTable1778400000000 implements MigrationInterface {
    name = 'CreateRegionsTable1778400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "regions" (
                "id"          SERIAL NOT NULL,
                "name"        character varying NOT NULL,
                "description" text,
                "images"      text[] NOT NULL DEFAULT '{}',
                "rating"      numeric(3,2) NOT NULL DEFAULT '0',
                "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_regions" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "regions"`);
    }
}
