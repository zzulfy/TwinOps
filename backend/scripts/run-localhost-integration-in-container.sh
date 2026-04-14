#!/usr/bin/env bash
set -euo pipefail

java -jar target/backend-0.0.1-SNAPSHOT.jar \
  --server.port=18080 \
  --spring.datasource.url="jdbc:mysql://host.docker.internal:3306/twinops?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC" \
  --spring.datasource.username=root \
  --spring.datasource.password=root \
  --spring.kafka.bootstrap-servers=host.docker.internal:9092 \
  --twinops.analysis.automation.enabled=true \
  > /tmp/backend.log 2>&1 &
BACK_PID=$!

cleanup() {
  kill "$BACK_PID" >/dev/null 2>&1 || true
  wait "$BACK_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 120); do
  if grep -q "Started BackendApplication" /tmp/backend.log; then
    break
  fi
  sleep 1
done

if ! grep -q "Started BackendApplication" /tmp/backend.log; then
  echo "backend failed to start"
  tail -n 120 /tmp/backend.log
  exit 1
fi

mvn \
  -Dit.base-url=http://127.0.0.1:18080 \
  "-Dtest=DeviceLocalhostIntegrationTest,AuthFlowIntegrationTest,AnalysisKafkaIntegrationTest" \
  test
