import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReadingsModule } from './readings/readings.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    ReadingsModule,
  ],
})
export class AppModule {}