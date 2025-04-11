// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { generateMockResponse } from './mockResponseGenerator';

export async function POST(req: NextRequest) {
  try {
    console.log('Chat API called');

    // Parse request body
    let data;
    try {
      data = await req.json();
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { message, email } = data;
    console.log('Chat request for email:', email);

    if (!email) {
      console.error('Email is missing in request');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Connect to MongoDB directly
    let client;
    try {
      console.log('Connecting to MongoDB...');
      client = await clientPromise;
      console.log('MongoDB connection successful');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    const db = client.db();

    // Fetch user's weak topics from the database
    let user;
    try {
      console.log('Querying for user with email:', email);
      user = await db.collection('users').findOne({ email });
      console.log('User query result:', user ? 'User found' : 'User not found');
    } catch (queryError) {
      console.error('MongoDB query error:', queryError);
      return NextResponse.json(
        { error: 'Database query failed', details: queryError instanceof Error ? queryError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    const weakTopics = user?.weaktopics || [];

    console.log("Processing chat request for user with weak topics:", weakTopics);

    // Instead of calling the Gemini API, we'll generate a mock response
    // This simulates what the AI would respond with
    const mockResponse = generateMockResponse(message, weakTopics);

    // Log the mock response
    console.log("Generated mock response:", mockResponse);

    // Return the mock response
    return NextResponse.json({
      text: mockResponse,
      model: "mock-ai-model"
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
