import { json, options } from "../../../../lib/utils";

export const OPTIONS = options;
export function POST(request) {
  const response = json(request, { message: "Logged out." });
  response.cookies.delete("token");
  return response;
}
