package com.example.project.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;

@Component
public class S3BucketInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(S3BucketInitializer.class);

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    public S3BucketInitializer(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            log.info("S3 bucket '{}' created", bucket);
        } catch (BucketAlreadyOwnedByYouException | BucketAlreadyExistsException e) {
            log.info("S3 bucket '{}' already exists", bucket);
        } catch (Exception e) {
            log.warn("Could not initialize S3 bucket '{}': {}", bucket, e.getMessage());
        }
    }
}
