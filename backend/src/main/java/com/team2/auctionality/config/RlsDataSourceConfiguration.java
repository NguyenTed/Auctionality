package com.team2.auctionality.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DelegatingDataSource;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Configuration to wrap DataSource with RLS support.
 * Uses BeanPostProcessor to wrap the auto-configured DataSource.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class RlsDataSourceConfiguration {
    private final RlsSessionVariableService rlsService;

    /**
     * BeanPostProcessor to wrap DataSource with RLS support.
     * This intercepts the DataSource bean creation and wraps it.
     */
    @Bean
    public BeanPostProcessor dataSourcePostProcessor() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
                // Only wrap the primary DataSource bean (not HikariPoolMXBean, etc.)
                if (bean instanceof DataSource && !(bean instanceof DelegatingDataSource) 
                    && beanName.equals("dataSource")) {
                    log.info("Wrapping DataSource with RLS support");
                    return new RlsDataSourceWrapper((DataSource) bean, rlsService);
                }
                return bean;
            }
        };
    }

    /**
     * DataSource wrapper that sets RLS session variables.
     */
    @Slf4j
    @RequiredArgsConstructor
    static class RlsDataSourceWrapper extends DelegatingDataSource {
        private final RlsSessionVariableService rlsService;

        public RlsDataSourceWrapper(DataSource targetDataSource, RlsSessionVariableService rlsService) {
            super(targetDataSource);
            this.rlsService = rlsService;
        }

        @Override
        public Connection getConnection() throws SQLException {
            Connection connection = super.getConnection();
            setRlsVariables(connection);
            return connection;
        }

        @Override
        public Connection getConnection(String username, String password) throws SQLException {
            Connection connection = super.getConnection(username, password);
            setRlsVariables(connection);
            return connection;
        }

        private void setRlsVariables(Connection connection) {
            // Set RLS variables when in a transaction
            // For non-transactional operations, set immediately
            if (TransactionSynchronizationManager.isActualTransactionActive()) {
                // Use a resource flag to ensure we only set once per transaction
                String resourceKey = "rls.set." + connection.hashCode();
                if (!TransactionSynchronizationManager.hasResource(resourceKey)) {
                    TransactionSynchronizationManager.bindResource(resourceKey, true);
                    rlsService.setSessionVariables(connection);
                }
            } else {
                // For non-transactional operations, set immediately
                rlsService.setSessionVariables(connection);
            }
        }
    }
}

