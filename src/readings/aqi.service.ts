import { Injectable } from '@nestjs/common';

const PM25_BP = [
  { cLo: 0.0,   cHi: 12.0,  iLo: 0,   iHi: 50  },
  { cLo: 12.1,  cHi: 35.4,  iLo: 51,  iHi: 100 },
  { cLo: 35.5,  cHi: 55.4,  iLo: 101, iHi: 150 },
  { cLo: 55.5,  cHi: 150.4, iLo: 151, iHi: 200 },
  { cLo: 150.5, cHi: 250.4, iLo: 201, iHi: 300 },
  { cLo: 250.5, cHi: 500.4, iLo: 301, iHi: 500 },
];

const PM10_BP = [
  { cLo: 0,   cHi: 54,  iLo: 0,   iHi: 50  },
  { cLo: 55,  cHi: 154, iLo: 51,  iHi: 100 },
  { cLo: 155, cHi: 254, iLo: 101, iHi: 150 },
  { cLo: 255, cHi: 354, iLo: 151, iHi: 200 },
  { cLo: 355, cHi: 424, iLo: 201, iHi: 300 },
  { cLo: 425, cHi: 604, iLo: 301, iHi: 500 },
];

const CATEGORIES = [
  { max: 50,  label: 'Good',                           color: '#00e676', risk: 'Low'       },
  { max: 100, label: 'Moderate',                       color: '#ffee58', risk: 'Moderate'  },
  { max: 150, label: 'Unhealthy for Sensitive Groups', color: '#ffa726', risk: 'Elevated'  },
  { max: 200, label: 'Unhealthy',                      color: '#ef5350', risk: 'High'      },
  { max: 300, label: 'Very Unhealthy',                 color: '#ab47bc', risk: 'Very High' },
  { max: 500, label: 'Hazardous',                      color: '#b71c1c', risk: 'Extreme'   },
];

@Injectable()
export class AqiService {
  private calc(c: number, bp: typeof PM25_BP): number {
    for (const { cLo, cHi, iLo, iHi } of bp) {
      if (c >= cLo && c <= cHi)
        return Math.round(((iHi - iLo) / (cHi - cLo)) * (c - cLo) + iLo);
    }
    return c > 500 ? 500 : 0;
  }

  calcPM25(value: number)  { return this.calc(value, PM25_BP); }
  calcPM10(value: number)  { return this.calc(value, PM10_BP); }

  getCategory(aqi: number) {
    return CATEGORIES.find(c => aqi <= c.max) ?? CATEGORIES[CATEGORIES.length - 1];
  }
}