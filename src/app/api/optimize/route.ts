import { NextResponse } from 'next/server';
import { analyzeTags } from '@/lib/grader';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, tags } = body;

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // Use the title as the target keyword for competitor analysis
        // In a real app, we might ask the user for a specific "Focus Keyword"
        // For now, we'll infer it from the title (taking the first few words or the whole title)
        // A simple heuristic: use the first 3-4 words of the title as the search term
        const targetKeyword = title.split(' ').slice(0, 4).join(' ');

        // Parse user tags (comma separated string -> array)
        const userTagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0) : [];

        const analysis = await analyzeTags(targetKeyword, userTagsArray);

        return NextResponse.json(analysis);

    } catch (error: any) {
        console.error('Optimize API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
