import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// This is where we save the counter
const filePath = path.join(process.cwd(), 'visit_count.json');

export async function POST(req: NextRequest) {
    try {
        // Read the current count from the file; if missing, start at 0
        const data = await fs.readFile(filePath, 'utf8').catch(() => '0');
        const currentCount = parseInt(data, 10);
        const newCount = currentCount + 1;

        // Save the new count to the file
        await fs.writeFile(filePath, newCount.toString(), 'utf8');
        return NextResponse.json({ success: true, count: newCount });
    } catch (error) {
        // Handle any errors during the process
        return NextResponse.json({ error: 'Could not update counter' }, { status: 500 });
    }
}
