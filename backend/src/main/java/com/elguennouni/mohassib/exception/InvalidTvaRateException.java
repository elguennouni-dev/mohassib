package com.elguennouni.mohassib.exception;

public class InvalidTvaRateException extends RuntimeException {
    public InvalidTvaRateException() {
        super("Le taux de TVA doit etre 0%, 7%, 10% ou 20%.");
    }
}
