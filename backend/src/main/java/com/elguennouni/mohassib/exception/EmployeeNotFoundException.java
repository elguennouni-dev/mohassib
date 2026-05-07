package com.elguennouni.mohassib.exception;

public class EmployeeNotFoundException extends RuntimeException {
    public EmployeeNotFoundException() {
        super("L'employé demandé est introuvable.");
    }
}
