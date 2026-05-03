package com.elguennouni.mohassib.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleEmailExists(EmailAlreadyExistsException ex) {
        return error(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return error(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", ex.getMessage());
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidToken(InvalidTokenException ex) {
        return error(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", ex.getMessage());
    }

    @ExceptionHandler(CompanyAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleCompanyExists(CompanyAlreadyExistsException ex) {
        return error(HttpStatus.CONFLICT, "COMPANY_ALREADY_EXISTS", ex.getMessage());
    }

    @ExceptionHandler(CompanyNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCompanyNotFound(CompanyNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(ClientNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleClientNotFound(ClientNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "CLIENT_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(InvoiceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleInvoiceNotFound(InvoiceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "INVOICE_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(InvalidInvoiceStateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidInvoiceState(InvalidInvoiceStateException ex) {
        return error(HttpStatus.CONFLICT, "INVALID_INVOICE_STATE", ex.getMessage());
    }

    @ExceptionHandler(InvalidTvaRateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTvaRate(InvalidTvaRateException ex) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_TVA_RATE", ex.getMessage());
    }

    @ExceptionHandler(PdfGenerationException.class)
    public ResponseEntity<Map<String, Object>> handlePdfGeneration(PdfGenerationException ex) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "PDF_GENERATION_ERROR", ex.getMessage());
    }

    @ExceptionHandler(EmailSendingException.class)
    public ResponseEntity<Map<String, Object>> handleEmailSending(EmailSendingException ex) {
        return error(HttpStatus.BAD_GATEWAY, "EMAIL_SENDING_ERROR", ex.getMessage());
    }

    @ExceptionHandler(InvalidPaymentException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidPayment(InvalidPaymentException ex) {
        return error(HttpStatus.CONFLICT, "INVALID_PAYMENT", ex.getMessage());
    }

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePaymentNotFound(PaymentNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> {
                    Map<String, String> entry = new LinkedHashMap<>();
                    entry.put("field", fe.getField());
                    entry.put("message", fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Valeur invalide.");
                    return entry;
                })
                .toList();

        Map<String, Object> body = baseBody(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Donnees invalides.");
        body.put("details", details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(baseBody(status, code, message));
    }

    private Map<String, Object> baseBody(HttpStatus status, String code, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", code);
        body.put("message", message);
        return body;
    }
}
