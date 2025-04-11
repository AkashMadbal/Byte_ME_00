import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    console.log('Dashboard API called');

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

    const { email } = data;
    console.log('Dashboard request for email:', email);

    if (!email) {
      console.error('Email is missing in request');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
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

    // Fetch user by email
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare performance data for the graph
    let performanceData = [];
    if (user.result && Array.isArray(user.result)) {
      performanceData = user.result.map((quiz: any, index: number) => ({
        quizNumber: index + 1,
        marks: quiz.score || 0
      }));
    } else if (user.result && typeof user.result === 'object') {
      // Handle if result is stored as an object
      performanceData = Object.entries(user.result).map(([key, value]: [string, any]) => ({
        quizNumber: parseInt(key) + 1,
        marks: typeof value === 'number' ? value : (value.score || 0)
      }));
    }

    const weakTopics = user.weaktopics || [];

    return NextResponse.json({
      user: {
        name: user.name
      },
      performanceData,
      result: user.result, // Raw result data
      weakTopics
    });

  } catch (error) {
    console.error("Dashboard data fetch (by email) error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
