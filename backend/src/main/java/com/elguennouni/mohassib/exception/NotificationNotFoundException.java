package com.elguennouni.mohassib.exception;

public class NotificationNotFoundException extends RuntimeException {
    public NotificationNotFoundException() {
        super("La notification demandee est introuvable.");
    }
}
