package com.elguennouni.mohassib.exception;

public class ExpenseNotFoundException extends RuntimeException {
    public ExpenseNotFoundException() {
        super("La dépense demandée est introuvable.");
    }
}
