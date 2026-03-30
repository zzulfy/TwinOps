package com.twinops.backend.telemetry.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@TableName("device_metrics")
public class TelemetryEntity {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String deviceCode;
    private LocalDateTime metricTime;
    private BigDecimal temperature;
    private BigDecimal humidity;
    private BigDecimal voltage;
    private BigDecimal current;
    private BigDecimal power;
    private BigDecimal cpuLoad;
    private BigDecimal memoryUsage;
    private BigDecimal diskUsage;
    private BigDecimal networkTraffic;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
    public LocalDateTime getMetricTime() { return metricTime; }
    public void setMetricTime(LocalDateTime metricTime) { this.metricTime = metricTime; }
    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public BigDecimal getHumidity() { return humidity; }
    public void setHumidity(BigDecimal humidity) { this.humidity = humidity; }
    public BigDecimal getVoltage() { return voltage; }
    public void setVoltage(BigDecimal voltage) { this.voltage = voltage; }
    public BigDecimal getCurrent() { return current; }
    public void setCurrent(BigDecimal current) { this.current = current; }
    public BigDecimal getPower() { return power; }
    public void setPower(BigDecimal power) { this.power = power; }
    public BigDecimal getCpuLoad() { return cpuLoad; }
    public void setCpuLoad(BigDecimal cpuLoad) { this.cpuLoad = cpuLoad; }
    public BigDecimal getMemoryUsage() { return memoryUsage; }
    public void setMemoryUsage(BigDecimal memoryUsage) { this.memoryUsage = memoryUsage; }
    public BigDecimal getDiskUsage() { return diskUsage; }
    public void setDiskUsage(BigDecimal diskUsage) { this.diskUsage = diskUsage; }
    public BigDecimal getNetworkTraffic() { return networkTraffic; }
    public void setNetworkTraffic(BigDecimal networkTraffic) { this.networkTraffic = networkTraffic; }
}
