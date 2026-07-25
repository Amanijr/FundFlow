package com.project.daisyDonation.common.config;

import java.util.concurrent.Executor;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.core.task.SyncTaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;

@TestConfiguration
@EnableAsync
public class SyncAsyncTestConfig {

    @Bean(name = {"taskExecutor", "applicationTaskExecutor"})
    @Primary
    public Executor syncExecutor() {
        return new SyncTaskExecutor();
    }
}
