import "server-only";
import type { Problem } from "@/types/problem";

export const notificationService: Problem = {
  id: "notification-service",
  title: "Design a Notification Service",
  difficulty: "easy",
  tags: ["messaging", "fan-out", "deliverability"],
  prompt:
    "Design a service that sends notifications to users across email, push, and in-app channels. " +
    "Users have notification preferences and can unsubscribe from certain types.",
  clarificationFacts: [
    {
      question: "How many notifications are sent per day?",
      answer: "~5 million/day across all channels. Peak spikes of 50× during events.",
    },
    {
      question: "What latency is acceptable for notifications?",
      answer: "In-app: <1s. Push: <10s. Email: best-effort, a few minutes is fine.",
    },
    {
      question: "Do we need delivery guarantees?",
      answer: "At-least-once delivery per channel. Duplicate suppression within 5 min window.",
    },
    {
      question: "Who triggers notifications?",
      answer: "Internal services publish events (order placed, message received, etc). Notification service subscribes and fans out.",
    },
  ],
  rubric: [
    "Separates concerns: event ingestion from fan-out logic from delivery per channel",
    "Uses a queue/stream (e.g. SQS, Kafka) to buffer spikes and retry failed deliveries",
    "Handles user preference lookups efficiently (cache or denormalized store)",
    "Addresses idempotency to prevent duplicate notifications",
    "Discusses backpressure or rate limiting to protect third-party providers (SendGrid, APNs, FCM)",
    "Mentions observability: delivery status tracking, failure alerting",
  ],
  referenceDesign:
    "Event bus (Kafka/SQS) receives notification triggers. Fan-out service reads user preferences " +
    "from a cache-backed preferences store and creates per-channel delivery tasks. " +
    "Channel workers (email, push, in-app) process tasks with retry logic and exponential backoff. " +
    "Delivery status tracked in a lightweight DB table. Dedup via a Redis SET with TTL. " +
    "In-app notifications served via WebSocket or SSE for real-time delivery.",
};

export const rateLimiter: Problem = {
  id: "rate-limiter",
  title: "Design a Rate Limiter",
  difficulty: "medium",
  tags: ["api-gateway", "distributed", "algorithms"],
  prompt:
    "Design a rate limiting service for a public API platform. " +
    "Clients should be limited by API key, with different tiers having different limits.",
  clarificationFacts: [
    {
      question: "What rate limiting algorithm should we use?",
      answer: "Flexible — token bucket or sliding window log are both acceptable. Justify your choice.",
    },
    {
      question: "What are the request volumes?",
      answer: "100k API calls/second peak. ~10k unique API keys active at any time.",
    },
    {
      question: "Should limits be per-second, per-minute, or both?",
      answer: "Both: burst limit (per-second) and sustained limit (per-minute). Tier examples: Free=60/min, Pro=1000/min.",
    },
    {
      question: "Is the rate limiter in-process or a standalone service?",
      answer: "Standalone service called by all API gateway nodes. Must work correctly across multiple gateway instances.",
    },
    {
      question: "What happens when the limit is hit?",
      answer: "Return 429 with a Retry-After header. Request should not be processed.",
    },
  ],
  rubric: [
    "Selects and correctly explains an algorithm (token bucket, sliding window, etc.)",
    "Addresses the distributed coordination problem — single Redis node vs. cluster vs. approximate counting",
    "Handles the race condition when multiple gateway nodes check limits simultaneously",
    "Discusses consistency vs. availability trade-off (over-limit vs. under-limit on failure)",
    "Explains storage: what's stored per key, TTL strategy",
    "Mentions 429 response shape and Retry-After header",
    "Considers latency impact — rate limiter must add <1ms to request path",
  ],
  referenceDesign:
    "Redis-based token bucket or sliding window counter per API key, with Lua scripts to make the check-and-decrement atomic. " +
    "Each API gateway reads from Redis before forwarding the request. " +
    "Use Redis Cluster for availability; tolerate slightly over-limit on Redis failure rather than blocking all traffic. " +
    "Keys expire automatically (no manual cleanup). " +
    "Burst limit uses a per-second key; sustained limit uses a per-minute key, both checked atomically. " +
    "Return X-RateLimit-Remaining and Retry-After headers on 429.",
};

export const webhookDelivery: Problem = {
  id: "webhook-delivery",
  title: "Design a Webhook Delivery System",
  difficulty: "medium",
  tags: ["reliability", "retries", "observability"],
  prompt:
    "Design a system that lets developers register webhooks and reliably delivers event payloads to their endpoints. " +
    "Used by a platform like Stripe or GitHub.",
  clarificationFacts: [
    {
      question: "What are the scale requirements?",
      answer: "~1 million webhook deliveries/day. Average payload <10KB. Fan-out up to 50 subscribers per event.",
    },
    {
      question: "What reliability guarantees are expected?",
      answer: "At-least-once delivery. Retry with exponential backoff for up to 72 hours on failures.",
    },
    {
      question: "How do developers register webhooks?",
      answer: "Via REST API: register a URL + event types. They get a signing secret to verify payloads.",
    },
    {
      question: "What counts as a successful delivery?",
      answer: "Any 2xx HTTP response within 30 seconds. All other responses (timeouts, 4xx, 5xx) are failures.",
    },
  ],
  rubric: [
    "Separates event ingestion from delivery workers (async queue between them)",
    "Implements retry with exponential backoff and a reasonable cap (72h)",
    "Handles failed endpoints gracefully: disabling after sustained failures, alerting developers",
    "Addresses payload signing (HMAC with signing secret) for security",
    "Stores delivery attempts and status for a delivery log (developer-facing)",
    "Considers ordering: per-endpoint ordering vs. global ordering vs. best-effort",
    "Discusses timeout handling on the delivery side",
  ],
  referenceDesign:
    "Event ingestion API writes to a queue (SQS or Kafka). " +
    "Delivery workers dequeue events, fan out to registered subscriber URLs concurrently. " +
    "Each delivery attempt stored in a delivery_attempts table (endpoint, event_id, status, response_code, attempt_number). " +
    "Failed deliveries re-enqueued with exponential backoff using SQS delay or a scheduled retry table. " +
    "After 72h or N failures, endpoint auto-disabled and developer emailed. " +
    "Payloads signed with HMAC-SHA256 using per-endpoint secret. " +
    "Delivery log UI gives developers visibility into what was sent and why it failed.",
};

export const collaborativeEditor: Problem = {
  id: "collaborative-editor",
  title: "Design a Collaborative Document Editor",
  difficulty: "hard",
  tags: ["real-time", "crdt", "consistency"],
  prompt:
    "Design a system where multiple users can edit a document at the same time and see each other's changes in real-time. " +
    "Think Google Docs, but for a startup team.",
  clarificationFacts: [
    {
      question: "How many concurrent editors per document?",
      answer: "Typically 2-5, max ~20. No Wikipedia-scale concurrent editing.",
    },
    {
      question: "What document types need to be supported?",
      answer: "Rich text only for v1 — paragraphs, headings, bold/italic, lists. No spreadsheets.",
    },
    {
      question: "What consistency model is acceptable?",
      answer: "Eventual consistency is fine. Conflicting edits should merge sensibly, not last-write-wins.",
    },
    {
      question: "Is offline editing a requirement?",
      answer: "Nice to have, not required for v1. Focus on online collaborative editing.",
    },
    {
      question: "What are the storage requirements?",
      answer: "Documents up to ~500KB. Need version history for at least 30 days.",
    },
  ],
  rubric: [
    "Correctly identifies the conflict resolution problem and proposes a viable algorithm (OT or CRDT)",
    "Explains the real-time sync mechanism (WebSocket, SSE, or similar)",
    "Addresses the server's role: relay-only vs. authoritative transform server",
    "Discusses presence/cursor sharing (who is editing what)",
    "Considers reconnection and catching up on missed operations",
    "Mentions document persistence: when to snapshot vs. replay from op log",
    "Addresses the cursor/position adjustment problem when remote edits change document length",
  ],
  referenceDesign:
    "Operational Transform (OT) or CRDT (e.g. Y.js/Automerge) for conflict resolution. " +
    "WebSocket server per document session; clients send operations, server broadcasts transformed ops to all peers. " +
    "With OT: server serialises concurrent operations and transforms against each other before broadcasting. " +
    "With CRDT: server relays ops; clients converge independently. " +
    "Presence/cursor positions broadcast via ephemeral channel (Redis pub/sub). " +
    "Operations appended to an op log in the DB; periodic snapshot created to bound replay time. " +
    "Clients reconnect by fetching the latest snapshot + op log since snapshot version.",
};

export const mlFeaturePipeline: Problem = {
  id: "ml-feature-pipeline",
  title: "Design an ML Feature Store and Training Pipeline",
  difficulty: "hard",
  tags: ["ml-infra", "data-pipeline", "consistency"],
  prompt:
    "Design a system that computes and serves features for machine learning models at a startup. " +
    "Features need to be consistent between training and production inference.",
  clarificationFacts: [
    {
      question: "What types of features are we talking about?",
      answer:
        "User features (account age, spend history), item features (category, price), and real-time contextual features (session length, last click).",
    },
    {
      question: "What is the freshness requirement?",
      answer:
        "Batch features: daily recompute is fine. Real-time features: <1 second stale.",
    },
    {
      question: "What is the inference scale?",
      answer: "~10k predictions/second at peak. Feature lookup must add <5ms to latency.",
    },
    {
      question: "What is the training/serving skew concern?",
      answer:
        "Critical. The same feature values must be retrievable for training time-travel (to reproduce past predictions).",
    },
    {
      question: "Do we need online and offline feature computation?",
      answer: "Yes — batch pipeline for historical features (Spark/SQL), streaming for real-time features (Kafka/Flink).",
    },
  ],
  rubric: [
    "Separates online store (low-latency serving) from offline store (training, batch jobs)",
    "Identifies the training-serving skew problem and addresses it (point-in-time lookups, versioned features)",
    "Proposes appropriate storage: Redis/DynamoDB for online, S3/data warehouse for offline",
    "Addresses feature freshness: push-based vs. pull-based refresh for different freshness tiers",
    "Discusses the streaming pipeline for real-time features (Kafka + Flink/Spark Streaming)",
    "Considers feature versioning — what happens when a feature definition changes",
    "Mentions monitoring: feature drift detection, serving latency",
  ],
  referenceDesign:
    "Two-tier store: Redis for online serving (<5ms lookups), S3/BigQuery for offline training. " +
    "Batch pipeline (Spark/dbt) computes historical features nightly and writes to both stores. " +
    "Streaming pipeline (Kafka + Flink) computes real-time features and writes to Redis with a short TTL. " +
    "Feature registry stores metadata: name, version, computation logic, last updated. " +
    "Point-in-time lookups enabled by storing feature values with effective timestamps in the offline store, " +
    "so training jobs can retrieve what the feature value was at any historical moment. " +
    "Feature serving API aggregates from online store; model servers call it once per prediction request.",
};

export const ADDITIONAL_PROBLEMS: Problem[] = [
  notificationService,
  rateLimiter,
  webhookDelivery,
  collaborativeEditor,
  mlFeaturePipeline,
];
