package com.elguennouni.mohassib.exception;

public class CompanyAlreadyExistsException extends RuntimeException {
    public CompanyAlreadyExistsException() {
        super("Une entreprise est deja associee a ce compte.");
    }
}
