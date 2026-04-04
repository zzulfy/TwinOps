## 1. Kafka Messaging Migration

- [x] 1.1 Add Kafka dependencies and runtime configuration (`spring-kafka`, topic/group/bootstrap settings) and disable RocketMQ analysis path by default.
- [x] 1.2 Implement Kafka analysis producer to publish manual trigger payloads with required analysis context fields.
- [x] 1.3 Implement Kafka analysis consumer to execute analysis pipeline and persist success/failed report records.
- [x] 1.4 Keep scheduler compatibility mode behind config switch, with manual-trigger mode as default behavior.

## 2. Backend Manual Trigger API

- [x] 2.1 Add authenticated manual trigger endpoint in analysis controller and define request/response DTOs under existing `ApiResponse<T>` contract.
- [x] 2.2 Add input validation and error handling for manual trigger API, ensuring invalid payloads do not publish messages.
- [x] 2.3 Wire service layer to route manual trigger requests into Kafka producer and return accepted result for async processing.

## 3. Frontend Analysis Center Update

- [x] 3.1 Add manual trigger button/form in analysis center page with authenticated submit flow.
- [x] 3.2 Integrate frontend API client with new backend trigger endpoint and propagate backend error messages to UI.
- [x] 3.3 Refresh analysis list/detail status after trigger so processing/success/failed lifecycle is visible.

## 4. Testing and Regression Coverage

- [x] 4.1 Add backend API tests for manual trigger endpoint (auth required, validation failure, accepted request).
- [x] 4.2 Add backend integration tests for Kafka publish-consume-persist flow and scheduler compatibility switch behavior.
- [x] 4.3 Add frontend regression tests for manual trigger interaction and post-submit data refresh behavior.

## 5. Documentation and Deployment Runbook

- [x] 5.1 Update root README with manual trigger workflow and Kafka-based deployment/verification steps.
- [x] 5.2 Update backend README to replace RocketMQ analysis instructions with Kafka topic/group/bootstrap setup and troubleshooting.
