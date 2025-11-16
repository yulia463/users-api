import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1630000000000 implements MigrationInterface {
    name = 'CreateUsers1630000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "full_name" character varying NOT NULL,
        "birth_date" date,
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'user',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email");`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_users_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
