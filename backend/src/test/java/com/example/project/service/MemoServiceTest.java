package com.example.project.service;

import com.example.project.memo.Memo;
import com.example.project.memo.MemoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemoServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private MemoRepository memoRepository;

    @InjectMocks
    private MemoService memoService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(memoService, "bucket", "test-bucket");
    }

    @Test
    void uploadImageUsesExplicitTitle() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "dummy".getBytes()
        );

        when(memoRepository.save(any(Memo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Memo result = memoService.uploadImage(file, "My Title");

        assertThat(result.getTitle()).isEqualTo("My Title");
        assertThat(result.getS3Key()).startsWith("memo/");
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();

        ArgumentCaptor<PutObjectRequest> putCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(putCaptor.capture(), any(software.amazon.awssdk.core.sync.RequestBody.class));
        assertThat(putCaptor.getValue().bucket()).isEqualTo("test-bucket");
        assertThat(putCaptor.getValue().key()).startsWith("memo/");
    }

    @Test
    void uploadImageFallsBackToFilenameWhenTitleMissing() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "note.png",
                "image/png",
                "dummy".getBytes()
        );

        when(memoRepository.save(any(Memo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Memo result = memoService.uploadImage(file, "");

        assertThat(result.getTitle()).isEqualTo("note.png");
    }

    @Test
    void listAllReturnsRepositoryValues() {
        List<Memo> memos = List.of(new Memo(), new Memo());
        when(memoRepository.findAll()).thenReturn(memos);

        List<Memo> result = memoService.listAll();

        assertThat(result).isSameAs(memos);
        verify(memoRepository).findAll();
    }

    @Test
    void updateTitleUpdatesValueAndTimestamp() {
        Memo memo = new Memo();
        memo.setTitle("Old");
        OffsetDateTime before = OffsetDateTime.now().minusDays(1);
        memo.setUpdatedAt(before);

        when(memoRepository.findById(1L)).thenReturn(Optional.of(memo));
        when(memoRepository.save(any(Memo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Memo result = memoService.updateTitle(1L, "New");

        assertThat(result.getTitle()).isEqualTo("New");
        assertThat(result.getUpdatedAt()).isAfter(before);
    }

    @Test
    void updateTitleThrowsWhenMissing() {
        when(memoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> memoService.updateTitle(99L, "New"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Not found");
    }

    @Test
    void deleteRemovesFromS3AndRepository() {
        Memo memo = new Memo();
        memo.setS3Key("memo/abc.png");

        when(memoRepository.findById(5L)).thenReturn(Optional.of(memo));

        memoService.delete(5L);

        ArgumentCaptor<DeleteObjectRequest> deleteCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(deleteCaptor.capture());
        assertThat(deleteCaptor.getValue().bucket()).isEqualTo("test-bucket");
        assertThat(deleteCaptor.getValue().key()).isEqualTo("memo/abc.png");

        verify(memoRepository).deleteById(5L);
    }
}
