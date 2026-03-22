import { NextResponse } from 'next/server';
import { getCloudantClient } from '@/lib/ibm/cloudant';

const DB_NAME = 'sarca_ardente';

async function ensureDbExists(client: any) {
  try {
    await client.putDatabase({ db: DB_NAME });
    console.log(`Banco ${DB_NAME} criado com sucesso!`);
  } catch (error: any) {
    if (error.status !== 412) { // 412 significa que o banco já existe
      throw error;
    }
  }
}

export async function GET() {
  try {
    const client = getCloudantClient();
    
    // Passo extra: Garante que o banco existe
    await ensureDbExists(client);

    const response = await client.postAllDocs({
      db: DB_NAME,
      includeDocs: true
    });

    const members = response.result.rows
      ?.map(row => row.doc)
      .filter((doc: any) => doc.type === 'member') || [];
      
    return NextResponse.json(members);
  } catch (error: any) {
    console.error('Erro no GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getCloudantClient();
    
    await ensureDbExists(client);

    // SEGURANÇA: Removemos qualquer _id ou _rev que possa ter vindo do front
    // Isso garante que o Cloudant gere um ID NOVO e ÚNICO para cada cadastro.
    const { _id, _rev, ...cleanData } = body;

    const memberDoc = {
      ...cleanData,
      type: 'member',
      active: true,
      createdAt: new Date().toISOString()
    };

    const response = await client.postDocument({
      db: DB_NAME,
      document: memberDoc
    });

    return NextResponse.json(response.result);
  } catch (error: any) {
    // Se o erro for 409, a gente avisa o que é
    if (error.status === 409) {
      return NextResponse.json({ error: "Conflito: Este documento já existe ou foi enviado duplicado." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const rev = searchParams.get('rev');

    if (!id || !rev) {
      return NextResponse.json({ error: "ID e REV são obrigatórios" }, { status: 400 });
    }

    const client = getCloudantClient();
    const response = await client.deleteDocument({
      db: DB_NAME,
      docId: id,
      rev: rev,
    });

    return NextResponse.json(response.result);
  } catch (error: any) {
    console.error('Erro ao deletar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}