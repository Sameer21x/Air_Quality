import {
  Controller, Post, Get, Body, Query,
  HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { ReadingsService } from './readings.service';
import { IngestDto, HistoryQueryDto } from './readings.dto';

@ApiTags('Readings')
@Controller('readings')
export class ReadingsController {

  constructor(private readonly svc: ReadingsService) {}

  // ── POST /api/readings/ingest ───────────────────────────────────────────
  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ingest a sensor reading',
    description:
      'Called by MATLAB every 2 seconds. AQI is auto-calculated (EPA). ' +
      'Row is saved to Supabase and simultaneously pushed to Power BI streaming dataset.',
  })
  @ApiBody({ type: IngestDto })
  @ApiResponse({ status: 201, description: 'Reading stored and pushed to Power BI' })
  @ApiResponse({ status: 422, description: 'Validation error — check pm25/pm10 values' })
  async ingest(@Body() dto: IngestDto) {
    const result = await this.svc.ingest(dto);
    return { success: true, data: result };
  }

  // ── GET /api/readings/latest ────────────────────────────────────────────
  @Get('latest')
  @ApiOperation({
    summary: 'Most recent reading',
    description:
      'Returns the single latest row with AQI and category. ' +
      'Use this as a Power BI Web connector source for KPI card tiles.',
  })
  @ApiResponse({ status: 200, description: 'Latest reading' })
  @ApiResponse({ status: 404, description: 'No data recorded yet' })
  async latest() {
    const data = await this.svc.latest();
    if (!data) throw new NotFoundException('No readings yet');
    return { success: true, data };
  }

  // ── GET /api/readings/history ───────────────────────────────────────────
  @Get('history')
  @ApiOperation({
    summary: 'Historical readings (newest first)',
    description:
      'Use as a Power BI Web connector source for line/area charts. ' +
      'Example: `GET /api/readings/history?limit=500`',
  })
  @ApiResponse({ status: 200, description: 'Array of readings' })
  async history(@Query() q: HistoryQueryDto) {
    const data = await this.svc.history(q);
    return { success: true, count: data.length, data };
  }
}

// ── Analytics controller ────────────────────────────────────────────────────
@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {

  constructor(private readonly svc: ReadingsService) {}

  // ── GET /api/analytics/stats ────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({
    summary: '24-hour aggregate statistics',
    description:
      'Returns avg / min / max for PM2.5, PM10, AQI over the last 24 hours. ' +
      'Use as Power BI Web connector source for stats table / KPI cards.',
  })
  @ApiQuery({ name: 'sensor_id', required: false, description: 'Filter by sensor' })
  @ApiResponse({ status: 200, description: 'Aggregate stats object' })
  async stats(@Query('sensor_id') sensor_id?: string) {
    const data = await this.svc.stats(sensor_id);
    return { success: true, data };
  }

  // ── GET /api/analytics/hourly ───────────────────────────────────────────
  @Get('hourly')
  @ApiOperation({
    summary: 'Hourly averages (last 24 h)',
    description:
      'One data point per hour — ideal for Power BI line/area trend charts.',
  })
  @ApiQuery({ name: 'sensor_id', required: false })
  @ApiResponse({ status: 200, description: 'Array of hourly buckets' })
  async hourly(@Query('sensor_id') sensor_id?: string) {
    const data = await this.svc.hourly(sensor_id);
    return { success: true, data };
  }
}

// ── System controller ───────────────────────────────────────────────────────
@ApiTags('System')
@Controller('health')
export class HealthController {

  constructor(private readonly svc: ReadingsService) {}

  @Get()
  @ApiOperation({ summary: 'Health check — server, database, Power BI status' })
  @ApiResponse({ status: 200, description: 'All systems status' })
  async health() {
    return this.svc.health();
  }
}