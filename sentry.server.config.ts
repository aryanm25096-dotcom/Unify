import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN || "___SENTRY_DSN___",
    tracesSampleRate: 1,
    debug: false,
});
