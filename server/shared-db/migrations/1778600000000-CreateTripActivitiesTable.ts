import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTripActivitiesTable1778600000000 implements MigrationInterface {
    name = 'CreateTripActivitiesTable1778600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "trip_activities" (
                "id"              SERIAL NOT NULL,
                "activity_id"     integer NOT NULL,
                "my_trip_id"      integer,
                "start_date_time" TIMESTAMP WITH TIME ZONE,
                "end_date_time"   TIMESTAMP WITH TIME ZONE,
                "total_hours"     numeric(6,2),
                "budget"          numeric(10,2),
                "description"     text,
                "created_at"      TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at"      TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_trip_activities" PRIMARY KEY ("id"),
                CONSTRAINT "FK_trip_activities_activity"
                    FOREIGN KEY ("activity_id")
                    REFERENCES "activities"("id")
                    ON DELETE RESTRICT,
                CONSTRAINT "FK_trip_activities_my_trip"
                    FOREIGN KEY ("my_trip_id")
                    REFERENCES "my_trips"("id")
                    ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "trip_activities"`);
    }
}
