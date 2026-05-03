package com.elguennouni.mohassib.exception;

public class PaymentNotFoundException extends RuntimeException {
    public PaymentNotFoundException() {
        super("Le paiement demande est introuvable.");
    }
}
