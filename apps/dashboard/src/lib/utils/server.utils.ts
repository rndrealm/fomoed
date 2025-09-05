import { NextResponse } from "next/server";

export type ErrorWrapper = {
  message: string;
  status: number;
  detail?: any;
};

export type ErrorOrData<T> = { error: ErrorWrapper; data?: undefined } | { data: T; error?: undefined };

export function makeErrorWrapper(message: string, status: number, detail?: any): ErrorWrapper {
  return { message, status, detail };
}

export function makeErrorOrData(message: string, status: number): ErrorOrData<never> {
  return { error: makeErrorWrapper(message, status), data: undefined };
}

export function propagateErrorOrData(errorWrapper: ErrorWrapper): ErrorOrData<never> {
  return { error: errorWrapper, data: undefined };
}

export function asNextResponseError(errorW: ErrorWrapper): NextResponse {
  return NextResponse.json(
    { message: errorW.message, success: false, detail: errorW.detail },
    { status: errorW.status },
  );
}

export function asNextResponseData<T>(data: T) {
  if (!process.env.DISABLE_RESPONSE_LOG) {
    console.info("Response body:\n" + JSON.stringify(data, null, 2));
  }

  return NextResponse.json({ data, success: true });
}
