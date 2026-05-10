import { join } from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UploadModule } from './modules/upload/upload.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ActivityModule } from './activity/activity.module';
import { ReviewModule } from './review/review.module';
import { ChecklistModule } from './checklist/checklist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    /**
     * JwtModule registered globally so JwtService is available everywhere —
     * including JwtAuthGuard and UsersService — without importing it per-module.
     */
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') as any,
        },
      }),
      inject: [ConfigService],
    }),

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
    ActivityModule,
    ReviewModule,
    ChecklistModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /**
     * APP_GUARD applies JwtAuthGuard to every route in the application.
     * Use @Public() on any route that should skip token validation.
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
