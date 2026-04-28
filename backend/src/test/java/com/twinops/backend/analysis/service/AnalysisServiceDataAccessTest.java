package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.mapper.AnalysisReportMapper;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AnalysisServiceDataAccessTest {

    @Test
    void listReports_shouldReturnEmpty_onDataAccessException() {
        AnalysisReportMapper mapper = mock(AnalysisReportMapper.class);
        LlmProviderAdapter llm = mock(LlmProviderAdapter.class);
        when(mapper.selectList(any())).thenThrow(new DataAccessResourceFailureException("db down"));
        AnalysisService svc = new AnalysisService(mapper, llm);
        List<?> result = svc.listReports(10);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
