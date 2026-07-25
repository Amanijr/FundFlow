package com.project.daisyDonation.communication.service.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.project.daisyDonation.communication.entity.CommunicationChannel;

@Component
public class EmailChannelSender implements ChannelSender {

    private static final Logger log = LoggerFactory.getLogger(EmailChannelSender.class);

    @Override
    public CommunicationChannel channel() {
        return CommunicationChannel.EMAIL;
    }

    @Override
    public void send(String recipient, String subject, String body) {
        log.info("EMAIL sent to {} | subject: {} | body: {}", recipient, subject, body);
    }
}
