package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.ClientRequest;
import com.elguennouni.mohassib.dto.ClientResponse;
import com.elguennouni.mohassib.dto.PageResponse;
import com.elguennouni.mohassib.entity.Client;
import com.elguennouni.mohassib.exception.ClientNotFoundException;
import com.elguennouni.mohassib.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public PageResponse<ClientResponse> list(Long companyId, String search, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("name").ascending());

        Page<Client> result;
        if (search == null || search.isBlank()) {
            result = clientRepository.findByCompanyId(companyId, pageable);
        } else {
            result = clientRepository.searchByCompanyId(companyId, search.trim(), pageable);
        }
        return PageResponse.from(result, ClientResponse::from);
    }

    @Transactional(readOnly = true)
    public ClientResponse get(Long companyId, Long clientId) {
        return ClientResponse.from(findOrThrow(companyId, clientId));
    }

    @Transactional
    public ClientResponse create(Long companyId, ClientRequest request) {
        Client client = Client.builder()
                .companyId(companyId)
                .name(request.name().trim())
                .email(blankToNull(request.email()))
                .phone(blankToNull(request.phone()))
                .address(blankToNull(request.address()))
                .city(blankToNull(request.city()))
                .postalCode(blankToNull(request.postalCode()))
                .iceNumber(blankToNull(request.iceNumber()))
                .contactPerson(blankToNull(request.contactPerson()))
                .notes(blankToNull(request.notes()))
                .build();
        return ClientResponse.from(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(Long companyId, Long clientId, ClientRequest request) {
        Client client = findOrThrow(companyId, clientId);
        client.setName(request.name().trim());
        client.setEmail(blankToNull(request.email()));
        client.setPhone(blankToNull(request.phone()));
        client.setAddress(blankToNull(request.address()));
        client.setCity(blankToNull(request.city()));
        client.setPostalCode(blankToNull(request.postalCode()));
        client.setIceNumber(blankToNull(request.iceNumber()));
        client.setContactPerson(blankToNull(request.contactPerson()));
        client.setNotes(blankToNull(request.notes()));
        return ClientResponse.from(client);
    }

    @Transactional
    public void delete(Long companyId, Long clientId) {
        Client client = findOrThrow(companyId, clientId);
        clientRepository.delete(client);
    }

    private Client findOrThrow(Long companyId, Long clientId) {
        return clientRepository.findByIdAndCompanyId(clientId, companyId)
                .orElseThrow(ClientNotFoundException::new);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
