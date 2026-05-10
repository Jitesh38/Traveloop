import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivitiesTable1778450000000 implements MigrationInterface {
    name = 'CreateActivitiesTable1778450000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "activities_type_enum" AS ENUM (
                'adventure',
                'cultural',
                'relaxation',
                'sports',
                'food',
                'sightseeing',
                'other'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "activities" (
                "id"          SERIAL NOT NULL,
                "name"        character varying NOT NULL,
                "tag_line"    text,
                "description" text,
                "region_id"   integer NOT NULL,
                "images"      text[] NOT NULL DEFAULT '{}',
                "type"        "activities_type_enum" NOT NULL DEFAULT 'other',
                "rating"      numeric(3,2) NOT NULL DEFAULT '0',
                "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_activities" PRIMARY KEY ("id"),
                CONSTRAINT "FK_activities_region"
                    FOREIGN KEY ("region_id")
                    REFERENCES "regions"("id")
                    ON DELETE RESTRICT
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TYPE "activities_type_enum"`);
    }
}
