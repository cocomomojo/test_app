package com.example.project.controller;

import com.example.project.memo.Memo;
import com.example.project.service.MemoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MemoController.class)
@AutoConfigureMockMvc(addFilters = false)
class MemoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MemoService memoService;

    @Test
    void listReturnsMemos() throws Exception {
        Memo memo = new Memo();
        memo.setId(1L);
        memo.setTitle("Note");

        when(memoService.listAll()).thenReturn(List.of(memo));

        mockMvc.perform(get("/memo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Note"));
    }

    @Test
    void uploadReturnsMemoOnSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "abc".getBytes()
        );
        Memo memo = new Memo();
        memo.setId(2L);
        memo.setTitle("My Title");

        when(memoService.uploadImage(any(), eq("My Title"))).thenReturn(memo);

        mockMvc.perform(multipart("/memo/upload")
                        .file(file)
                        .param("title", "My Title"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2L))
                .andExpect(jsonPath("$.title").value("My Title"));
    }

    @Test
    void uploadReturnsErrorOnFailure() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "abc".getBytes()
        );

        when(memoService.uploadImage(any(), any())).thenThrow(new RuntimeException("boom"));

        mockMvc.perform(multipart("/memo/upload")
                        .file(file)
                        .param("title", "My Title"))
                .andExpect(status().is5xxServerError())
                .andExpect(content().string("Upload failed: boom"));
    }

    @Test
    void updateReturnsBadRequestOnFailure() throws Exception {
        when(memoService.updateTitle(eq(1L), any())).thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(put("/memo/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"New\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Not found"));
    }

    @Test
    void deleteReturnsNoContentOnSuccess() throws Exception {
        mockMvc.perform(delete("/memo/1"))
                .andExpect(status().isNoContent());

        verify(memoService).delete(1L);
    }
}
