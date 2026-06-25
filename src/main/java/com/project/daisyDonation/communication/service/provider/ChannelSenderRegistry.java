package com.project.daisyDonation.communication.service.provider;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.project.daisyDonation.communication.entity.CommunicationChannel;
import com.project.daisyDonation.common.exception.BadRequestException;

@Component
public class ChannelSenderRegistry {

    private final Map<CommunicationChannel, ChannelSender> senders;

    public ChannelSenderRegistry(List<ChannelSender> channelSenders) {
        senders = new EnumMap<>(CommunicationChannel.class);
        for (ChannelSender sender : channelSenders) {
            senders.put(sender.channel(), sender);
        }
    }

    public ChannelSender get(CommunicationChannel channel) {
        ChannelSender sender = senders.get(channel);
        if (sender == null) {
            throw new BadRequestException("Unsupported communication channel: " + channel);
        }
        return sender;
    }
}
