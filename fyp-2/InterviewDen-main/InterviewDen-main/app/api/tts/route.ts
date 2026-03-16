import { NextRequest, NextResponse } from 'next/server';
import { tts } from 'edge-tts';

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Generate Audio Buffer
    // Library returns a Buffer (Node.js)
    const audioBuffer = await tts(text, {
      voice: voice || 'en-US-AriaNeural',
    });

    // Provide headers for audio
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Content-Length', audioBuffer.length.toString());

    return new NextResponse(new Uint8Array(audioBuffer), { headers });

  } catch (error: any) {
    console.error('EdgeTTS API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
