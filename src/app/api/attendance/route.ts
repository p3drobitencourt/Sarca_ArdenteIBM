// src/app/api/attendance/route.ts
import { NextResponse } from 'next/server';
import { getCloudantClient } from '@/lib/ibm/cloudant';

const DB_NAME = 'sarca_ardente';

export async function POST(request: Request) {
  try {
    const { memberId, memberName } = await request.json();
    const client = getCloudantClient();

    const attendanceDoc = {
      type: 'attendance',
      memberId,
      memberName,
      date: new Date().toISOString().split('T')[0], // Salva apenas a data (YYYY-MM-DD)
      timestamp: new Date().toISOString(),
    };

    const response = await client.postDocument({
      db: DB_NAME,
      document: attendanceDoc
    });

    return NextResponse.json(response.result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}