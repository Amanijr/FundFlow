package com.project.daisyDonation.document.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.auth.repository.UserRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.document.dto.DocumentListResponse;
import com.project.daisyDonation.document.dto.DocumentMetadataUpdateRequest;
import com.project.daisyDonation.document.dto.DocumentResponse;
import com.project.daisyDonation.document.dto.DocumentUploadedByResponse;
import com.project.daisyDonation.document.dto.DocumentVersionListResponse;
import com.project.daisyDonation.document.dto.DocumentVersionResponse;
import com.project.daisyDonation.document.entity.StoredDocument;
import com.project.daisyDonation.document.entity.StoredDocumentContent;
import com.project.daisyDonation.document.repository.StoredDocumentContentRepository;
import com.project.daisyDonation.document.repository.StoredDocumentRepository;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/csv",
            "text/plain");

    private final StoredDocumentRepository documentRepository;
    private final StoredDocumentContentRepository contentRepository;
    private final UserRepository userRepository;
    private final TenantSupport tenantSupport;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public DocumentListResponse list(
            UserPrincipal principal,
            String entityType,
            Long entityId,
            String category,
            String status,
            String query) {
        Long organizationId = tenantSupport.organizationId(principal);
        List<DocumentResponse> items = documentRepository
                .findByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(organizationId)
                .stream()
                .filter(document -> matches(document, entityType, entityId, category, status, query))
                .map(this::toResponse)
                .toList();
        return DocumentListResponse.builder()
                .items(items)
                .page(0)
                .totalPages(items.isEmpty() ? 0 : 1)
                .totalElements(items.size())
                .build();
    }

    @Transactional(readOnly = true)
    public DocumentResponse get(UserPrincipal principal, Long documentId) {
        return toResponse(requireDocument(principal, documentId));
    }

    @Transactional
    public DocumentResponse upload(
            UserPrincipal principal,
            MultipartFile file,
            String entityType,
            Long entityId,
            String category,
            String tagsJson,
            String changeNotes) {
        Organization organization = tenantSupport.organization(principal);
        byte[] bytes = readBytes(file);
        String mimeType = resolveMimeType(file);

        StoredDocument document = new StoredDocument();
        document.setOrganization(organization);
        document.setEntityType(normalizeEntityType(entityType));
        document.setEntityId(entityId);
        document.setName(safeFileName(file.getOriginalFilename()));
        document.setCategory(normalizeCategory(category));
        document.setMimeType(mimeType);
        document.setSizeBytes(bytes.length);
        document.setVersion(1);
        document.setStatus("ready");
        document.setUploadedByUserId(principal.getId());
        document.setChangeNotes(blankToNull(changeNotes));
        document.setTags(joinTags(parseTags(tagsJson)));
        StoredDocument saved = documentRepository.save(document);

        StoredDocumentContent content = new StoredDocumentContent();
        content.setDocument(saved);
        content.setContent(bytes);
        contentRepository.save(content);

        return toResponse(saved);
    }

    @Transactional
    public DocumentResponse uploadVersion(
            UserPrincipal principal, Long documentId, MultipartFile file, String changeNotes) {
        StoredDocument document = requireDocument(principal, documentId);
        if (!"ready".equals(document.getStatus())) {
            throw new BadRequestException("Only active documents can receive a new version");
        }
        byte[] bytes = readBytes(file);
        document.setName(safeFileName(file.getOriginalFilename()));
        document.setMimeType(resolveMimeType(file));
        document.setSizeBytes(bytes.length);
        document.setVersion(document.getVersion() + 1);
        document.setChangeNotes(blankToNull(changeNotes));
        document.setUploadedByUserId(principal.getId());
        documentRepository.save(document);

        StoredDocumentContent content = contentRepository.findByDocumentId(document.getId())
                .orElseGet(StoredDocumentContent::new);
        content.setDocument(document);
        content.setContent(bytes);
        contentRepository.save(content);

        return toResponse(document);
    }

    @Transactional
    public DocumentResponse updateMetadata(
            UserPrincipal principal, Long documentId, DocumentMetadataUpdateRequest request) {
        StoredDocument document = requireDocument(principal, documentId);
        if (request.getName() != null && !request.getName().isBlank()) {
            document.setName(request.getName().trim());
        }
        if (request.getCategory() != null) {
            document.setCategory(normalizeCategory(request.getCategory()));
        }
        if (request.getTags() != null) {
            document.setTags(joinTags(request.getTags()));
        }
        return toResponse(documentRepository.save(document));
    }

    @Transactional
    public DocumentResponse archive(UserPrincipal principal, Long documentId) {
        StoredDocument document = requireDocument(principal, documentId);
        document.setStatus("archived");
        return toResponse(documentRepository.save(document));
    }

    @Transactional
    public DocumentResponse delete(UserPrincipal principal, Long documentId) {
        StoredDocument document = requireDocument(principal, documentId);
        document.setDeleted(true);
        document.setStatus("deleted");
        return toResponse(documentRepository.save(document));
    }

    @Transactional(readOnly = true)
    public DocumentVersionListResponse versions(UserPrincipal principal, Long documentId) {
        StoredDocument document = requireDocument(principal, documentId);
        DocumentVersionResponse current = DocumentVersionResponse.builder()
                .version(document.getVersion())
                .documentId(String.valueOf(document.getId()))
                .name(document.getName())
                .sizeBytes(document.getSizeBytes())
                .mimeType(document.getMimeType())
                .uploadedBy(uploadedBy(document.getUploadedByUserId()))
                .uploadedAt(document.getUpdatedAt() != null ? document.getUpdatedAt() : document.getCreatedAt())
                .changeNotes(document.getChangeNotes())
                .current(true)
                .build();
        return DocumentVersionListResponse.builder()
                .documentId(String.valueOf(document.getId()))
                .currentVersion(document.getVersion())
                .versions(List.of(current))
                .build();
    }

    @Transactional(readOnly = true)
    public FileDownload download(UserPrincipal principal, Long documentId) {
        StoredDocument document = requireDocument(principal, documentId);
        StoredDocumentContent content = contentRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("File content not found"));
        return new FileDownload(document.getName(), document.getMimeType(), content.getContent());
    }

    public record FileDownload(String name, String mimeType, byte[] content) {
    }

    private StoredDocument requireDocument(UserPrincipal principal, Long documentId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return documentRepository.findByIdAndOrganizationIdAndDeletedFalse(documentId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    private boolean matches(
            StoredDocument document,
            String entityType,
            Long entityId,
            String category,
            String status,
            String query) {
        if (entityType != null && !entityType.isBlank() && !entityType.equalsIgnoreCase(document.getEntityType())) {
            return false;
        }
        if (entityId != null && (document.getEntityId() == null || !entityId.equals(document.getEntityId()))) {
            return false;
        }
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase(document.getCategory())) {
            return false;
        }
        if (status != null && !status.isBlank()) {
            if (!status.equalsIgnoreCase(document.getStatus())) {
                return false;
            }
        } else if ("deleted".equalsIgnoreCase(document.getStatus())) {
            return false;
        }
        if (query != null && !query.isBlank()) {
            String needle = query.toLowerCase(Locale.ROOT);
            String haystack = (document.getName() + " " + (document.getTags() == null ? "" : document.getTags()))
                    .toLowerCase(Locale.ROOT);
            return haystack.contains(needle);
        }
        return true;
    }

    private byte[] readBytes(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Choose a file to upload");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("File exceeds the 10 MB limit");
        }
        try {
            return file.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("Unable to read the uploaded file");
        }
    }

    private String resolveMimeType(MultipartFile file) {
        String type = file.getContentType();
        if (type == null || type.isBlank() || "application/octet-stream".equals(type)) {
            type = mimeFromName(file.getOriginalFilename());
        }
        if ("image/jpg".equals(type)) {
            type = "image/jpeg";
        }
        if (!ALLOWED_TYPES.contains(type)) {
            throw new BadRequestException("That file type is not supported");
        }
        return type;
    }

    private String mimeFromName(String filename) {
        if (filename == null) {
            return "application/octet-stream";
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".xlsx")) {
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
        if (lower.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        if (lower.endsWith(".csv")) return "text/csv";
        if (lower.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    private String normalizeEntityType(String entityType) {
        if (entityType == null || entityType.isBlank()) {
            throw new BadRequestException("entityType is required");
        }
        return entityType.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "other";
        }
        return category.trim().toLowerCase(Locale.ROOT);
    }

    private String safeFileName(String original) {
        if (original == null || original.isBlank()) {
            return "attachment";
        }
        return original.replace("\\", "/").substring(original.replace("\\", "/").lastIndexOf('/') + 1);
    }

    private List<String> parseTags(String tagsJson) {
        if (tagsJson == null || tagsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(tagsJson, new TypeReference<List<String>>() {});
        } catch (Exception ignored) {
            return Arrays.stream(tagsJson.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        }
    }

    private String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        return String.join(",", tags);
    }

    private List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private DocumentResponse toResponse(StoredDocument document) {
        return DocumentResponse.builder()
                .id(String.valueOf(document.getId()))
                .name(document.getName())
                .category(document.getCategory())
                .status(document.getStatus())
                .mimeType(document.getMimeType())
                .sizeBytes(document.getSizeBytes())
                .version(document.getVersion())
                .tags(splitTags(document.getTags()))
                .entityType(document.getEntityType())
                .entityId(document.getEntityId())
                .organizationId(document.getOrganization() != null ? document.getOrganization().getId() : null)
                .uploadedBy(uploadedBy(document.getUploadedByUserId()))
                .uploadedAt(document.getCreatedAt() != null ? document.getCreatedAt() : LocalDateTime.now())
                .updatedAt(document.getUpdatedAt())
                .changeNotes(document.getChangeNotes())
                .build();
    }

    private DocumentUploadedByResponse uploadedBy(Long userId) {
        if (userId == null) {
            return DocumentUploadedByResponse.builder().id(0L).name("Staff").build();
        }
        return userRepository.findByIdAndDeletedFalse(userId)
                .map(this::fullName)
                .orElse(DocumentUploadedByResponse.builder().id(userId).name("Staff").build());
    }

    private DocumentUploadedByResponse fullName(User user) {
        return DocumentUploadedByResponse.builder()
                .id(user.getId())
                .name((user.getFirstName() + " " + user.getLastName()).trim())
                .build();
    }
}
