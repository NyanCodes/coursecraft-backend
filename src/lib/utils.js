// src/lib/utils.js

import { NextResponse } from "next/server";
import { corsHeaders } from "./cors";

export function json(request, data, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders(request) });
}

export function fail(request, message, status = 400) {
  return json(request, { message }, status);
}

export function options(request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export function serverError(request, error) {
  console.error(error);
  return fail(request, "Server error. Please try again.", 500);
}
