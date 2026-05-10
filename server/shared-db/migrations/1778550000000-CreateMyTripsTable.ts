import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMyTripsTable1778550000000 implements MigrationInterface {
    name = 'CreateMyTripsTable1778550000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "my_trips" (
                "id"         SERIAL NOT NULL,
                "user_id"    uuid NOT NULL,
                "name"       character varying,
                "region_id"  integer NOT NULL,
                "start_date" date NOT NULL,
                "end_date"   date NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_my_trips" PRIMARY KEY ("id"),
                CONSTRAINT "FK_my_trips_user"
                    FOREIGN KEY ("user_id")
                    REFERENCES "users"("id")
                    ON DELETE CASCADE,
                CONSTRAINT "FK_my_trips_region"
                    FOREIGN KEY ("region_id")
                    REFERENCES "regions"("id")
                    ON DELETE RESTRICT
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "my_trips"`);
    }
}
