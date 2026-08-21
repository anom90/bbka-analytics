import { NextRequest, NextResponse } from 'next/server';
import {
  executeRMultilevel,
  executeRTTest,
  executeRAnova,
  executeRAncova,
  executeRManova,
  executeRRegression,
  executeRSEM
} from '@/lib/r-bridge/r-stats';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data, config } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Dataset tidak boleh kosong.' },
        { status: 400 }
      );
    }

    let result: any;

    switch (type) {
      case 'multilevel':
        result = await executeRMultilevel(data, config);
        break;
      case 'ttest':
        result = await executeRTTest(data, config);
        break;
      case 'anova':
        result = await executeRAnova(data, config);
        break;
      case 'ancova':
        result = await executeRAncova(data, config);
        break;
      case 'manova':
        result = await executeRManova(data, config);
        break;
      case 'regression':
        result = await executeRRegression(data, config);
        break;
      case 'sem':
        result = await executeRSEM(data, config);
        break;
      default:
        return NextResponse.json(
          { error: `Tipe analisis '${type}' tidak dikenali.` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result, engine: 'R (Native Engine 4.6.1)' });
  } catch (error: any) {
    console.error('API Stats Analyze Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses di R Engine.' },
      { status: 500 }
    );
  }
}
