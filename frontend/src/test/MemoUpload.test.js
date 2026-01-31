import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import flushPromises from 'flush-promises';
import MemoUpload from '../components/MemoUpload.vue';
import { uploadImage, fetchMemos, deleteMemo, updateMemo } from '../api/memo';

vi.mock('../api/memo', () => ({
  uploadImage: vi.fn(),
  fetchMemos: vi.fn(),
  deleteMemo: vi.fn(),
  updateMemo: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MemoUpload', () => {
  it('loads and displays memos', async () => {
    fetchMemos.mockResolvedValue({
      data: [{ id: 1, title: 'Memo 1', updatedAt: '2024-01-01T00:00:00', s3Key: 'k' }]
    });

    const wrapper = mount(MemoUpload);

    await flushPromises();

    expect(wrapper.vm.memos[0].title).toBe('Memo 1');
  });

  it('uploads a memo and shows success message', async () => {
    fetchMemos.mockResolvedValue({ data: [] });
    uploadImage.mockResolvedValue({});

    const wrapper = mount(MemoUpload);
    await flushPromises();

    const file = new File(['abc'], 'note.png', { type: 'image/png' });
    wrapper.vm.selectedFile = file;
    wrapper.vm.newTitle = 'Title';

    await wrapper.vm.upload();

    expect(uploadImage).toHaveBeenCalled();
    expect(wrapper.vm.snackMsg).toBe('アップロードに成功しました');
  });

  it('removes a memo from list', async () => {
    fetchMemos.mockResolvedValue({
      data: [{ id: 5, title: 'Memo', updatedAt: '2024-01-01T00:00:00', s3Key: 'k' }]
    });
    deleteMemo.mockResolvedValue({});

    const wrapper = mount(MemoUpload);
    await flushPromises();

    await wrapper.vm.remove(5);

    expect(deleteMemo).toHaveBeenCalledWith(5);
    expect(wrapper.vm.memos.length).toBe(0);
  });

  it('updates memo title', async () => {
    updateMemo.mockResolvedValue({});
    fetchMemos.mockResolvedValueOnce({
      data: [{ id: 7, title: 'Old', updatedAt: '2024-01-01T00:00:00', s3Key: 'k' }]
    }).mockResolvedValueOnce({
      data: [{ id: 7, title: 'New', updatedAt: '2024-01-02T00:00:00', s3Key: 'k' }]
    });

    const wrapper = mount(MemoUpload);
    await flushPromises();

    const memo = wrapper.vm.memos[0];
    memo.titleLocal = 'New';

    await wrapper.vm.saveTitle(memo);

    expect(updateMemo).toHaveBeenCalledWith(7, { title: 'New' });
    expect(wrapper.vm.snackMsg).toBe('タイトルを更新しました');
  });
});
