package com.project.daisyDonation.communication.service.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.project.daisyDonation.communication.entity.CommunicationChannel;

@Component
public class WhatsAppChannelSender implements ChannelSender {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppChannelSender.class);

    @Override
    public CommunicationChannel channel() {
        return CommunicationChannel.WHATSAPP;
    }

    @Override
    public void send(String recipient, String subject, String body) {
        log.info("WHATSAPP sent to {} | message: {}", recipient, body);
    }
}
