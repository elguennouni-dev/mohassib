package com.elguennouni.mohassib.exception;

public class SalarySlipNotFoundException extends RuntimeException {
    public SalarySlipNotFoundException() {
        super("Le bulletin de paie demande est introuvable.");
    }
}
