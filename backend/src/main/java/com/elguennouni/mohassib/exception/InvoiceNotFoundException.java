package com.elguennouni.mohassib.exception;

public class InvoiceNotFoundException extends RuntimeException {
    public InvoiceNotFoundException() {
        super("La facture demandee est introuvable.");
    }
}
