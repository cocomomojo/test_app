import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import flushPromises from 'flush-promises';
import TodoList from '../components/TodoList.vue';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todo';

vi.mock('../api/todo', () => ({
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

  it('displays incomplete count', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: false },
        { id: 2, title: 'Task 2', done: true },
        { id: 3, title: 'Task 3', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    expect(wrapper.text()).toContain('未完了: 2');
  });

  it('filters todos by incomplete', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: false },
        { id: 2, title: 'Task 2', done: true },
        { id: 3, title: 'Task 3', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const incompleteButton = wrapper.findAll('button').find(b => b.text() === '未完了');
    await incompleteButton.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Task 1');
    expect(wrapper.text()).not.toContain('Task 2');
    expect(wrapper.text()).toContain('Task 3');
  });

  it('filters todos by complete', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: false },
        { id: 2, title: 'Task 2', done: true },
        { id: 3, title: 'Task 3', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const completeButton = wrapper.findAll('button').find(b => b.text() === '完了');
    await completeButton.trigger('click');
    await flushPromises();

    expect(wrapper.text()).not.toContain('Task 1');
    expect(wrapper.text()).toContain('Task 2');
    expect(wrapper.text()).not.toContain('Task 3');
  });

  it('shows all todos when filter is set to all', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: false },
        { id: 2, title: 'Task 2', done: true },
        { id: 3, title: 'Task 3', done: false }
      ]
    });

    const wrapper = mount(TodoList);
    await flushPromises();

    const allButton = wrapper.findAll('button').find(b => b.text() === 'すべて');
    await allButton.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Task 1');
    expect(wrapper.text()).toContain('Task 2');
    expect(wrapper.text()).toContain('Task 3');
  });

  it('updates incomplete count when todo is toggled', async () => {
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: false },
        { id: 2, title: 'Task 2', done: false }
      ]
    });
    updateTodo.mockResolvedValue({});

    const wrapper = mount(TodoList);
    await flushPromises();

    expect(wrapper.text()).toContain('未完了: 2');

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);
    await flushPromises();

    // After toggling, the data would be reloaded with updated state
    fetchTodos.mockResolvedValue({
      data: [
        { id: 1, title: 'Task 1', done: true },
        { id: 2, title: 'Task 2', done: false }
      ]
    });
    await flushPromises();

    expect(wrapper.text()).toContain('未完了: 1');
  });
});
