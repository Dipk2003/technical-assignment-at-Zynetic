import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsModule } from './analytics/analytics.module';
import { DbModule } from './db/db.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { LinksModule } from './links/links.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    IngestionModule,
    AnalyticsModule,
    LinksModule,
    StatusModule,
  ],
})
export class AppModule {}
