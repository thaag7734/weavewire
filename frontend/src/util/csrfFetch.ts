export const csrfFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  // get csrf cookie from sanctum
  await fetch("/sanctum/csrf-cookie");

  const csrf = document.cookie
    .split(";")
    .find((row) => row.trim().startsWith("XSRF-TOKEN"))!
    .split("=")[1]
    .replace("%3D", "="); // terminator gets url encoded which breaks things, fix it here

  return await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      ...init?.headers,
      "X-XSRF-TOKEN": csrf,
    },
  });
};
