import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getTodosByUserId,
  createTodo,
  updateTodo,
  deleteTodo,
} from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const todos = await getTodosByUserId(session.user.id);
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { text } = await request.json();
    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const todo = await createTodo({
      text,
      userId: session.user.id,
    });
    return NextResponse.json(todo);
  } catch (error) {
    console.error('Failed to create todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id, done, text } = await request.json();
    if (!id) {
      return new NextResponse('ID is required', { status: 400 });
    }

    const todo = await updateTodo({ id, done, text });
    return NextResponse.json(todo);
  } catch (error) {
    console.error('Failed to update todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return new NextResponse('ID is required', { status: 400 });
    }

    await deleteTodo({ id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
