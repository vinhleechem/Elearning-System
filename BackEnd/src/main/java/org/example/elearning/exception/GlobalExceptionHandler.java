package org.example.elearning.exception;

import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.exception.exceptions.ForbiddenException;
import org.example.elearning.exception.exceptions.ResourceConflictException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.exception.exceptions.UnauthorizedException;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Objects;
import java.util.stream.Collectors;


@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Object> handleUnauthorizedException(UnauthorizedException ex) {
        StandardResponse<Void> response = StandardResponse.<Void>error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED.value()).body(response);
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex) {
        StandardResponse<Void> response = StandardResponse.<Void>error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceConflictException ex) {
        StandardResponse<Void> response = StandardResponse.<Void>error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ForbiddenException ex) {
        StandardResponse<Void> response = StandardResponse.<Void>error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Object> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        String errorMsg = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.joining(", "));
        StandardResponse<Void> response = StandardResponse.<Void>error(errorMsg);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleException(Exception exception) {
        StandardResponse<Void> response = StandardResponse.<Void>error(exception.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
