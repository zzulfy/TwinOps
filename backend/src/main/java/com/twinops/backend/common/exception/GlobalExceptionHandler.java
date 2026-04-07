package com.twinops.backend.common.exception;

import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.logging.LogFields;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException ex, HttpServletRequest request) {
        log.info("{}={} {}={} {}={} {}={} {}={} path={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "common",
            LogFields.EVENT, "exception.not_found",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "NOT_FOUND",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("{}={} {}={} {}={} {}={} {}={} path={} message={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "common",
            LogFields.EVENT, "exception.validation",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "INVALID_REQUEST",
            request.getRequestURI(),
            ex.getMessage()
        );
        return ResponseEntity.badRequest().body(ApiResponse.fail("invalid request"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("{}={} {}={} {}={} {}={} {}={} path={} message={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "common",
            LogFields.EVENT, "exception.illegal_argument",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "INVALID_ARGUMENT",
            request.getRequestURI(),
            ex.getMessage()
        );
        return ResponseEntity.badRequest().body(ApiResponse.fail(ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
        log.warn("{}={} {}={} {}={} {}={} {}={} path={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "auth",
            LogFields.EVENT, "exception.unauthorized",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "UNAUTHORIZED",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail(ex.getMessage()));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataAccess(DataAccessException ex, HttpServletRequest request) {
        log.error("{}={} {}={} {}={} {}={} {}={} path={} exception={} message={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "db",
            LogFields.EVENT, "exception.data_access",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "DB_ACCESS_ERROR",
            request.getRequestURI(),
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            ex
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("database access failed"));
    }

    @ExceptionHandler(CannotGetJdbcConnectionException.class)
    public ResponseEntity<ApiResponse<Void>> handleJdbcConnection(CannotGetJdbcConnectionException ex, HttpServletRequest request) {
        log.error("{}={} {}={} {}={} {}={} {}={} path={} exception={} message={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "db",
            LogFields.EVENT, "exception.jdbc_connection",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "DB_CONNECTION_FAILED",
            request.getRequestURI(),
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            ex
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("database connection failed"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex, HttpServletRequest request) {
        log.error("{}={} {}={} {}={} {}={} {}={} path={} exception={} message={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "common",
            LogFields.EVENT, "exception.unhandled",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "UNHANDLED_EXCEPTION",
            request.getRequestURI(),
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            ex
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail(ex.getMessage()));
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
