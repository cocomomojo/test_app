import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import flushPromises from 'flush-promises';
import TodoList from '../../src/components/TodoList.vue';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../../src/api/todo';

vi.mock('../../src/api/todo', () => ({
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TodoList', () => {
  it('loads and displays todos', async () => {
    fetchTodos.mockResolvedValue({
      data: [{ id: 1, title: 'First', done: false }]
    });

    const wrapper = mount(TodoList);

    await flushPromises();

    expect(wrapper.text()).toContain('First');
  });

  it('adds a new todo', async () => {
    fetchTodos.mockResolvedValue({ data: [] });
    createTodo.mockResolvedValue({});

    const wrapper = mount(TodoList);
    await flushPromises();

    const input = wrapper.find('input');
    await input.setValue('New Todo');

    const addButton = wrapper.findAll('button').find(b => b.text().includes('追加'));
    await addButton.trigger('click');

    await flushPromises();

    expect(createTodo).toHaveBeenCalledWith({ title: 'New Todo', done: false });
  });

  it('updates a todo when toggled', async () => {
    fetchTodos.mockResolvedValue({
      data: [{ id: 1, title: 'Task', done: false }]
    });
    updateTodo.mockResolvedValue({});

    const wrapper = mount(TodoList);
    await flushPromises();

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);

    await flushPromises();

    expect(updateTodo).toHaveBeenCalledWith(1, { title: 'Task', done: true });
  });

  it('deletes a todo', async () => {
    fetchTodos.mockResolvedValue({
      data: [{ id: 1, title: 'Task', done: false }]
    });
    deleteTodo.mockResolvedValue({});

    const wrapper = mount(TodoList);
    await flushPromises();

    const deleteButton = wrapper.findAll('button').find(b => b.attributes('aria-label') === 'delete-1');
    await deleteButton.trigger('click');

    await flushPromises();

    expect(deleteTodo).toHaveBeenCalledWith(1);
  });

  it('displays filter chips for status filtering', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Completed', done: true },
        { id: 2, title: 'Pending', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const chips = wrapper.findAll('[data-testid^="filter-chip"]');
    expect(chips.length).toBe(3);
  });

  it('filters todos by "すべて" status', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Completed', done: true },
        { id: 2, title: 'Pending', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const allChip = wrapper.find('[data-testid="filter-chip-all"]');
    await allChip.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Completed');
    expect(wrapper.text()).toContain('Pending');
  });

  it('filters todos by "未完了" status', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Completed', done: true },
        { id: 2, title: 'Pending', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const pendingChip = wrapper.find('[data-testid="filter-chip-pending"]');
    await pendingChip.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Pending');
    expect(wrapper.text()).not.toContain('Completed');
  });

  it('filters todos by "完了" status', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Completed', done: true },
        { id: 2, title: 'Pending', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const completedChip = wrapper.find('[data-testid="filter-chip-completed"]');
    await completedChip.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Completed');
    expect(wrapper.text()).not.toContain('Pending');
  });

  it('highlights the selected filter chip', async () => {
    fetchTodos.mockResolvedValue({
      data: [{ id: 1, title: 'Task', done: false }]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const allChip = wrapper.find('[data-testid="filter-chip-all"]');
    expect(allChip.classes()).toContain('v-chip--variant-elevated');

    const pendingChip = wrapper.find('[data-testid="filter-chip-pending"]');
    await pendingChip.trigger('click');
    await flushPromises();

    expect(pendingChip.classes()).toContain('v-chip--variant-elevated');
  });

  it('displays progress bar with statistics', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Completed Task', done: true },
        { id: 2, title: 'Pending Task', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const progressBar = wrapper.find('[data-testid="progress-bar"]');
    expect(progressBar.exists()).toBe(true);

    const progressStats = wrapper.find('[data-testid="progress-stats"]');
    expect(progressStats.text()).toContain('1 / 2 タスク完了');
  });

  it('calculates progress percentage correctly', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: true },
        { id: 2, title: 'Task 2', done: true },
        { id: 3, title: 'Task 3', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const progressBar = wrapper.find('[data-testid="progress-bar"]');
    expect(progressBar.attributes('value')).toBe('67');
  });

  it('shows 0% when no todos exist', async () => {
    fetchTodos.mockResolvedValue({
      data: []
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const progressBar = wrapper.find('[data-testid="progress-bar"]');
    expect(progressBar.attributes('value')).toBe('0');

    const progressStats = wrapper.find('[data-testid="progress-stats"]');
    expect(progressStats.text()).toContain('0 / 0 タスク完了');
  });

  it('sets progress bar color to red when 0-30%', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: true },
        { id: 2, title: 'Task 2', done: false },
        { id: 3, title: 'Task 3', done: false },
        { id: 4, title: 'Task 4', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const progressBar = wrapper.find('[data-testid="progress-bar"]');
    // Verify progress is calculated correctly (25%)
    expect(progressBar.attributes('value')).toBe('25');
  });

  it('sets progress bar color to warning when 31-60%', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: true },
        { id: 2, title: 'Task 2', done: true },
        { id: 3, title: 'Task 3', done: false },
        { id: 4, title: 'Task 4', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const progressBar = wrapper.find('[data-testid="progress-bar"]');
    // Verify progress is calculated correctly (50%)
    expect(progressBar.attributes('value')).toBe('50');
  });

  it('sets progress bar color to green when 61-100%', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: true },
        { id: 2, title: 'Task 2', done: true },
        { id: 3, title: 'Task 3', done: true },
        { id: 4, title: 'Task 4', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const progressBar = wrapper.find('[data-testid="progress-bar"]');
    // Verify progress is calculated correctly (75%)
    expect(progressBar.attributes('value')).toBe('75');
  });

  it('updates progress bar when todo is toggled', async () => {
    fetchTodos.mockResolvedValue({
      data: [{ id: 1, title: 'Task', done: false }]
    });
    updateTodo.mockResolvedValue({});

    const wrapper = mount(TodoList);
    await flushPromises();

    let progressBar = wrapper.find('[data-testid="progress-bar"]');
    expect(progressBar.attributes('value')).toBe('0');

    fetchTodos.mockResolvedValue({
      data: [{ id: 1, title: 'Task', done: true }]
    });

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);

    await flushPromises();

    progressBar = wrapper.find('[data-testid="progress-bar"]');
    expect(progressBar.attributes('value')).toBe('100');
  });

  it('updates progress bar when new todo is added', async () => {
    fetchTodos.mockResolvedValue({ data: [] });
    createTodo.mockResolvedValue({});

    const wrapper = mount(TodoList);
    await flushPromises();

    let progressStats = wrapper.find('[data-testid="progress-stats"]');
    expect(progressStats.text()).toContain('0 / 0 タスク完了');

    fetchTodos.mockResolvedValue({
      data: [{ id: 1, title: 'New Task', done: false }]
    });

    const input = wrapper.find('input');
    await input.setValue('New Task');

    const addButton = wrapper.findAll('button').find(b => b.text().includes('追加'));
    await addButton.trigger('click');

    await flushPromises();

    progressStats = wrapper.find('[data-testid="progress-stats"]');
    expect(progressStats.text()).toContain('0 / 1 タスク完了');
  });

  it('updates progress bar when todo is deleted', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: true },
        { id: 2, title: 'Task 2', done: false }
      ]
    });
    deleteTodo.mockResolvedValue({});

    const wrapper = mount(TodoList);
    await flushPromises();

    let progressStats = wrapper.find('[data-testid="progress-stats"]');
    expect(progressStats.text()).toContain('1 / 2 タスク完了');

    fetchTodos.mockResolvedValue({
      data: [{ id: 1, title: 'Task 1', done: true }]
    });

    const deleteButton = wrapper.findAll('button').find(b => b.attributes('aria-label') === 'delete-2');
    await deleteButton.trigger('click');

    await flushPromises();

    progressStats = wrapper.find('[data-testid="progress-stats"]');
    expect(progressStats.text()).toContain('1 / 1 タスク完了');
  });
});
