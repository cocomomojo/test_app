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

  describe('Filter functionality', () => {
    it('displays filter tabs', async () => {
      fetchTodos.mockResolvedValue({ data: [] });

      const wrapper = mount(TodoList);
      await flushPromises();

      expect(wrapper.find('[data-testid="filter-all"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="filter-incomplete"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="filter-complete"]').exists()).toBe(true);
    });

    it('displays all todos by default (all filter)', async () => {
      fetchTodos.mockResolvedValue({
        data: [
          { id: 1, title: 'Incomplete', done: false },
          { id: 2, title: 'Complete', done: true }
        ]
      });

      const wrapper = mount(TodoList);
      await flushPromises();

      expect(wrapper.findAll('[data-testid^="todo-item-"]').length).toBe(2);
    });

    it('filters to show only incomplete todos', async () => {
      fetchTodos.mockResolvedValue({
        data: [
          { id: 1, title: 'Incomplete', done: false },
          { id: 2, title: 'Complete', done: true }
        ]
      });

      const wrapper = mount(TodoList);
      await flushPromises();

      const incompleteFilter = wrapper.find('[data-testid="filter-incomplete"]');
      await incompleteFilter.trigger('click');
      await wrapper.vm.$nextTick();

      const items = wrapper.findAll('[data-testid^="todo-item-"]');
      expect(items.length).toBe(1);
      expect(items[0].text()).toContain('Incomplete');
    });

    it('filters to show only complete todos', async () => {
      fetchTodos.mockResolvedValue({
        data: [
          { id: 1, title: 'Incomplete', done: false },
          { id: 2, title: 'Complete', done: true }
        ]
      });

      const wrapper = mount(TodoList);
      await flushPromises();

      const completeFilter = wrapper.find('[data-testid="filter-complete"]');
      await completeFilter.trigger('click');
      await wrapper.vm.$nextTick();

      const items = wrapper.findAll('[data-testid^="todo-item-"]');
      expect(items.length).toBe(1);
      expect(items[0].text()).toContain('Complete');
    });

    it('highlights selected filter tab', async () => {
      fetchTodos.mockResolvedValue({ data: [] });

      const wrapper = mount(TodoList);
      await flushPromises();

      // テスト: チップが存在し、クリックで状態が変わることを確認
      const incompleteFilter = wrapper.find('[data-testid="filter-incomplete"]');
      expect(incompleteFilter.exists()).toBe(true);

      // incompleteFilterをクリック
      await incompleteFilter.trigger('click');
      await wrapper.vm.$nextTick();

      // currentFilterが更新されることを確認
      expect(wrapper.vm.currentFilter).toBe('incomplete');

      // completeFilterをクリック
      const completeFilter = wrapper.find('[data-testid="filter-complete"]');
      await completeFilter.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentFilter).toBe('complete');
    });
  });
});

