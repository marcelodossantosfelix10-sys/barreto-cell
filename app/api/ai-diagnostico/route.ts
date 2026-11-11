import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { brand, model, defect } = body;

    if (!defect) {
      return NextResponse.json({ error: 'Defeito não informado' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Heuristic fallback response tailored for Brazilian cell repair shops
      return NextResponse.json({
        possibleCauses: [
          'Falha física no componente principal (display, flex ou dock de carga)',
          'Possível oxidação por umidade ou curto em capacitor secundário',
          'Desgaste natural de ciclos de vida do componente',
        ],
        recommendedParts: [
          `Componente de reposição para ${brand || 'aparelho'} ${model || ''}`,
          'Insumos de vedação e cola para acabamento',
        ],
        difficulty: 'Médio',
        estimatedMinutes: 45,
        suggestedLabor: 90.0,
        checklistAdvice: [
          'Testar touch em todos os quadrantes da tela',
          'Verificar consumo na fonte de bancada antes de abrir',
          'Checar microfone e alto-falantes antes de fechar',
        ],
        clientAdvice: `Explicar com clareza que o defeito em ${model || 'seu celular'} requer abertura técnica e substituição segura de componentes com garantia de 90 dias.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Você é um especialista sênior em bancada de assistência técnica de smartphones da loja "Barreto Cell".
Analise o seguinte caso de reparo:
Marca: ${brand || 'Não especificada'}
Modelo: ${model || 'Não especificado'}
Sintoma/Defeito relatado: "${defect}"

Forneça uma avaliação técnica em formato estritamente JSON com o seguinte schema:
{
  "possibleCauses": ["causa 1", "causa 2", "causa 3"],
  "recommendedParts": ["peça 1 sugerida com especificação", "peça 2 sugerida"],
  "difficulty": "Fácil" ou "Médio" ou "Avançado (Microsolda)",
  "estimatedMinutes": número de minutos estimados na bancada,
  "suggestedLabor": valor sugerido de mão de obra em reais (número puro),
  "checklistAdvice": ["teste prévio 1", "teste prévio 2", "teste prévio 3"],
  "clientAdvice": "Mensagem empática e profissional em português para explicar o problema ao cliente leigo no orçamento"
}

Apenas responda com o objeto JSON válido, sem crases de markdown se possível.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let parsed: any = {};
    try {
      const rawText = (response.text || '').trim();
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {
      parsed = {};
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('AI diagnosis error:', error);
    return NextResponse.json(
      {
        possibleCauses: [
          'Defeito elétrico no módulo principal',
          'Necessidade de substituição do componente danificado',
        ],
        recommendedParts: ['Peça de reposição compatível'],
        difficulty: 'Médio',
        estimatedMinutes: 40,
        suggestedLabor: 80.0,
        checklistAdvice: ['Checar consumo e câmeras'],
        clientAdvice: 'Orçamento elaborado com peças de alta qualidade e garantia Barreto Cell.',
      },
      { status: 200 }
    );
  }
}
