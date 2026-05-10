import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST_WRITE,
    port: +(process.env.DB_PORT_WRITE || 5432),
    username: process.env.DB_USERNAME_WRITE,
    password: process.env.DB_PASSWORD_WRITE,
    database: process.env.DB_DATABASE_WRITE,
    entities: ['src/**/**/*.entity{.ts,.js}'],
    migrations: ['shared-db/migrations/*{.js,.ts}'],
    synchronize: false,
    // ssl: {
    //     rejectUnauthorized: false,
    // },
});
