package com.elguennouni.mohassib.exception;

public class ClientNotFoundException extends RuntimeException {
    public ClientNotFoundException() {
        super("Le client demande est introuvable.");
    }
}
