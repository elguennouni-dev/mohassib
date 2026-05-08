package com.elguennouni.mohassib.exception;

public class PayrollAlreadyExistsException extends RuntimeException {
    public PayrollAlreadyExistsException(int month, int year) {
        super("Une paie existe deja pour " + String.format("%02d/%d", month, year) + ".");
    }
}
