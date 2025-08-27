import { NextResponse } from "next/server";

export interface ErrorWrapper {
  message: string;
  status: number;
}

export type ErrorOrData<T> = { error: ErrorWrapper; data: undefined } | { data: T; error?: undefined };

export function makeErrorWrapper(message: string, status: number): ErrorWrapper {
  return { message, status };
}

export function makeErrorOrData(message: string, status: number): ErrorOrData<never> {
  return { error: makeErrorWrapper(message, status), data: undefined };
}

export function propagateErrorOrData(errorWrapper: ErrorWrapper): ErrorOrData<never> {
  return { error: errorWrapper, data: undefined };
}

export function asNextResponseError(errorW: ErrorWrapper): NextResponse {
  return NextResponse.json({ message: errorW.message, success: false }, { status: errorW.status });
}

export function asNextResponseData<T>(data: T) {
  return NextResponse.json({ data, success: true });
}
