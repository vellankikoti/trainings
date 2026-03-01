/**
 * Performance / Load Testing Script
 *
 * Uses k6 for load testing. Install k6: https://k6.io/docs/get-started/installation/
 *
 * Usage:
 *   k6 run scripts/load-test.js
 *   k6 run --vus 50 --duration 60s scripts/load-test.js
 *
 * Environment variables:
 *   BASE_URL - Target URL (default: http://localhost:3000)
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const homepageDuration = new Trend("homepage_duration");
const lessonDuration = new Trend("lesson_duration");
const apiDuration = new Trend("api_duration");
const healthDuration = new Trend("health_duration");

// Test configuration
export const options = {
  stages: [
    // Ramp up to 10 users over 30 seconds
    { duration: "30s", target: 10 },
    // Stay at 10 users for 1 minute
    { duration: "1m", target: 10 },
    // Ramp up to 50 users over 30 seconds
    { duration: "30s", target: 50 },
    // Stay at 50 users for 2 minutes
    { duration: "2m", target: 50 },
    // Ramp up to 100 users for stress test
    { duration: "30s", target: 100 },
    // Stay at 100 users for 1 minute
    { duration: "1m", target: 100 },
    // Ramp down
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    // Homepage should load under 1 second
    homepage_duration: ["p(95)<1000"],
    // Lesson pages should load under 1.5 seconds
    lesson_duration: ["p(95)<1500"],
    // API endpoints should respond under 200ms
    api_duration: ["p(95)<200"],
    // Health check should be under 500ms
    health_duration: ["p(95)<500"],
    // Error rate should be under 1%
    errors: ["rate<0.01"],
    // Overall response time
    http_req_duration: ["p(95)<2000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Sample lesson paths for testing
const LESSON_PATHS = [
  "/learn/foundations/linux/01-the-story-of-linux",
  "/learn/foundations/linux/05-the-terminal",
  "/learn/foundations/git/01-the-story-of-git",
  "/learn/foundations/shell-scripting/01-shell-fundamentals",
  "/learn/foundations/networking/01-how-the-internet-works",
  "/learn/foundations/python-automation/01-why-python-for-devops",
];

export default function () {
  // 1. Health check endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  healthDuration.add(healthRes.timings.duration);
  check(healthRes, {
    "health check returns 200": (r) => r.status === 200,
    "health check has status field": (r) => {
      try {
        return JSON.parse(r.body).status !== undefined;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);

  sleep(0.5);

  // 2. Homepage
  const homeRes = http.get(`${BASE_URL}/`);
  homepageDuration.add(homeRes.timings.duration);
  check(homeRes, {
    "homepage returns 200": (r) => r.status === 200,
    "homepage has content": (r) => r.body.length > 1000,
  }) || errorRate.add(1);

  sleep(0.5);

  // 3. Random lesson page
  const lessonPath =
    LESSON_PATHS[Math.floor(Math.random() * LESSON_PATHS.length)];
  const lessonRes = http.get(`${BASE_URL}${lessonPath}`);
  lessonDuration.add(lessonRes.timings.duration);
  check(lessonRes, {
    "lesson returns 200": (r) => r.status === 200,
    "lesson has content": (r) => r.body.length > 500,
  }) || errorRate.add(1);

  sleep(0.5);

  // 4. Search API
  const searchRes = http.get(`${BASE_URL}/api/search?q=linux`);
  apiDuration.add(searchRes.timings.duration);
  check(searchRes, {
    "search returns 200": (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  const summary = {
    metrics: {
      homepage_p95: data.metrics.homepage_duration?.values?.["p(95)"],
      lesson_p95: data.metrics.lesson_duration?.values?.["p(95)"],
      api_p95: data.metrics.api_duration?.values?.["p(95)"],
      health_p95: data.metrics.health_duration?.values?.["p(95)"],
      error_rate: data.metrics.errors?.values?.rate,
      http_reqs: data.metrics.http_reqs?.values?.count,
      vus_max: data.metrics.vus?.values?.max,
    },
    thresholds: data.root_group?.checks
      ? Object.fromEntries(
          Object.entries(data.root_group.checks).map(([k, v]) => [
            k,
            v.passes / (v.passes + v.fails),
          ]),
        )
      : {},
  };

  return {
    stdout: JSON.stringify(summary, null, 2),
  };
}
