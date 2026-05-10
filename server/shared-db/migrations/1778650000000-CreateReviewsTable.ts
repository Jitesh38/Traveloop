import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewsTable1778650000000 implements MigrationInterface {
    name = 'CreateReviewsTable1778650000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "reviews" (
                "id"          SERIAL NOT NULL,
                "user_id"     uuid NOT NULL,
                "region_id"   integer,
                "activity_id" integer,
                "rating"      smallint NOT NULL,
                "experience"  text NOT NULL,
                "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
                CONSTRAINT "FK_reviews_user"
                    FOREIGN KEY ("user_id")
                    REFERENCES "users"("id")
                    ON DELETE CASCADE,
                CONSTRAINT "FK_reviews_region"
                    FOREIGN KEY ("region_id")
                    REFERENCES "regions"("id")
                    ON DELETE CASCADE,
                CONSTRAINT "FK_reviews_activity"
                    FOREIGN KEY ("activity_id")
                    REFERENCES "activities"("id")
                    ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "reviews"`);
    }
}
