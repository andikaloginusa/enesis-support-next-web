# ─────────────────────────────────────────────────────────────
# Stage 1: deps — Install production + dev dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install libc compatibility for native modules (e.g. sharp)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy lockfile first to maximise layer cache hits
COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

# ─────────────────────────────────────────────────────────────
# Stage 2: builder — Build the Next.js production bundle
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bring in installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Build args that will be baked into the image at build time.
# These are injected by docker-compose via --build-arg / args:
ARG BASE_URL
ARG BASE_URL_LOGIN

# Make them available to next build as env vars
ENV BASE_URL=$BASE_URL
ENV BASE_URL_LOGIN=$BASE_URL_LOGIN

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 3: runner — Minimal production image
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only the built output — keeps the image lean
COPY --from=builder /app/public ./public

# Next.js standalone output (configured in next.config.mjs)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
