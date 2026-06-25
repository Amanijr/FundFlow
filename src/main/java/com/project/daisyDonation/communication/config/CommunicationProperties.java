package com.project.daisyDonation.communication.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import com.project.daisyDonation.communication.entity.CommunicationChannel;

import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "communication")
@Getter
@Setter
public class CommunicationProperties {

    private boolean autoReceiptEnabled = true;
    private CommunicationChannel defaultReceiptChannel = CommunicationChannel.EMAIL;
}
