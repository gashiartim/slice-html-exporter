# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/playwright:v1.59.1-jammy AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.00.0.0"

# Note: We run as root here or the built-in pwuser because Playwright dependencies often expect it.
# The official image creates a `pwuser` but next standalone requires access to write to .next/cache if not copied correctly.
# We'll use the default user but ensure permissions.
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Switch to the non-root user provided by the Playwright image
USER pwuser

EXPOSE 3000

CMD ["node", "server.js"]
