package com.elguennouni.mohassib.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Identifiants invalides.");
    }
}
