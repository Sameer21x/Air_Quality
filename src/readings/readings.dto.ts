import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsPositive, IsISO8601, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// ── POST /api/readings/ingest ─────────────────────────────────────────────────
export class IngestDto {
  @ApiProperty({ description: 'PM2.5 concentration μg/m³', example: 22.5 })
  @IsNumber()
  @IsPositive()
  pm25: number;

  @ApiProperty({ description: 'PM10 concentration μg/m³', example: 41.0 })
  @IsNumber()
  @IsPositive()
  pm10: number;

  @ApiPropertyOptional({ description: 'Sensor identifier', example: 'sensor_01' })
  @IsOptional()
  @IsString()
  sensor_id?: string;

  @ApiPropertyOptional({ description: 'Location label', example: 'lab' })
  @IsOptional()
  @IsString()
  location?: string;
}

// ── GET /api/readings/history query params ────────────────────────────────────
export class HistoryQueryDto {
  @ApiPropertyOptional({ description: 'Number of rows to return', example: 100, default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Filter by sensor_id', example: 'sensor_01' })
  @IsOptional()
  @IsString()
  sensor_id?: string;

  @ApiPropertyOptional({ description: 'Filter by location', example: 'lab' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Start timestamp (ISO 8601)', example: '2025-06-01T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ description: 'End timestamp (ISO 8601)', example: '2025-06-02T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  to?: string;
}