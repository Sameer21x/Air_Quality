 import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;
  private readonly TABLE = 'air_quality';

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_KEY');

    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    }

    this.client = createClient(url, key, { auth: { persistSession: false } });
    this.logger.log('Supabase client initialised');
  }

  // ── Insert one sensor reading ───────────────────────────────────────────
  async insertReading(payload: {
    pm25: number; pm10: number;
    aqi_pm25: number; aqi_pm10: number; aqi_overall: number;
    sensor_id: string; location: string;
  }) {
    const { data, error } = await this.client
      .from(this.TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(`Supabase insert: ${error.message}`);
    return data;
  }

  // ── Latest reading ──────────────────────────────────────────────────────
  async getLatest() {
    const { data, error } = await this.client
      .from(this.TABLE)
      .select('*')
      .order('ts', { ascending: false })
      .limit(1)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw new Error(error.message);
    return data;
  }

  // ── History ─────────────────────────────────────────────────────────────
  async getHistory(opts: {
    limit?: number; sensor_id?: string;
    location?: string; from?: string; to?: string;
  }) {
    let q = this.client
      .from(this.TABLE)
      .select('*')
      .order('ts', { ascending: false })
      .limit(Math.min(opts.limit ?? 100, 1000));

    if (opts.sensor_id) q = q.eq('sensor_id', opts.sensor_id);
    if (opts.location)  q = q.eq('location',  opts.location);
    if (opts.from)      q = q.gte('ts', opts.from);
    if (opts.to)        q = q.lte('ts', opts.to);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  // ── 24h stats via RPC ───────────────────────────────────────────────────
  async getStats(sensor_id?: string) {
    const { data, error } = await this.client
      .rpc('air_quality_stats_24h', { p_sensor_id: sensor_id ?? null });
    if (error) throw new Error(error.message);
    return data?.[0] ?? {};
  }

  // ── Hourly averages via RPC ─────────────────────────────────────────────
  async getHourlyAverages(sensor_id?: string) {
    const { data, error } = await this.client
      .rpc('air_quality_hourly', { p_sensor_id: sensor_id ?? null });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  // ── Health ping ─────────────────────────────────────────────────────────
  async ping(): Promise<boolean> {
    const { error } = await this.client.from(this.TABLE).select('id').limit(1);
    return !error;
  }
}