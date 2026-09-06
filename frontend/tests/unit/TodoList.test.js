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
});
