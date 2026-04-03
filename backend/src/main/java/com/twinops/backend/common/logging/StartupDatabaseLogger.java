package com.twinops.backend.common.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Component
public class StartupDatabaseLogger implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupDatabaseLogger.class);
    private final DataSource dataSource;

    public StartupDatabaseLogger(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        String url = extractJdbcUrl();
        log.info("{}={} {}={} {}={} {}={} {}={} {}={}",
            LogFields.MODULE, "db",
            LogFields.EVENT, "datasource.startup.summary",
            LogFields.RESULT, "ready",
            "db_url_sanitized", sanitizeJdbcUrl(url),
            "db_host", extractHost(url),
            "db_schema", extractSchema(url)
        );
    }

    private String extractJdbcUrl() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.getMetaData().getURL();
        } catch (Exception ex) {
            log.warn("{}={} {}={} {}={} {}={}",
                LogFields.MODULE, "db",
                LogFields.EVENT, "datasource.startup.summary",
                LogFields.RESULT, "failed_to_read_url",
                LogFields.ERROR_CODE, "DB_STARTUP_URL_READ_FAILED"
            );
            return "";
        }
    }

    private String sanitizeJdbcUrl(String jdbcUrl) {
        if (jdbcUrl == null || jdbcUrl.isBlank()) {
            return "";
        }
        int queryIndex = jdbcUrl.indexOf('?');
        return queryIndex > 0 ? jdbcUrl.substring(0, queryIndex) : jdbcUrl;
    }

    private String extractHost(String jdbcUrl) {
        try {
            String stripped = sanitizeJdbcUrl(jdbcUrl).replaceFirst("^jdbc:", "");
            URI uri = URI.create(stripped);
            return uri.getHost() == null ? "" : uri.getHost();
        } catch (IllegalArgumentException ex) {
            return "";
        }
    }

    private String extractSchema(String jdbcUrl) {
        try {
            String stripped = sanitizeJdbcUrl(jdbcUrl).replaceFirst("^jdbc:", "");
            URI uri = new URI(stripped);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                return "";
            }
            return path.startsWith("/") ? path.substring(1) : path;
        } catch (URISyntaxException ex) {
            return "";
        }
    }
}
