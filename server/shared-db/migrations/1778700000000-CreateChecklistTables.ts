import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChecklistTables1778700000000 implements MigrationInterface {
    name = 'CreateChecklistTables1778700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. One checklist per trip
        await queryRunner.query(`
            CREATE TABLE "trip_checklists" (
                "id"         SERIAL NOT NULL,
                "my_trip_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_trip_checklists" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_trip_checklists_my_trip_id" UNIQUE ("my_trip_id"),
                CONSTRAINT "FK_trip_checklists_my_trip"
                    FOREIGN KEY ("my_trip_id")
                    REFERENCES "my_trips"("id")
                    ON DELETE CASCADE
            )
        `);

        // 2. Sections belong to a checklist
        await queryRunner.query(`
            CREATE TABLE "trip_checklist_sections" (
                "id"           SERIAL NOT NULL,
                "checklist_id" integer NOT NULL,
                "title"        character varying NOT NULL,
                "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_trip_checklist_sections" PRIMARY KEY ("id"),
                CONSTRAINT "FK_trip_checklist_sections_checklist"
                    FOREIGN KEY ("checklist_id")
                    REFERENCES "trip_checklists"("id")
                    ON DELETE CASCADE
            )
        `);

        // 3. Items belong to a section
        await queryRunner.query(`
            CREATE TABLE "trip_checklist_items" (
                "id"           SERIAL NOT NULL,
                "section_id"   integer NOT NULL,
                "title"        character varying NOT NULL,
                "is_completed" boolean NOT NULL DEFAULT false,
                "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_trip_checklist_items" PRIMARY KEY ("id"),
                CONSTRAINT "FK_trip_checklist_items_section"
                    FOREIGN KEY ("section_id")
                    REFERENCES "trip_checklist_sections"("id")
                    ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "trip_checklist_items"`);
        await queryRunner.query(`DROP TABLE "trip_checklist_sections"`);
        await queryRunner.query(`DROP TABLE "trip_checklists"`);
    }
}
