package com.example.project.service;

import com.example.project.memo.Memo;
import com.example.project.memo.MemoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MemoService {

    private final S3Client s3Client;
    private final MemoRepository memoRepository;

    @Value("${aws.s3.bucket}")
    private String bucket;

    public MemoService(S3Client s3Client, MemoRepository memoRepository) {
        this.s3Client = s3Client;
        this.memoRepository = memoRepository;
    }

    public Memo uploadImage(MultipartFile file, String title) throws IOException {

        String key = "memo/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(
                putObjectRequest,
                software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes())
        );

        Memo memo = new Memo();
        memo.setS3Key(key);
        // prefer explicit title when provided
        if (title != null && !title.isEmpty()) {
            memo.setTitle(title);
        } else {
            memo.setTitle(file.getOriginalFilename());
        }
        memo.setCreatedAt(OffsetDateTime.now());
        memo.setUpdatedAt(OffsetDateTime.now());

        return memoRepository.save(memo);
    }

    public List<Memo> listAll() {
        return memoRepository.findAll();
    }

    public Memo updateTitle(Long id, String title) {
        Memo m = memoRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        m.setTitle(title);
        m.setUpdatedAt(OffsetDateTime.now());
        return memoRepository.save(m);
    }

    public void delete(Long id) {
        Memo m = memoRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));

        // delete from s3
        DeleteObjectRequest del = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(m.getS3Key())
                .build();
        s3Client.deleteObject(del);

        memoRepository.deleteById(id);
    }
}