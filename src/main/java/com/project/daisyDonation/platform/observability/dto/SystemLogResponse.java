package com.project.daisyDonation.platform.observability.dto;

import java.time.LocalDateTime;

import com.project.daisyDonation.platform.observability.entity.LogSeverity;
import com.project.daisyDonation.platform.observability.entity.LogType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Platform system log entry")
public class SystemLogResponse {

    private Long id;
    private LogType logType;
    private LogSeverity severity;
    private String category;
    private String message;
    private String details;
    private Long organizationId;
    private Long userId;
    private String userEmail;
    private String requestMethod;
    private String requestPath;
    private Integer httpStatus;
    private String exceptionType;
    private boolean alertResolved;
    private LocalDateTime createdAt;
}
