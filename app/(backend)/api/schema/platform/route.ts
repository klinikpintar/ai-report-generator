import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { PLATFORMS } from './constant';

export async function GET() {
  return NextResponse.json(PLATFORMS, { status: StatusCodes.OK });
}