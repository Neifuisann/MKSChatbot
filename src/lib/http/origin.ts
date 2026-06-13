function normalizeOrigin(value: string, protocol = "https"): string {
  const origin = value.includes("://") ? value : `${protocol}://${value}`;

  return new URL(origin).origin;
}

export function getRequestOrigin(requestHeaders: Headers): string {
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  if (host) {
    const protocol =
      forwardedProtocol ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");

    return normalizeOrigin(host, protocol);
  }

  const vercelUrl =
    process.env.VERCEL_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (vercelUrl) {
    return normalizeOrigin(vercelUrl);
  }

  return normalizeOrigin(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  );
}
