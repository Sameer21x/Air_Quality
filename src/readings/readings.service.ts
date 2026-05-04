import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { AqiService } from './aqi.service';
import { PowerBiService } from './powerbi.service';
import { IngestDto, HistoryQueryDto } from './readings.dto';

@Injectable()
export class ReadingsService {

  constructor(
    private supabase: SupabaseService,
    private aqi:      AqiService,
    private powerbi:  PowerBiService,
    private config:   ConfigService,
  ) {}

  async ingest(dto: IngestDto) {
    const aqi_pm25    = this.aqi.calcPM25(dto.pm25);
    const aqi_pm10    = this.aqi.calcPM10(dto.pm10);
    const aqi_overall = Math.max(aqi_pm25, aqi_pm10);
    const category    = this.aqi.getCategory(aqi_overall);

    const row = await this.supabase.insertReading({
      pm25: dto.pm25,
      pm10: dto.pm10,
      aqi_pm25,
      aqi_pm10,
      aqi_overall,
      sensor_id: dto.sensor_id ?? this.config.get('DEFAULT_SENSOR_ID') ?? 'sensor_01',
      location:  dto.location  ?? this.config.get('DEFAULT_LOCATION')  ?? 'lab',
    });

    // Fire-and-forget — never blocks the HTTP response
    this.powerbi.push(row, category.label, category.color);

    return { ...row, category: category.label, color: category.color };
  }

  async latest() {
    const row = await this.supabase.getLatest();
    if (!row) return null;
    const cat = this.aqi.getCategory(row.aqi_overall ?? 0);
    return { ...row, category: cat.label, color: cat.color };
  }

  async history(q: HistoryQueryDto) {
    return this.supabase.getHistory(q);
  }

  async stats(sensor_id?: string) {
    return this.supabase.getStats(sensor_id);
  }

  async hourly(sensor_id?: string) {
    return this.supabase.getHourlyAverages(sensor_id);
  }

  async health() {
    const db = await this.supabase.ping().catch(() => false);
    return {
      status:       'ok',
      db,
      powerbi_push: !!this.config.get('POWERBI_PUSH_URL'),
      uptime_s:     process.uptime(),
    };
  }
}