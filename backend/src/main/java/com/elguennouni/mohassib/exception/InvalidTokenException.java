package com.elguennouni.mohassib.exception;

public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException() {
        super("Le jeton fourni est invalide ou expire.");
    }
}
