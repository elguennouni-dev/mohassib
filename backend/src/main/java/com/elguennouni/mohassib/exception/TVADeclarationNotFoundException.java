package com.elguennouni.mohassib.exception;

public class TVADeclarationNotFoundException extends RuntimeException {
    public TVADeclarationNotFoundException() {
        super("La déclaration TVA demandée est introuvable.");
    }
}
