import { NextResponse } from "next/server";

// Authorization is checked by each API route, including ownership and enrollment rules.
// No global proxy matcher is needed because login and CORS preflight must stay public.
export function proxy() { return NextResponse.next(); }
export const config = { matcher: [] };
