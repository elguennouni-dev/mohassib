package com.elguennouni.mohassib.dto;

import com.elguennouni.mohassib.entity.Client;

import java.time.LocalDateTime;

public record ClientResponse(
        Long id,
        String name,
        String email,
        String phone,
        String address,
        String city,
        String postalCode,
        String iceNumber,
        String contactPerson,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ClientResponse from(Client c) {
        return new ClientResponse(
                c.getId(),
                c.getName(),
                c.getEmail(),
                c.getPhone(),
                c.getAddress(),
                c.getCity(),
                c.getPostalCode(),
                c.getIceNumber(),
                c.getContactPerson(),
                c.getNotes(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
