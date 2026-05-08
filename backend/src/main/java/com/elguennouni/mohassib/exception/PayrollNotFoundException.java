package com.elguennouni.mohassib.exception;

public class PayrollNotFoundException extends RuntimeException {
    public PayrollNotFoundException() {
        super("La paie demandée est introuvable.");
    }
}
