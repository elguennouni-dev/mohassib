package com.elguennouni.mohassib.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String email) {
        super("Un compte existe deja avec l'adresse email : " + email);
    }
}
