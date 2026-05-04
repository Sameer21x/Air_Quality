import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PowerBiService {
  private readonly logger = new Logger(PowerBiService.name);
  private readonly pushUrl: string;

  constructor(private config: ConfigService) {
    this.pushUrl = this.config.get<string>('POWERBI_PUSH_URL') ?? '';
    if (this.pushUrl) this.logger.log('Power BI streaming push enabled');
    else this.logger.warn('POWERBI_PUSH_URL not set — Power BI push disabled');
  }

  async push(row: any, category: string, color: string): Promise<void> {
    if (!this.pushUrl) return;

    const payload = JSON.stringify([{
      timestamp:   row.ts ?? new Date().toISOString(),
      pm25:        row.pm25,
      pm10:        row.pm10,
      aqi_pm25:    row.aqi_pm25,
      aqi_pm10:    row.aqi_pm10,
      aqi_overall: row.aqi_overall,
      category,
      color,
      sensor_id:   row.sensor_id,
      location:    row.location,
    }]);

    try {
      const res = await fetch(this.pushUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (!res.ok) this.logger.warn(`Power BI push failed [${res.status}]`);
      else this.logger.debug(`Power BI push OK | AQI=${row.aqi_overall}`);
    } catch (err) {
      this.logger.warn(`Power BI push error: ${err.message}`);
    }
  }
}