import { NextResponse } from 'next/server';
import { getCloudantClient } from '@/lib/ibm/cloudant';

const DB_NAME = 'sarca_ardente';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Pega a data da URL
    const client = getCloudantClient();
    
    const response = await client.postAllDocs({ db: DB_NAME, includeDocs: true });
    
    let records = response.result.rows
      ?.map(row => row.doc)
      .filter((doc: any) => doc.type === 'attendance') || [];

    // Se uma data for enviada, filtra os registros daquele dia
    if (date) {
      records = records.filter((r: any) => r.date === date);
    }
      
    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { memberId, memberName, date, status } = await request.json();
    const client = getCloudantClient();

    const attendanceDoc = {
      type: 'attendance',
      memberId,
      memberName,
      date, // Agora usamos a data escolhida no calendário
      status, // 'presente', 'falta' ou 'justificada'
      timestamp: new Date().toISOString(),
    };

    const response = await client.postDocument({ db: DB_NAME, document: attendanceDoc });
    return NextResponse.json(response.result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}