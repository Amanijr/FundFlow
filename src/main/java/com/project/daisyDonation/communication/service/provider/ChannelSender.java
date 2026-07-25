package com.project.daisyDonation.communication.service.provider;

import com.project.daisyDonation.communication.entity.CommunicationChannel;

public interface ChannelSender {

    CommunicationChannel channel();

    void send(String recipient, String subject, String body);
}
