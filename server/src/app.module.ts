import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    /**
     * ServeStaticModule — serves /public as static files.
     * public/uploads/uuid.jpg → accessible at /uploads/uuid.jpg
     *
     * Production: replace with a CDN pointing at S3/R2 and remove this.
     */
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
      serveStaticOptions: { index: false },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST_WRITE'),
        port: +configService.get('DB_PORT_WRITE'),
        username: configService.get('DB_USERNAME_WRITE'),
        password: configService.get('DB_PASSWORD_WRITE'),
        database: configService.get('DB_DATABASE_WRITE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
