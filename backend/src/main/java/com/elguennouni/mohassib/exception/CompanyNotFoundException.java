package com.elguennouni.mohassib.exception;

public class CompanyNotFoundException extends RuntimeException {
    public CompanyNotFoundException() {
        super("Aucune entreprise n'est associee a ce compte.");
    }
}
