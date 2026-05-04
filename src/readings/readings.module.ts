import { Module } from '@nestjs/common';
import {
  ReadingsController,
  AnalyticsController,
  HealthController,
} from './readings.controller';
import { ReadingsService } from './readings.service';
import { AqiService }     from './aqi.service';
import { PowerBiService } from './powerbi.service';

@Module({
  controllers: [ReadingsController, AnalyticsController, HealthController],
  providers:   [ReadingsService, AqiService, PowerBiService],
})
export class ReadingsModule {}