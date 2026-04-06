## Purpose

Define the authoritative fault-rate calculation rule based on device status ratio, including boundary behavior.

## Requirements

### Requirement: Fault rate SHALL be calculated from device error ratio
The system SHALL calculate fault rate as the ratio of devices with `status=error` to total devices, multiplied by 100.

#### Scenario: Fault rate is non-zero when error devices exist
- **WHEN** the device set contains at least one device with `status=error`
- **THEN** the reported fault-rate value SHALL be greater than 0
- **AND** the value SHALL equal `errorDeviceCount / totalDeviceCount * 100` within configured rounding precision

### Requirement: Fault-rate ratio calculation SHALL define boundary behavior
The system SHALL define deterministic boundary behavior for zero-device and zero-error conditions.

#### Scenario: No devices available
- **WHEN** total device count is 0
- **THEN** the fault-rate value SHALL be 0

#### Scenario: Devices exist but none are error
- **WHEN** total device count is greater than 0 and `errorDeviceCount` is 0
- **THEN** the fault-rate value SHALL be 0

